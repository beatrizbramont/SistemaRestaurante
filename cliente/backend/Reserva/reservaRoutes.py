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
            m for m in mesas if m['status'] == 'livre' and m['capacidade'] >= pessoas
        ]

        if not mesas_disponiveis:
            return jsonify({"mensagem": "Nenhuma mesa disponível para essa quantidade de pessoas."}), 404

        return jsonify({
            "mensagem": "Mesas disponíveis encontradas.",
            "mesas": mesas_disponiveis
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@reserva_bp.route('/criar', methods=['POST'])
@jwt_required()
def criar_reserva():
    data = request.get_json()
    usuario = get_jwt_identity()
    mesa_numero = data.get('mesa_numero')
    capacidade = data.get('capacidade')

    if not mesa_numero or not capacidade:
        return jsonify({'erro': 'Número e capacidade da mesa são obrigatórios!'}), 400

    try:
        atualizar_status = requests.put(
            f"{API_MESAS}/{mesa_numero}/status",
            json={"status": "reservada"}
        )

        if atualizar_status.status_code != 200:
            return jsonify({'erro': 'Falha ao atualizar status da mesa no sistema interno.'}), 500

        nova_reserva = Reserva(
            usuario_id=usuario['id'],
            mesa_numero=mesa_numero,
            capacidade=capacidade
        )

        db.session.add(nova_reserva)
        db.session.commit()

        return jsonify({
            "mensagem": f"Mesa {mesa_numero} reservada com sucesso para {usuario['nome']}.",
            "reserva": {
                "id": nova_reserva.id,
                "mesa_numero": mesa_numero,
                "usuario_id": usuario['id'],
                "status": "reservada"
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
