from fastapi import Request
from fastapi.routing import APIRouter
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
import voluba_config
import voluba_auth
from ebrains_drive import DriveApiClient
from ebrains_drive.repo import Repo
import json

router = APIRouter()

def get_user(request: Request):
    uuid = request.session.get(voluba_config.PROFILE_KEY)
    return voluba_auth.token_store.get_value(uuid)

@router.get("")
@router.get("/")
def user(request: Request):
    user = get_user(request)
    if user:
        return JSONResponse(user)
    else:
        raise HTTPException(401, f"Not logged in.")

@router.get("/customSrc")
def custom_src(request: Request):
    user = get_user(request)
    if not user:
        raise HTTPException(401, f"Not logged in.")
    access_token = user.get("accessToken")
    client = DriveApiClient(token=access_token)

    # n.b. do not "get_repo_by_name"
    # based on localization, the default repo name may be "My Library" or "Meine Bibliothek" etc
    lib: Repo = client.repos.get_default_repo()
    
    file = lib.get_file("/voluba/customSrc.json")
    custom_src = json.loads(file.get_content())
    return JSONResponse(custom_src)
