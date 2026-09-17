from base64 import b64decode
from datetime import datetime
import json

from fastapi import Request
from fastapi.routing import APIRouter
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from ebrains_drive import DriveApiClient
from ebrains_drive.repo import Repo

import voluba_config
import voluba_auth


router = APIRouter()

threshold_seconds = 30

def decode_jwt(jwt_token: str):
    _header, body, _sig, *_rest = jwt_token.split('.')
    return tuple(
        json.loads(b64decode(v.encode("utf-8") + b"====").decode("utf-8"))
        for v in [_header, body]
    )


def get_user(request: Request):
    uuid = request.session.get(voluba_config.PROFILE_KEY)
    user = voluba_auth.token_store.get_value(uuid)
    if user is None:
        return None
    access_token = user.get("accessToken", None)
    if access_token is None:
        return None
    try:
        _header, body = decode_jwt(access_token)
        exp = body.get("exp", None)
    except Exception as e:
        print("Error decoding access token", e)
        return None
    
    if exp is None:
        return None
    
    expiry = datetime.fromtimestamp(exp)

    current = datetime.now()
    if (
        expiry > current
        and
        (expiry - current).seconds > threshold_seconds
    ):
        return user
    
    return None


@router.get("")
@router.get("/")
def user(request: Request):
    user = get_user(request)
    if user:
        return JSONResponse(user)
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
    
    my_libraries = client.repos.get_repos_by_name("my-siibra-library")
    if len(my_libraries) == 0:
        my_libraries = client.repos.get_repos_by_name("My Library")
    assert len(my_libraries) == 1

    lib: Repo = my_libraries[0]
    file = lib.get_file("/voluba/customSrc.json")
    custom_src = json.loads(file.get_content())
    return JSONResponse(custom_src)
