from fastapi import Request
from fastapi.routing import APIRouter
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
import voluba_config
import voluba_auth

router = APIRouter()

def get_user(request: Request):
    uuid = request.session.get(voluba_config.PROFILE_KEY)
    return voluba_auth.token_store.get_value(uuid)

@router.get("")
@router.get("/")
async def user(request: Request):
    user = get_user(request)
    if user:
        return JSONResponse(user)
    else:
        raise HTTPException(401, f"Not logged in.")
