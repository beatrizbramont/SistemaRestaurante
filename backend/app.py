from config import app, db
'''Blueprint - rotas'''
from Mesas.mesasRoutes import mesa_bp
from Cardapio.cardapioRoutes import cardapio_bp
from frontendRoutes import frontend_bp

app.register_blueprint(frontend_bp)
app.register_blueprint(cardapio_bp)
app.register_blueprint(mesa_bp)

with app.app_context():
    db.create_all()  

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])
