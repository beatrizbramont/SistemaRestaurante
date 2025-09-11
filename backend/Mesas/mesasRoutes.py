import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Blueprint, request, jsonify, send_from_directory
from Mesas.mesasModels import db, Mesas, Comanda, Status
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

# mesas
@mesa_bp.route("/mesas", methods=["GET"])
def listar_mesas():
    mesas = Mesas.query.all()
    return jsonify([mesa.to_dict() for mesa in mesas])

@mesa_bp.route("/mesas/disponiveis", methods=["GET"])
def filtrar_mesas_por_capacidade():
    try:
        capacidade_str = request.args.get('capacidade', '1')
        if not capacidade_str.isdigit() or int(capacidade_str) < 1:
            return jsonify({"erro": "Capacidade inválida"}), 400

        capacidade_necessaria = int(capacidade_str)

        mesas_filtradas = Mesas.query.filter(
            Mesas.capacidade >= capacidade_necessaria
        ).all()

        resultado = [
            {
                "id": mesa.id,
                "numero": mesa.numero,
                "capacidade": mesa.capacidade,
                "status": mesa.status.nome if mesa.status else None
            }
            for mesa in mesas_filtradas
        ]

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 400

@mesa_bp.route("/mesa/<int:mesa_id>/status", methods=["PUT"])
def atualizar_status_mesa(mesa_id):
    mesa = Mesas.query.get(mesa_id)
    if not mesa:
        return jsonify({"error": "Mesa não encontrada"}), 404

    data = request.json
    novo_status_nome = data.get("status")

    status_obj = Status.query.filter_by(nome=novo_status_nome).first()
    if not status_obj:
        return jsonify({"error": "Status inválido"}), 400

    mesa.status = status_obj
    db.session.commit()

    return jsonify({"msg": f"Status da mesa {mesa.numero} atualizado para {status_obj.nome}"}), 200

# comandas
@mesa_bp.route("/mesa/<int:mesa_id>/abrir_comanda", methods=["POST"])
def abrir_comanda(mesa_id):
    mesa = Mesas.query.get(mesa_id)

    if not mesa:
        return jsonify({"error": "Mesa não encontrada"}), 404

    if not mesa.status or mesa.status.nome != "livre":
        return jsonify({"error": "Mesa não está livre"}), 400

    nova_comanda = Comanda(mesa_id=mesa.id, aberta=True)
    db.session.add(nova_comanda)

    status_ocupada = Status.query.filter_by(nome="ocupada").first()
    mesa.status = status_ocupada
    db.session.commit()

    return jsonify({"msg": "Comanda aberta com sucesso", "comanda_id": nova_comanda.id}), 200

@mesa_bp.route("/mesa/<int:mesa_id>/fechar_comanda", methods=["POST"])
def fechar_comanda(mesa_id):
    mesa = Mesas.query.get(mesa_id)

    comanda = mesa.comanda_aberta if mesa else None

    if not mesa or not comanda:
        return jsonify({"error": "Mesa ou comanda não encontrada"}), 404

    comanda.aberta = False
    comanda.data_fechamento = datetime.utcnow()

    status_livre = Status.query.filter_by(nome="livre").first()
    mesa.status = status_livre
    db.session.commit()

    return jsonify({"msg": "Comanda fechada com sucesso"}), 200

@mesa_bp.route("/mesa/<int:mesa_id>/comandas", methods=["POST"])
def abrir_varias_comandas(mesa_id):
    data = request.json
    quantidade = data.get("quantidade")

    mesa = Mesas.query.get(mesa_id)
    if not mesa:
        return jsonify({"error": "Mesa não encontrada"}), 404

    if quantidade is None or not isinstance(quantidade, int) or quantidade <= 0:
        return jsonify({"error": "Quantidade inválida"}), 400

    comandas = []
    for _ in range(quantidade):
        comanda = Comanda(mesa_id=mesa_id, aberta=True)
        db.session.add(comanda)
        comandas.append(comanda)

    status_ocupada = Status.query.filter_by(nome="ocupada").first()
    if not status_ocupada:
        return jsonify({"error": "Status 'ocupada' não encontrado"}), 500

    mesa.status = status_ocupada
    db.session.commit()

    return jsonify({
        "msg": f"{quantidade} comandas abertas com sucesso",
        "comandas": [c.id for c in comandas]
    }), 200