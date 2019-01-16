import click

from backend import app


@click.command()
@click.option("-h", "--host", default='0.0.0.0')
@click.option("-p", "--port", default=5000)
@click.option("-t", "--threaded", default=True, type=bool)
@click.option("-d", "--debug", default=False, type=bool)
def main(host, port, threaded, debug):
    app.run(host=host, port=port, threaded=threaded, debug=debug)


if __name__ == "__main__":
    main()
