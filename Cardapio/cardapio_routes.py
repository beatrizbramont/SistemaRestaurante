import os
from flask import Blueprint, request, jsonify, render_template, url_for, current_app
from Cardapio.cardapio_model import db, Cardapio
from werkzeug.utils import secure_filename

cardapio_bp = Blueprint("cardapio", __name__)

@cardapio_bp.route("/cardapiopg")
def cardapio_page():
    return render_template('cardapio.html')

@cardapio_bp.route("/cardapio", methods=["POST"])
def create_item():
    try:
        
        nome = request.form["nome"]
        ingredientes = request.form["ingredientes"]
        preco = request.form["preco"]
        categoria = request.form["categoria"]
        tempo_preparo = request.form["tempo_preparo"]


        imagem = request.files.get("imagem")
        nome_arquivo = None

        if imagem:
            nome_arquivo = secure_filename(imagem.filename)
            caminho = os.path.join(current_app.config['UPLOAD_FOLDER'], nome_arquivo)
            imagem.save(caminho)

        novo_item = Cardapio(
            nome=nome,
            ingredientes=ingredientes,
            preco=preco,
            categoria=categoria,
            tempo_preparo=tempo_preparo,
            imagem=nome_arquivo
        )

        db.session.add(novo_item)
        db.session.commit()

        return jsonify({"msg": "Item adicionado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cardapio_bp.route("/cardapio", methods=["GET"])
def get_item():
    try:
        itens = Cardapio.query.all()
        return jsonify([
            {
                "id": item.id,
                "nome": item.nome,
                "ingredientes": item.ingredientes,
                "preco": item.preco,
                "categoria": item.categoria,
                "tempo_preparo": item.tempo_preparo,
                "imagem": item.imagem,
                "imagem_url": f"http://127.0.0.1:8001/static/uploads/{item.imagem}" if item.imagem else None
            }
            for item in itens
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

 
@cardapio_bp.route("/cardapio/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    try:
        item = Cardapio.query.get(item_id)
        if not item:
            return jsonify({"msg": "Item não encontrado"}), 404

        dados = request.form

        item.nome = dados.get("nome", item.nome)
        item.ingredientes = dados.get("ingredientes", item.ingredientes)
        item.preco = dados.get("preco", item.preco)
        item.categoria = dados.get("categoria", item.categoria)
        item.tempo_preparo = dados.get("tempo_preparo", item.tempo_preparo)

        
        if "imagem" in request.files:
            imagem = request.files["imagem"]
            if imagem:

                
                if item.imagem:
                    caminho_antigo = os.path.join(current_app.config["UPLOAD_FOLDER"], item.imagem)
                    if os.path.exists(caminho_antigo):
                        os.remove(caminho_antigo)

                
                from werkzeug.utils import secure_filename
                nome_arquivo = secure_filename(imagem.filename)
                caminho_novo = os.path.join(current_app.config["UPLOAD_FOLDER"], nome_arquivo)
                imagem.save(caminho_novo)

                
                item.imagem = nome_arquivo

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