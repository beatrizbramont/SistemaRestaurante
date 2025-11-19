from datetime import datetime
from config import db

from config import db
from datetime import datetime

class Reserva(db.Model):
    __tablename__ = "reservas"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    mesas = db.Column(db.String(255), nullable=False)  # ← adicionar isso
    capacidade = db.Column(db.Integer, nullable=False)
    data_reserva = db.Column(db.DateTime, default=datetime.now)
    horario_reserva = db.Column(db.DateTime, default=datetime.now)
    status = db.Column(db.String(50), default="reservada")

