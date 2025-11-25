import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, request, jsonify
from datetime import datetime, date
import requests
from config import db
from Reserva.reservaModel import Reserva
from flask_cors import CORS
from flask import current_app
from config import db, app 

reserva_bp = Blueprint("reserva_bp", __name__, url_prefix="/reservas")
CORS(reserva_bp, resources={r"*": {"origins": "*"}})

# API correta da porta 8001
API_MESAS = "http://127.0.0.1:8001"


@reserva_bp.route('', methods=['POST', 'OPTIONS'])
def criar_reserva_compat():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    return criar_reserva()


@reserva_bp.route("/disponiveis", methods=["GET"])
def listar_mesas_disponiveis():
    pessoas = int(request.args.get("pessoas", 0))

    try:
        resposta = requests.get(f"{API_MESAS}/mesas/disponiveis?capacidade={pessoas}")
        if resposta.status_code != 200:
            return jsonify({"erro": "Erro ao buscar mesas."}), 500

        mesas = resposta.json()
        mesas_disponiveis = [m for m in mesas if m["status"] == "livre"]

        if not mesas_disponiveis:
            return jsonify({"mensagem": "Nenhuma mesa disponível."}), 404

        return jsonify({
            "mensagem": "Mesas disponíveis.",
            "mesas": mesas_disponiveis
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@reserva_bp.route("/criar", methods=["POST"])
def criar_reserva():
    data = request.get_json()
    usuario_id = data.get("usuario_id", 0)  # agora passado no payload

    pessoas = data.get("pessoas")
    mesas = data.get("mesas")
    data_hora_str = data.get("data_reserva")

    if not pessoas or not mesas or not data_hora_str:
        return jsonify({"erro": "Campos 'pessoas', 'mesas' e 'data_reserva' são obrigatórios!"}), 400

    if not isinstance(mesas, list):
        return jsonify({"erro": "Campo 'mesas' deve ser uma lista."}), 400

    try:
        data_hora_dt = datetime.fromisoformat(data_hora_str)
    except ValueError:
        return jsonify({"erro": "Formato de data/hora inválido. Use YYYY-MM-DDTHH:MM:SS"}), 400

    try:
        nova_reserva = Reserva(
            nome_cliente=data.get("nome_cliente"),
            usuario_id=int(usuario_id),
            mesas=",".join(str(m) for m in mesas),
            capacidade=pessoas,
            data_reserva=data_hora_dt
        )
        db.session.add(nova_reserva)
        db.session.commit()

        # 🔹 Atualiza status apenas se a reserva for para hoje
        if data_hora_dt.date() == date.today():
            for mesa_id in mesas:
                requests.put(
                    f"{API_MESAS}/mesa/{mesa_id}/status",
                    json={"status": "reservada"}
                )

        return jsonify({
            "mensagem": "Reserva criada!",
            "reserva": {
                "id": nova_reserva.id,
                "mesas": mesas,
                "capacidade": pessoas,
                "status": nova_reserva.status,
                "data_reserva": nova_reserva.data_reserva.strftime("%Y-%m-%dT%H:%M:%S")
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": f"Erro inesperado ao criar reserva: {str(e)}"}), 500


@reserva_bp.route("/minhas", methods=["GET"])
def minhas_reservas():
    # 🔹 removido JWT, agora público
    reservas = Reserva.query.all()  # retorna todas para teste
    return jsonify([
        {
            "id": r.id,
            "mesas": r.mesas.split(","),
            "capacidade": r.capacidade,
            "status": r.status,
            "data": r.data_reserva.strftime("%d/%m/%Y %H:%M"),
            "nome_cliente": r.nome_cliente
        }
        for r in reservas
    ])


@reserva_bp.route("/cancelar/<int:id>", methods=["PUT"])
def cancelar_reserva(id):
    reserva = Reserva.query.filter_by(id=id).first()
    if not reserva:
        return jsonify({"erro": "Reserva não encontrada."}), 404

    try:
        mesas = reserva.mesas.split(",")
        for mesa in mesas:
            requests.put(
                f"{API_MESAS}/mesa/{mesa}/status",
                json={"status": "livre"}
            )

        db.session.delete(reserva)
        db.session.commit()
        return jsonify({"mensagem": "Reserva cancelada e removida!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500


@reserva_bp.route("/mesa/<int:mesa_id>", methods=["GET"])
def reservas_por_mesa(mesa_id):
    try:
        todas = Reserva.query.all()
        mesa_id_str = str(mesa_id)
        reservas = [
            {
                "id": r.id,
                "usuario_id": r.usuario_id,
                "nome_cliente": r.nome_cliente,
                "mesas": r.mesas.split(","),
                "capacidade": r.capacidade,
                "data_reserva": r.data_reserva.strftime("%Y-%m-%dT%H:%M:%S"),
                "status": r.status
            }
            for r in todas
            if mesa_id_str in r.mesas.split(",")
        ]
        return jsonify(reservas), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


# reservaRoutes.py

def atualizador_status_reservas_background(app):
    import time
    while True:
        time.sleep(60*10)
        with app.app_context():
            try:
                hoje = date.today()
                reservas_hoje = Reserva.query.filter(
                    db.func.date(Reserva.data_reserva) == hoje
                ).all()
                for reserva in reservas_hoje:
                    mesas = reserva.mesas.split(",")
                    for mesa_id in mesas:
                        requests.put(
                            f"{API_MESAS}/mesa/{mesa_id}/status",
                            json={"status": "reservada"}
                        )
            except Exception as e:
                db.session.rollback()
                print("Erro na thread de status reservada:", e)


def atualizador_status_ocupado_background(app):
    import time
    while True:
        time.sleep(60)
        with app.app_context():
            try:
                agora = datetime.now()
                reservas_atuais = Reserva.query.filter(
                    db.func.date(Reserva.data_reserva) == agora.date()
                ).all()

                for reserva in reservas_atuais:
                    hora_reserva = reserva.data_reserva.time()
                    if hora_reserva <= agora.time() and reserva.status != "ocupada":
                        mesas = reserva.mesas.split(",")
                        for mesa_id in mesas:
                            requests.put(
                                f"{API_MESAS}/mesa/{mesa_id}/status",
                                json={"status": "ocupada"}
                            )
                        reserva.status = "ocupada"
                        db.session.commit()
            except Exception as e:
                db.session.rollback()
                print("Erro na thread de status ocupado:", e)
