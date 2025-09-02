from config import app, db
import os
from flask import send_from_directory
'''Classes - models'''
from Cardapio.cardapioModels import Cardapio
from Mesas.mesasModels import Mesas, Comanda  
'''Blueprint - rotas'''
from Cardapio.cardapioRoutes import cardapio_bp, frontend_bp


app.register_blueprint(frontend_bp)
app.register_blueprint(cardapio_bp)

with app.app_context():
    db.create_all()  

    # TESTE: imprime o nome do banco e se há tabelas
    engine = db.get_engine()
    print("Banco conectado:", engine.url)
    print("Tabelas existentes:", db.metadata.tables.keys())

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])
