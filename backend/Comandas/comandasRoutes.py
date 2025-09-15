import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Blueprint, request, jsonify, send_from_directory
from Mesas.mesasModels import db, Mesas, Status
from Comandas.comandasModels import Comanda
from datetime import datetime

comandas_bp = Blueprint("comandas", __name__)
frontend_bp = Blueprint('frontend', __name__)
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')

@comandas_bp.route("/mesa/<int:mesa_id>/comandas", methods=["GET"])
def listar_comandas(mesa_id):
    comandas = Comanda.query.filter_by(mesa_id=mesa_id).all()
    result = [{"id": c.id, "nome": c.nome, "aberta": c.aberta} for c in comandas]
    return jsonify({"comandas": result})

@comandas_bp.route("/mesa/<int:mesa_id>/abrir_comanda", methods=["POST"])
def abrir_comanda(mesa_id):
    mesa = Mesas.query.get(mesa_id)
    if not mesa:
        return jsonify({"error": "Mesa não encontrada"}), 404
    if not mesa.status or mesa.status.nome != "livre":
        return jsonify({"error": "Mesa não está livre"}), 400

    data = request.json
    nome = data.get("nome", None)  # opcional

    nova_comanda = Comanda(mesa_id=mesa.id, aberta=True, nome=nome)
    db.session.add(nova_comanda)

    status_ocupada = Status.query.filter_by(nome="ocupada").first()
    mesa.status = status_ocupada
    db.session.commit()

    return jsonify({"msg": "Comanda aberta com sucesso", "comanda_id": nova_comanda.id, "nome": nome}), 200

@comandas_bp.route("/mesa/<int:mesa_id>/fechar_comanda", methods=["POST"])
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

@comandas_bp.route("/mesa/<int:mesa_id>/comandas", methods=["POST"])
def abrir_varias_comandas(mesa_id):
    data = request.json
    quantidade = data.get("quantidade")
    nomes = data.get("nomes", [])

    mesa = Mesas.query.get(mesa_id)

    if not mesa:
        return jsonify({"error": "Mesa não encontrada"}), 404

    if not isinstance(quantidade, int) or quantidade <= 0:
        return jsonify({"error": "Quantidade inválida"}), 400

    # ✅ DEBUG 1 - Confirma capacidade
    print(f"[DEBUG] Capacidade da mesa {mesa.numero}: {mesa.capacidade}")

    comandas_abertas = Comanda.query.filter_by(mesa_id=mesa_id, aberta=True).all()
    total_comandas_abertas = len(comandas_abertas)
    capacidade_restante = mesa.capacidade - total_comandas_abertas

    print(f"[DEBUG] Comandas abertas: {total_comandas_abertas}")
    print(f"[DEBUG] Capacidade restante: {capacidade_restante}")
    print(f"[DEBUG] Tentando abrir: {quantidade} comandas")

    if quantidade > capacidade_restante:
        return jsonify({
            "error": f"A mesa suporta no máximo {mesa.capacidade} pessoas. Já existem {total_comandas_abertas} comandas abertas."
        }), 400

    novas_comandas = []
    for i in range(quantidade):
        nome = nomes[i] if i < len(nomes) else None  # Nome correspondente, se houver
        comanda = Comanda(mesa_id=mesa_id, aberta=True, nome=nome)
        db.session.add(comanda)
        novas_comandas.append(comanda)

    status_ocupada = Status.query.filter_by(nome="ocupada").first()
    if not status_ocupada:
        return jsonify({"error": "Status 'ocupada' não encontrado"}), 500

    mesa.status = status_ocupada
    db.session.commit()

    return jsonify({
        "msg": f"{quantidade} comandas abertas com sucesso",
        "comandas": [c.id for c in novas_comandas]
    }), 200


@comandas_bp.route("/mesa/<int:mesa_id>/comandas", methods=["DELETE"])
def fechar_todas_comandas(mesa_id):
    mesa = Mesas.query.get(mesa_id)
    if not mesa:
        return jsonify({"error": "Mesa não encontrada"}), 404

    comandas_abertas = [c for c in mesa.comandas if c.aberta]

    if not comandas_abertas:
        return jsonify({"msg": "Nenhuma comanda aberta para fechar."}), 200

    for comanda in comandas_abertas:
        comanda.aberta = False
        comanda.data_fechamento = datetime.utcnow()

    status_livre = Status.query.filter_by(nome="livre").first()
    mesa.status = status_livre

    db.session.commit()

    return jsonify({"msg": f"{len(comandas_abertas)} comandas fechadas com sucesso."}), 200

@comandas_bp.route("/comanda/<int:comanda_id>/fechar", methods=["POST"])
def fechar_comanda_por_id(comanda_id):
    comanda = Comanda.query.get(comanda_id)

    if not comanda or not comanda.aberta:
        return jsonify({"error": "Comanda não encontrada ou já fechada"}), 404

    comanda.aberta = False
    comanda.data_fechamento = datetime.utcnow()

    mesa = Mesas.query.get(comanda.mesa_id)
    comandas_abertas = Comanda.query.filter_by(mesa_id=mesa.id, aberta=True).count()
    if comandas_abertas == 0:
        status_livre = Status.query.filter_by(nome="livre").first()
        mesa.status = status_livre

    db.session.commit()

    return jsonify({"msg": "Comanda fechada com sucesso"}), 200

    