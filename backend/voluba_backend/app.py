from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import voluba_config
import voluba_user
import voluba_auth
from pathlib import Path

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=voluba_config.SESSION_SECRET, max_age=86400)

app.include_router(voluba_auth.router)
app.include_router(voluba_user.router, prefix="/user")

path_to_static = voluba_config.PATH_TO_STATIC

print(path_to_static)

app.mount("/", StaticFiles(directory=path_to_static, html=True))
