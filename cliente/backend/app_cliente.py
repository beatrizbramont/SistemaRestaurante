from config import app, db, jwt  
from frontendRoutes import frontend_bp
from Auth.auth_routes import auth_bp
from Reserva.reservaRoutes import reserva_bp
from Cardapio.cardapio_routes import cardapio_cliente_bp
from flask_cors import CORS
import os
from flask import jsonify
from Reserva.reservaRoutes import atualizador_status_ocupado_background, atualizador_status_reservas_background
import threading

app.register_blueprint(frontend_bp)      
app.register_blueprint(auth_bp)              
app.register_blueprint(reserva_bp)           
app.register_blueprint(cardapio_cliente_bp)  

with app.app_context():
    db.create_all()

CORS(app)

thread_reservas = threading.Thread(
    target=atualizador_status_reservas_background,
    args=(app,),  # <-- MUITO IMPORTANTE
    daemon=True
)
thread_reservas.start()

# thread de status ocupado
thread_ocupado = threading.Thread(
    target=atualizador_status_ocupado_background,
    args=(app,),  # <-- MUITO IMPORTANTE
    daemon=True
)
thread_ocupado.start()

if __name__ == '__main__':
    app.run(
        host=app.config.get("HOST"),
        port=app.config.get("PORT"),     
        debug=app.config.get("DEBUG")
    )
