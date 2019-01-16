import flask
from flask_cors import CORS

from .api import register_api

app = flask.Flask(__name__, static_folder='../frontend/dist')
CORS(app)


@app.route("/")
def root():
    return app.send_static_file('index.html')


register_api(app, prefix='/api')
