import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Blueprint, request, jsonify, send_from_directory
from Mesas.mesasModels import db, Mesas, Comanda
from datetime import datetime

mesa_bp = Blueprint("mesa", __name__)
frontend_bp = Blueprint('frontend', __name__)
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')

@frontend_bp.route('/')
def serve_frontend():
    return send_from_directory(STATIC_DIR, 'mesapage.html')
@frontend_bp.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(STATIC_DIR, filename)


@mesa_bp.route("/mesas", methods=["GET"])
def listar_mesas():
    mesas = Mesas.query.all()
    return jsonify([
        {
            "id": mesa.id,
            "numero": mesa.numero,
            "status": mesa.status,
            "comanda_aberta": mesa.comanda.aberta if mesa.comanda and mesa.comanda.aberta else False
        }
        for mesa in mesas
    ])

@mesa_bp.route("/mesas", methods=["POST"])
def criar_mesa():
    data = request.json
    numero = data.get("numero")

    if not numero:
        return jsonify({"error": "Número da mesa é obrigatório"}), 400

    nova_mesa = Mesas(numero=numero, status="livre")
    db.session.add(nova_mesa)
    db.session.commit()
    return jsonify({"msg": "Mesa criada com sucesso", "mesa_id": nova_mesa.id}), 200

@mesa_bp.route("/mesa/<int:mesa_id>/abrir_comanda", methods=["POST"])
def abrir_comanda(mesa_id):
    mesa = Mesas.query.get(mesa_id)

    if not mesa:
        return jsonify({"error": "Mesa não encontrada"}), 404

    if mesa.status != "livre":
        return jsonify({"error": "Mesa não está livre"}), 400

    nova_comanda = Comanda(mesa_id=mesa.id, aberta=True)
    db.session.add(nova_comanda)
    mesa.status = "ocupada"
    db.session.commit()

    return jsonify({"msg": "Comanda aberta com sucesso", "comanda_id": nova_comanda.id}), 200

@mesa_bp.route("/mesa/<int:mesa_id>/fechar_comanda", methods=["POST"])
def fechar_comanda(mesa_id):
    mesa = Mesas.query.get(mesa_id)

    if not mesa or not mesa.comanda or not mesa.comanda.aberta:
        return jsonify({"error": "Mesa ou comanda não encontrada"}), 404

    mesa.comanda.aberta = False
    mesa.comanda.data_fechamento = datetime.utcnow()
    mesa.status = "livre"
    db.session.commit()

    return jsonify({"msg": "Comanda fechada com sucesso"}), 200

@mesa_bp.route("/mesa/<int:mesa_id>/status", methods=["PUT"])
def atualizar_status_mesa(mesa_id):
    mesa = Mesas.query.get(mesa_id)
    if not mesa:
        return jsonify({"error": "Mesa não encontrada"}), 404

    data = request.json
    novo_status = data.get("status")

    if novo_status not in ["livre", "ocupada", "reservada"]:
        return jsonify({"error": "Status inválido"}), 400

    mesa.status = novo_status
    db.session.commit()

    return jsonify({"msg": f"Status da mesa {mesa.numero} atualizado para {novo_status}"}), 200
