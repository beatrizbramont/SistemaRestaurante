from flask import Blueprint, request, jsonify


cardapio_blueprint = Blueprint('cardapio', __name__)

@cardapio_blueprint.route('/cardapio', methods=["GET"])
def listar_cardapio():
    return(jsonify("Rota conectada com sucesso rota")), 200


