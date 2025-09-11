import os
import sys
from flask import jsonify
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import app, db
from Mesas.mesasModels import Mesas, Status

mesas_cadastradas = [
    {"numero": 1, "capacidade": 4},
    {"numero": 2, "capacidade": 6},
    {"numero": 3, "capacidade": 2},
    {"numero": 4, "capacidade": 8},
    {"numero": 5, "capacidade": 4},
    {"numero": 6, "capacidade": 2},
    {"numero": 7, "capacidade": 6},
    {"numero": 8, "capacidade": 4},
    {"numero": 9, "capacidade": 8},
    {"numero": 10, "capacidade": 2},
    {"numero": 11, "capacidade": 4},
    {"numero": 12, "capacidade": 6},
    {"numero": 13, "capacidade": 2},
    {"numero": 14, "capacidade": 4},
    {"numero": 15, "capacidade": 4},
    {"numero": 16, "capacidade": 2},
    {"numero": 17, "capacidade": 4},
    {"numero": 18, "capacidade": 4},
    {"numero": 19, "capacidade": 8},
    {"numero": 20, "capacidade": 2},
]

def seed_status():
    with app.app_context():
        for nome in ["livre", "ocupada", "reservada"]:
            if not Status.query.filter_by(nome=nome).first():
                db.session.add(Status(nome=nome))
        db.session.commit()

def seed_mesas():
    with app.app_context():
        status_livre = Status.query.filter_by(nome="livre").first()
        for mesa_data in mesas_cadastradas:
            numero = mesa_data["numero"]
            capacidade = mesa_data["capacidade"]

            if not Mesas.query.filter_by(numero=numero).first():
                nova_mesa = Mesas(
                    numero=numero,
                    capacidade=capacidade,
                    status_id=status_livre.id
                )
                db.session.add(nova_mesa)
        db.session.commit()