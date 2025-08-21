from flask import Blueprint, request, jsonify
from cardapioModels import db, Cardapio

cardapio_bp = Blueprint("cardapio", __name__)

@cardapio_bp.route("/cardapio", methods=["POST"])
def create_item():
    data = request.json
    novo_item = Cardapio(
        nome=data["nome"],
        preco=data["preco"],
        categoria=data["categoria"],
        tempo_preparo=data["tempo_preparo"]
    )
    db.session.add(novo_item)
    db.session.commit()
    return jsonify({"msg": "Item adicionado com sucesso!"}), 200

@cardapio_bp.route("/cardapio", methods=["GET"])
def get_item():
    itens = Cardapio.query.all()
    return jsonify([
        {
            "id": item.id,
            "nome": item.nome,
            "preco": item.preco,
            "categoria": item.categoria,
            "tempo_preparo": item.tempo_preparo
        }
        for item in itens
    ])
 
@cardapio_bp.route("/cardapio/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    try:
        dados = request.json
        item = Cardapio.query.get(item_id)

        if not item:
            return jsonify({"msg": "Item não encontrado"}), 404

        item.nome = dados.get("nome", item.nome)
        item.preco = dados.get("preco", item.preco)
        item.categoria = dados.get("categoria", item.categoria)
        item.tempo_preparo = dados.get("tempo_preparo", item.tempo_preparo)

        db.session.commit()

        return jsonify({"msg": "Item atualizado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#Delete
@cardapio_bp.route('/cardapio/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        item = Cardapio.query.get(item_id)

        if not item:
            return jsonify({"msg": "Item não encontrado"}), 404

        db.session.delete(item)
        db.session.commit()

        return jsonify({"msg": "Item excluído com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500