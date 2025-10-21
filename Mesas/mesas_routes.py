from Mesas import Mesas, Status
from config import db
from flask import Blueprint, request, jsonify, render_template
from datetime import datetime

mesa_bp = Blueprint("mesa", __name__)

@mesa_bp.route('/mesas')
def mesas_page():
    return render_template("mesapage.html")

# mesas - GET
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

# mesas - PUT
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

