from Mesas import Mesas, Status
from config import db
from flask import Blueprint, request, jsonify, render_template
from datetime import datetime, date
import requests

mesa_bp = Blueprint("mesa", __name__)

API_RESERVAS = "http://127.0.0.1:8002/reservas"


@mesa_bp.route('/mesas')
def mesas_page():
    return render_template("mesapage.html")


@mesa_bp.route("/api/mesas", methods=["GET"])
def listar_mesas():
    mesas = Mesas.query.all()
    resultado = []
    agora = datetime.now()

    for mesa in mesas:
        try:
            r = requests.get(f"{API_RESERVAS}/mesa/{mesa.id}")
            reservas = r.json() if r.ok else []
        except:
            reservas = []

        status_final = mesa.status.nome

        # Separar reservas de hoje e futuras
        reservas_hoje = [
            reserva for reserva in reservas
            if datetime.fromisoformat(reserva["data_reserva"]).date() == agora.date()
        ]
        reservas_futuras = [
            reserva for reserva in reservas
            if datetime.fromisoformat(reserva["data_reserva"]).date() > agora.date()
        ]

        if reservas_hoje:
            reservas_hoje.sort(key=lambda r: r["data_reserva"])
            proxima = reservas_hoje[0]
            hora_reserva = datetime.fromisoformat(proxima["data_reserva"])

            if hora_reserva <= agora:
                status_final = "ocupada"
            else:
                status_final = "reservada"
        else:
            proxima = None

        resultado.append({
            "id": mesa.id,
            "numero": mesa.numero,
            "capacidade": mesa.capacidade,
            "status": status_final,
            "proxima_reserva": proxima,
            "reservas_futuras": reservas_futuras  # <- importante para o calendário
        })

    return jsonify(resultado)

def pegar_proxima_reserva(reservas):
    agora = datetime.now()
    reservas.sort(key=lambda r: r["data_reserva"])
    for reserva in reservas:
        hora_reserva = datetime.fromisoformat(reserva["data_reserva"])
        if hora_reserva >= agora:
            return reserva
    return None

@mesa_bp.route("/mesas/disponiveis", methods=["GET"])
def filtrar_mesas_por_capacidade():
    try:
        capacidade_str = request.args.get('capacidade', '1')
        if not capacidade_str.isdigit() or int(capacidade_str) < 1:
            return jsonify({"erro": "Capacidade inválida"}), 400

        capacidade_necessaria = int(capacidade_str)
        mesas = Mesas.query.join(Status).filter(Mesas.capacidade >= capacidade_necessaria).all()
        resultado = []
        agora = datetime.now()

        for mesa in mesas:
            try:
                r = requests.get(f"{API_RESERVAS}/mesa/{mesa.id}")
                reservas = r.json() if r.ok else []
            except:
                reservas = []

            status_final = mesa.status.nome
            reservas_hoje = [
                reserva for reserva in reservas
                if datetime.fromisoformat(reserva["data_reserva"]).date() == agora.date()
            ]

            if reservas_hoje:
                reservas_hoje.sort(key=lambda r: r["data_reserva"])
                proxima = reservas_hoje[0]
                hora_reserva = datetime.fromisoformat(proxima["data_reserva"])

                if hora_reserva <= agora:
                    status_final = "ocupada"
                else:
                    status_final = "reservada"
            else:
                proxima = None

            if status_final == "livre":
                resultado.append({
                    "id": mesa.id,
                    "numero": mesa.numero,
                    "capacidade": mesa.capacidade,
                    "status": status_final,
                    "proxima_reserva": proxima
                })

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

    # Não permite voltar de ocupada para reservada
    if mesa.status.nome == "ocupada" and novo_status_nome == "reservada":
        return jsonify({"msg": f"Mesa {mesa.numero} já está ocupada, não pode voltar para reservada"}), 200

    mesa.status = status_obj
    db.session.commit()

    return jsonify({"msg": f"Status da mesa {mesa.numero} atualizado para {status_obj.nome}"}), 200


@mesa_bp.route("/mesa/<int:mesa_id>/reservar", methods=["PUT"])
def reservar_mesa(mesa_id):
    mesa = Mesas.query.get(mesa_id)
    if not mesa:
        return jsonify({"erro": "Mesa não encontrada"}), 404

    if mesa.status.nome != "livre":
        return jsonify({"erro": "Mesa não está disponível para reserva"}), 400

    status_reservada = Status.query.filter_by(nome="reservada").first()
    if not status_reservada:
        return jsonify({"erro": "Status 'reservada' não encontrado no banco"}), 500

    mesa.status = status_reservada
    db.session.commit()

    return jsonify({
        "msg": f"Mesa {mesa.numero} reservada com sucesso!",
        "mesa": mesa.id
    }), 200


@mesa_bp.route("/mesa/<int:mesa_id>", methods=["GET"])
def obter_mesa(mesa_id):
    mesa = Mesas.query.get(mesa_id)
    if not mesa:
        return jsonify({"erro": "Mesa não encontrada"}), 404

    return jsonify({
        "id": mesa.id,
        "numero": mesa.numero,
        "capacidade": mesa.capacidade,
        "status": mesa.status.nome
    }), 200


@mesa_bp.route("/encerrar_dia", methods=["POST"])
def encerrar_dia():
    try:
        status_livre = Status.query.filter_by(nome="livre").first()
        if not status_livre:
            return jsonify({"erro": "Status 'livre' não encontrado"}), 500

        mesas = Mesas.query.all()
        for mesa in mesas:
            mesa.status = status_livre

        db.session.commit()
        return jsonify({"msg": "Dia encerrado com sucesso! Todas as mesas voltaram a ficar livres."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
