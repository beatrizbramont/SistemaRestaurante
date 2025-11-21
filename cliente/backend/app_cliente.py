from config import app, db, jwt  
from frontendRoutes import frontend_bp
from Auth.auth_routes import auth_bp
from Reserva.reservaRoutes import reserva_bp
from Cardapio.cardapio_routes import cardapio_cliente_bp
from flask_cors import CORS

app.register_blueprint(frontend_bp)      
app.register_blueprint(auth_bp)              
app.register_blueprint(reserva_bp)           
app.register_blueprint(cardapio_cliente_bp)  

with app.app_context():
    db.create_all()

CORS(app)

if __name__ == '__main__':
    app.run(
        host=app.config.get("HOST"),
        port=app.config.get("PORT"),     
        debug=app.config.get("DEBUG")
    )
