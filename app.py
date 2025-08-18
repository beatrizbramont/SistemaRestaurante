import os
from config import app, db
from cardapio.cardapio_routes import cardapio_blueprint

app.register_blueprint(cardapio_blueprint)

with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(host=app.config["HOST"], port = app.config['PORT'],debug=app.config['DEBUG'])