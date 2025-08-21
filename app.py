from config import app, db
from Cardapio.cardapioRoutes import cardapio_bp

app.register_blueprint(cardapio_bp)

with app.app_context():
    db.create_all()  # Cria todas as tabelas

if __name__ == "__main__":
    app.run(debug=True)
