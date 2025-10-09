import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Blueprint, request, jsonify
import requests

quantidade_bp = Blueprint("cardapio", __name__)

API_MESAS = "http://127.0.0.1:8001/mesas/disponiveis"

# Fila de espera simples (global)
fila_espera = []

@quantidade_bp.route('/consultar_mesa')
def consultar_mesa():
    pessoas = int(request.args.get("pessoas"))
    acao = request.args.get("acao", "entrada")  # 'entrada' ou 'reserva'

    try:
        # Chamada à API de mesas disponíveis
        resposta = requests.get(f"{API_MESAS}?capacidade={pessoas}")
        mesas = resposta.json()  # lista de mesas: {'numero': 1, 'capacidade': 4, 'status': 'livre'}

        if acao == "entrada":
            # Filtra mesas livres
            mesas_livres = [m for m in mesas if m['status'] == 'livre']

            if mesas_livres:
                mesa_escolhida = mesas_livres[0]  # primeira mesa livre
                return jsonify({
                    "mensagem": f"Mesa {mesa_escolhida['numero']} disponível. Dirija-se à recepção.",
                    "mesa": mesa_escolhida
                })
            else:
                # Nenhuma mesa livre → fila de espera
                posicao_fila = len(fila_espera) + 1
                fila_espera.append({"pessoas": pessoas})
                return jsonify({
                    "mensagem": "Nenhuma mesa livre. Você foi adicionado à fila de espera.",
                    "posicao_fila": posicao_fila
                })

        elif acao == "reserva":
            mesas_reservaveis = [
                m for m in mesas
                if m['status'] in ['livre', 'reservada'] and m['capacidade'] >= pessoas
            ]

            return jsonify({
                "mensagem": "Mesas disponíveis para reserva:",
                "mesas": mesas_reservaveis
            })

    except Exception as e:
        return jsonify({"erro": str(e)}), 500