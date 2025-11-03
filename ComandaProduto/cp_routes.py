from flask import Blueprint, request, jsonify
from Cardapio import Cardapio
from config import db
from Comandas import Comanda
from ComandaProduto import ComandaProduto
from datetime import datetime

# Registrando com url_prefix em minúsculo
cp_bp = Blueprint("cp", __name__, url_prefix="/cp")

@cp_bp.route('/<int:comanda_id>/itens', methods=['GET'])
def listar_itens_comanda(comanda_id):
    comanda = Comanda.query.get(comanda_id)
    if not comanda:
        return jsonify({"error": "Comanda não encontrada"}), 404

    itens = []
    total = 0.0

    for cp in comanda.itens_comanda:
        item_cardapio = cp.produto
        if not item_cardapio:
            continue
        subtotal = cp.quantidade * item_cardapio.preco
        itens.append({
            "id": cp.id,
            "produto_id": item_cardapio.id,
            "nome": item_cardapio.nome,
            "ingredientes": item_cardapio.ingredientes,
            "quantidade": cp.quantidade,
            "preco_unitario": item_cardapio.preco,
            "subtotal": subtotal
        })
        total += subtotal

    return jsonify({"itens": itens, "total": total}), 200


@cp_bp.route('/<int:comanda_id>/itens', methods=['POST'])
def adicionar_item_comanda(comanda_id):
    data = request.json
    produto_id = data.get('produto_id')
    quantidade = data.get('quantidade', 1)

    if not produto_id:
        return jsonify({"error": "produto_id é obrigatório"}), 400

    if quantidade < 1:
        return jsonify({"error": "quantidade deve ser pelo menos 1"}), 400

    comanda = Comanda.query.get(comanda_id)
    produto = Cardapio.query.get(produto_id)

    if not comanda:
        return jsonify({"error": "Comanda não encontrada"}), 404
    if not produto:
        return jsonify({"error": "Produto do cardápio não encontrado"}), 404

    comanda_produto = ComandaProduto.query.filter_by(comanda_id=comanda_id, produto_id=produto_id).first()

    if comanda_produto:
        comanda_produto.quantidade += quantidade
    else:
        comanda_produto = ComandaProduto(
            comanda_id=comanda_id,
            produto_id=produto_id,
            quantidade=quantidade,
            data_adicao=datetime.utcnow()
        )
        db.session.add(comanda_produto)

    db.session.commit()

    return jsonify({"msg": "Item adicionado à comanda com sucesso!"}), 200


@cp_bp.route("/<int:comanda_id>/itens/<int:item_id>", methods=["DELETE"])
def deletar_item_comanda(comanda_id, item_id):
    try:
        item = ComandaProduto.query.filter_by(comanda_id=comanda_id, id=item_id).first()
        if not item:
            return jsonify({"msg": "Item da comanda não encontrado"}), 404

        db.session.delete(item)
        db.session.commit()
        return jsonify({"msg": "Item excluído com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@cp_bp.route("/<int:comanda_id>/itens/<int:item_id>", methods=["PUT"])
def atualizar_item_comanda(comanda_id, item_id):
    try:
        data = request.get_json()
        nova_quantidade = data.get("quantidade")

        if nova_quantidade is None or int(nova_quantidade) < 1:
            return jsonify({"error": "quantidade deve ser pelo menos 1"}), 400

        item = ComandaProduto.query.filter_by(comanda_id=comanda_id, id=item_id).first()
        if not item:
            return jsonify({"error": "Item da comanda não encontrado"}), 404

        item.quantidade = int(nova_quantidade)
        db.session.commit()

        return jsonify({"msg": "Item atualizado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
