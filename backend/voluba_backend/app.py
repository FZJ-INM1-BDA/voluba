from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import voluba_config
import voluba_user
import voluba_auth
from ebrains_router import router as ebrains_router
from siibra_explorer_overlay import router as sxplr_plugin_router

app = FastAPI()

# n.b. only enable during dev
enable_cors = False
if enable_cors:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:4200"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

app.add_middleware(SessionMiddleware, secret_key=voluba_config.SESSION_SECRET, max_age=86400)

app.include_router(voluba_auth.router)
app.include_router(voluba_user.router, prefix="/user", tags=["users"])
app.include_router(ebrains_router, prefix="/ebrains", tags=["ebrains"])
app.include_router(sxplr_plugin_router, prefix="/viewerPlugin", include_in_schema=False)

path_to_static = voluba_config.PATH_TO_STATIC

print(path_to_static)

app.mount("/", StaticFiles(directory=path_to_static, html=True))
