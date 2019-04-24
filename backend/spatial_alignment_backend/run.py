import click
from flask_cors import CORS

from spatial_alignment_backend import app


@click.command()
@click.option("-h", "--host", envvar='HOST_ENV', default='0.0.0.0')
@click.option("-p", "--port", envvar='PORT_ENV', default=5002)
@click.option("-t", "--threaded", envvar='THREADED_ENV', default=True, type=bool)
@click.option("-d", "--debug", envvar='DEBUG_ENV', default=False, type=bool)
@click.option("-c", "--cors", envvar='CORS_ENV', default=True, type=bool)
def main(host, port, threaded, debug, cors):
    if cors:
        CORS(app)
    app.run(host=host, port=port, threaded=threaded, debug=debug)


if __name__ == "__main__":
    main()
