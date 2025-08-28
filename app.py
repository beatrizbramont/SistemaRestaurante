from config import app, db, db_user, db_pass, db_host, db_name
import os
from flask import send_from_directory
from Cardapio.cardapioModels import Cardapio
from Cardapio.cardapioRoutes import cardapio_bp, frontend_bp

app.register_blueprint(frontend_bp)
app.register_blueprint(cardapio_bp)

with app.app_context():
    db.create_all()  

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])
