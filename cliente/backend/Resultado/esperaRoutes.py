import sys
import os
raiz_projeto = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
if raiz_projeto not in sys.path:
    sys.path.insert(0, raiz_projeto)
from flask import Blueprint, request, jsonify
import requests
from backend.Mesas.mesasModels import db, Mesas, Status

espera_bp = Blueprint("espera", __name__)

API_MESAS = "http://127.0.0.1:8001/mesas/disponiveis"

fila_espera = []
@espera_bp.route('/confirmar_chegada', methods=['POST'])
def confirmar_chegada():
    pessoas = request.json.get("pessoas")

    for i, item in enumerate(fila_espera):
        if item["pessoas"] == pessoas:
            del fila_espera[i]
            return jsonify({"mensagem": "Chegada confirmada e removido da fila."})

    return jsonify({"erro": "Pessoa não encontrada na fila."}), 404

def atualizar_fila_ao_liberar_mesa(mesa):
    global fila_espera
    for i, reserva in enumerate(fila_espera):
        if mesa['capacidade'] >= reserva['pessoas']:
            
            mesa['status'] = 'reservada' 

            # Remover reserva da fila
            fila_espera.pop(i)

            # Pode enviar notificação para o cliente que a mesa está disponível
            print(f"Reserva para {reserva['pessoas']} pessoas alocada na mesa {mesa['numero']}.")

            break  # Sai do loop porque a mesa foi alocada

@espera_bp.route("/mesa/<int:mesa_id>/status", methods=["PUT"])
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

    # Aqui verifica a fila de espera se a mesa ficou livre
    if novo_status_nome == "livre":
        atualizar_fila_ao_liberar_mesa({
            "id": mesa.id,
            "numero": mesa.numero,
            "capacidade": mesa.capacidade,
            "status": novo_status_nome
        })

    return jsonify({"msg": f"Status da mesa {mesa.numero} atualizado para {status_obj.nome}"}), 200
