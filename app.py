import os
from config import app, db
with app.app_context():
    db.create_all()
    

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port = app.config['PORT'],debug=app.config['DEBUG'])