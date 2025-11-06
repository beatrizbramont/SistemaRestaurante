from datetime import datetime
from config import db

class Reserva(db.Model):
    __tablename__ = 'reservas'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    mesa_numero = db.Column(db.Integer, nullable=False)
    capacidade = db.Column(db.Integer, nullable=False)
    data_reserva = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='reservada')

    def __repr__(self):
        return f"<Reserva Mesa {self.mesa_numero} - Usuário {self.usuario_id}>"
