import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, request, jsonify
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
    usuario = get_jwt_identity()

    if not usuario:
        return jsonify({"erro": "Usuário não autenticado!"}), 401

    pessoas = data.get("pessoas")
    mesas = data.get("mesas")  

    if not pessoas or not mesas:
        return jsonify({"erro": "Campos 'pessoas' e 'mesas' são obrigatórios!"}), 400

    if not isinstance(mesas, list):
        return jsonify({"erro": "Campo 'mesas' deve ser uma lista."}), 400

    capacidade_total = 0
    mesas_info = []

    try:
        # -----------------------------
        # Validar mesas individualmente
        # -----------------------------
        for numero in mesas:
            try:
                res = requests.get(f"{API_MESAS}/mesa/{numero}", timeout=5)
            except requests.RequestException as e:
                return jsonify({"erro": f"Erro ao conectar com a mesa {numero}: {str(e)}"}), 500

            if res.status_code != 200:
                return jsonify({"erro": f"Mesa {numero} não encontrada. Status {res.status_code}"}), 404

            try:
                mesa = res.json()
            except Exception as e:
                return jsonify({"erro": f"Resposta inválida da mesa {numero}: {str(e)}"}), 500

            if mesa.get("status") != "livre":
                return jsonify({"erro": f"Mesa {numero} está ocupada."}), 409

            capacidade_total += mesa.get("capacidade", 0)
            mesas_info.append(mesa)

        # -----------------------------
        # Verifica capacidade total
        # -----------------------------
        if capacidade_total < pessoas:
            return jsonify({
                "erro": f"Mesas selecionadas somam {capacidade_total} lugares, mas são necessários {pessoas}."
            }), 400

        # -----------------------------
        # Atualizar status das mesas
        # -----------------------------
        for numero in mesas:
            try:
                upd = requests.put(
                    f"{API_MESAS}/mesa/{numero}/status",
                    json={"status": "reservada"},
                    timeout=5
                )
            except requests.RequestException as e:
                return jsonify({"erro": f"Erro ao atualizar mesa {numero}: {str(e)}"}), 500

            if upd.status_code != 200:
                resp = upd.json() if upd.content else {}
                return jsonify({
                    "erro": f"Falha ao atualizar mesa {numero}.",
                    "detalhe": resp
                }), 500

        # -----------------------------
        # Criar reserva no banco
        # -----------------------------
        nova = Reserva(
            usuario_id=int(usuario),  # converte string para inteiro
            mesas=",".join(str(m) for m in mesas),
            capacidade=pessoas
        )

        db.session.add(nova)
        db.session.commit()

        return jsonify({
            "mensagem": "Reserva criada!",
            "reserva": {
                "id": nova.id,
                "mesas": mesas,
                "capacidade": pessoas,
                "status": nova.status
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


# --------------------------------------------
# CANCELAR RESERVA
# --------------------------------------------
@reserva_bp.route("/cancelar/<int:id>", methods=["PUT"])
@jwt_required()
def cancelar_reserva(id):
    usuario = get_jwt_identity()

    reserva = Reserva.query.filter_by(id=id, usuario_id=usuario["id"]).first()

    if not reserva:
        return jsonify({"erro": "Reserva não encontrada."}), 404

    try:
        mesas = reserva.mesas.split(",")

        # Libera mesas
        for mesa in mesas:
            requests.put(
                f"{API_MESAS}/mesa/{mesa}/status",
                json={"status": "livre"}
            )

        reserva.status = "cancelada"
        db.session.commit()

        return jsonify({"mensagem": "Reserva cancelada!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
