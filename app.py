from config import app, db, db_user, db_pass, db_host, db_name
import os
from Cardapio.cardapioModels import Cardapio
from Cardapio.cardapioRoutes import cardapio_bp

app.register_blueprint(cardapio_bp)

with app.app_context():
    db.create_all()  

print(f"DB_USER: {db_user}")
print(f"DB_PASSWORD: {db_pass}")
print(f"DB_HOST: {db_host}")
print(f"DB_NAME: {db_name}")
print(f"SQLALCHEMY_DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port = app.config['PORT'],debug=app.config['DEBUG'])
