import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, request, jsonify
import requests
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db
from Reserva.reservaModel import Reserva

reserva_bp = Blueprint('reserva_bp', __name__, url_prefix='/reservas')

API_MESAS = "http://127.0.0.1:8001/mesas"  

@reserva_bp.route('/disponiveis', methods=['GET'])
@jwt_required()
def listar_mesas_disponiveis():
    pessoas = int(request.args.get('pessoas', 0))

    try:
        resposta = requests.get(f"{API_MESAS}/disponiveis?capacidade={pessoas}")
        mesas = resposta.json()

        mesas_disponiveis = [
            m for m in mesas if m['status'] == 'livre'
        ]

        if not mesas_disponiveis:
            return jsonify({"mensagem": "Nenhuma mesa disponível."}), 404

        return jsonify({
            "mensagem": "Mesas disponíveis.",
            "mesas": mesas_disponiveis
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@reserva_bp.route('/criar', methods=['POST'])
@jwt_required()
def criar_reserva():
    data = request.get_json()
    usuario = get_jwt_identity()

    pessoas = data.get("pessoas")
    mesas = data.get("mesas")  # agora sempre lista

    if not pessoas or not mesas:
        return jsonify({"erro": "Quantidade de pessoas e mesas são obrigatórias!"}), 400

    if not isinstance(mesas, list):
        return jsonify({"erro": "O campo 'mesas' deve ser uma lista."}), 400

    try:
        capacidade_total = 0
        mesas_validas = []

        # 🔎 Validar cada mesa no sistema interno
        for numero in mesas:
            res = requests.get(f"{API_MESAS}/{numero}")

            if res.status_code != 200:
                return jsonify({"erro": f"Mesa {numero} não existe."}), 404

            info = res.json()

            if info['status'] != 'livre':
                return jsonify({"erro": f"Mesa {numero} está ocupada."}), 409

            capacidade_total += info['capacidade']
            mesas_validas.append(info)

        # ❗ Capacidade total insuficiente
        if capacidade_total < pessoas:
            return jsonify({
                "erro": f"As mesas selecionadas somam {capacidade_total} lugares, abaixo do necessário ({pessoas})."
            }), 400

        # 🔄 Atualizar status das mesas no sistema interno
        for numero in mesas:
            upd = requests.put(
                f"{API_MESAS}/{numero}/status",
                json={"status": "reservada"}
            )
            if upd.status_code != 200:
                return jsonify({"erro": f"Falha ao atualizar mesa {numero}."}), 500

        # 📝 Registrar reserva localmente
        nova = Reserva(
            usuario_id=usuario['id'],
            mesas=",".join(str(m) for m in mesas),
            capacidade=pessoas
        )

        db.session.add(nova)
        db.session.commit()

        return jsonify({
            "mensagem": "Reserva criada com sucesso!",
            "reserva": {
                "id": nova.id,
                "mesas": mesas,
                "capacidade": pessoas,
                "status": nova.status
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500

@reserva_bp.route('/minhas', methods=['GET'])
@jwt_required()
def minhas_reservas():
    usuario = get_jwt_identity()

    reservas = Reserva.query.filter_by(usuario_id=usuario["id"]).all()

    return jsonify([
        {
            "id": r.id,
            "mesas": r.mesas.split(","),
            "capacidade": r.capacidade,
            "status": r.status,
            "data": r.data_reserva.strftime('%d/%m/%Y %H:%M')
        } for r in reservas
    ])

@reserva_bp.route('/cancelar/<int:id>', methods=['PUT'])
@jwt_required()
def cancelar_reserva(id):
    usuario = get_jwt_identity()

    reserva = Reserva.query.filter_by(id=id, usuario_id=usuario["id"]).first()

    if not reserva:
        return jsonify({"erro": "Reserva não encontrada."}), 404

    try:
        mesas = reserva.mesas.split(",")

        # 🔄 Atualizar mesas na API interna → voltar para "livre"
        for mesa in mesas:
            requests.put(
                f"{API_MESAS}/{mesa}/status",
                json={"status": "livre"}
            )

        reserva.status = "cancelada"
        db.session.commit()

        return jsonify({"mensagem": "Reserva cancelada com sucesso!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
