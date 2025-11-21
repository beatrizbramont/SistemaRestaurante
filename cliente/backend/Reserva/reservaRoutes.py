import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, request, jsonify
from datetime import datetime
import requests
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db
from Reserva.reservaModel import Reserva
from flask_cors import CORS

reserva_bp = Blueprint("reserva_bp", __name__, url_prefix="/reservas")
CORS(reserva_bp, resources={r"*": {"origins": "*"}})

# API correta da porta 8001
API_MESAS = "http://127.0.0.1:8001"


# --------------------------------------------
# COMPATIBILIDADE (POST + OPTIONS CORS)
# --------------------------------------------
@reserva_bp.route('', methods=['POST', 'OPTIONS'])
def criar_reserva_compat():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    return criar_reserva()


# --------------------------------------------
# LISTAR MESAS DISPONÍVEIS
# --------------------------------------------
@reserva_bp.route("/disponiveis", methods=["GET"])
@jwt_required()
def listar_mesas_disponiveis():
    pessoas = int(request.args.get("pessoas", 0))

    try:
        resposta = requests.get(f"{API_MESAS}/mesas/disponiveis?capacidade={pessoas}")

        if resposta.status_code != 200:
            return jsonify({"erro": "Erro ao buscar mesas."}), 500

        mesas = resposta.json()

        mesas_disponiveis = [m for m in mesas if m["status"] == "livre"]

        if not mesas_disponiveis:
            return jsonify({"mensagem": "Nenhuma mesa disponível."}), 404

        return jsonify({
            "mensagem": "Mesas disponíveis.",
            "mesas": mesas_disponiveis
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
@reserva_bp.route("/criar", methods=["POST"])
@jwt_required()
def criar_reserva():
    data = request.get_json()
    usuario_id = get_jwt_identity()

    pessoas = data.get("pessoas")
    mesas = data.get("mesas")
    data_hora_str = data.get("data_reserva")  # ex: "2025-11-21T14:47:00"

    if not pessoas or not mesas or not data_hora_str:
        return jsonify({"erro": "Campos 'pessoas', 'mesas' e 'data_reserva' são obrigatórios!"}), 400

    if not isinstance(mesas, list):
        return jsonify({"erro": "Campo 'mesas' deve ser uma lista."}), 400

    try:
        data_hora_dt = datetime.fromisoformat(data_hora_str)
    except ValueError:
        return jsonify({"erro": "Formato de data/hora inválido. Use YYYY-MM-DDTHH:MM:SS"}), 400

    try:
        nova_reserva = Reserva(
            usuario_id=int(usuario_id),
            mesas=",".join(str(m) for m in mesas),
            capacidade=pessoas,
            data_reserva=data_hora_dt
        )
        db.session.add(nova_reserva)
        db.session.commit()

        return jsonify({
            "mensagem": "Reserva criada!",
            "reserva": {
                "id": nova_reserva.id,
                "mesas": mesas,
                "capacidade": pessoas,
                "status": nova_reserva.status,
                "data_reserva": nova_reserva.data_reserva.strftime("%Y-%m-%dT%H:%M:%S")
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro inesperado ao criar reserva: {str(e)}"}), 500
@reserva_bp.route("/minhas", methods=["GET"])
@jwt_required()
def minhas_reservas():
    usuario_id = int(get_jwt_identity())

    reservas = Reserva.query.filter_by(usuario_id=usuario_id).all()

    return jsonify([
        {
            "id": r.id,
            "mesas": r.mesas.split(","),
            "capacidade": r.capacidade,
            "status": r.status,
            "data": r.data_reserva.strftime("%d/%m/%Y %H:%M")
        }
        for r in reservas
    ])


@reserva_bp.route("/cancelar/<int:id>", methods=["PUT"])
@jwt_required()
def cancelar_reserva(id):
    usuario_id = int(get_jwt_identity())

    reserva = Reserva.query.filter_by(id=id, usuario_id=usuario_id).first()

    if not reserva:
        return jsonify({"erro": "Reserva não encontrada."}), 404

    try:
        mesas = reserva.mesas.split(",")

        # Liberar mesas
        for mesa in mesas:
            requests.put(
                f"{API_MESAS}/mesa/{mesa}/status",
                json={"status": "livre"}
            )

        # Remove do banco
        db.session.delete(reserva)
        db.session.commit()

        return jsonify({"mensagem": "Reserva cancelada e removida!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500

