import requests
from flask import Blueprint, jsonify

cardapio_cliente_bp = Blueprint("cardapio_cliente_bp", __name__, url_prefix="/cardapio")

API_CARDAPIO = "http://127.0.0.1:8001/cardapio"

@cardapio_cliente_bp.route("/listar", methods=["GET"])
def listar_cardapio_cliente():
    try:
        resposta = requests.get(API_CARDAPIO)

        if resposta.status_code != 200:
            return jsonify({
                "erro": f"Falha ao obter cardápio interno (código {resposta.status_code}).",
                "detalhes": resposta.text
            }), resposta.status_code

        itens = resposta.json()

        for item in itens:
            if item.get("imagem") and not item["imagem"].startswith("http"):
                item["imagem"] = f"http://127.0.0.1:8001/static/uploads/{item['imagem']}"

        return jsonify(itens), 200

    except Exception as e:
        return jsonify({"erro": f"Erro interno ao listar cardápio: {str(e)}"}), 500
