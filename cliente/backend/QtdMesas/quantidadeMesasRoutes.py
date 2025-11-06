import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, request, jsonify
import requests
from flask_jwt_extended import jwt_required, get_jwt_identity

quantidade_bp = Blueprint("cardapio", __name__)

API_MESAS = "http://127.0.0.1:8001/mesas/disponiveis"

# Fila de espera simples (global)
fila_espera = []


@quantidade_bp.route('/consultar_mesa')
@jwt_required()  # 🔒 Protege a rota — só acessa com token JWT válido
def consultar_mesa():
    usuario = get_jwt_identity()  # Pega os dados do usuário autenticado (id, nome, email)
    pessoas = int(request.args.get("pessoas"))
    acao = request.args.get("acao", "entrada")  # 'entrada' ou 'reserva'

    try:
        # Chamada à API de mesas disponíveis
        resposta = requests.get(f"{API_MESAS}?capacidade={pessoas}")
        mesas = resposta.json()  # lista de mesas: {'numero': 1, 'capacidade': 4, 'status': 'livre'}

        if acao == "entrada":
            mesas_livres = [m for m in mesas if m['status'] == 'livre']

            if mesas_livres:
                mesa_escolhida = mesas_livres[0]
                return jsonify({
                    "mensagem": f"Mesa {mesa_escolhida['numero']} disponível para {usuario['nome']}.",
                    "mesa": mesa_escolhida,
                    "usuario": usuario
                })
            else:
                posicao_fila = len(fila_espera) + 1
                fila_espera.append({"pessoas": pessoas, "usuario": usuario['email']})
                return jsonify({
                    "mensagem": f"Nenhuma mesa livre. {usuario['nome']} foi adicionado à fila de espera.",
                    "posicao_fila": posicao_fila
                })

        elif acao == "reserva":
            mesas_reservaveis = [
                m for m in mesas
                if m['status'] in ['livre', 'reservada'] and m['capacidade'] >= pessoas
            ]

            return jsonify({
                "mensagem": f"Mesas disponíveis para reserva de {usuario['nome']}:",
                "mesas": mesas_reservaveis
            })

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
