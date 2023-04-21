from fastapi import Request
from fastapi.routing import APIRouter
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
import json
import voluba_config
import voluba_auth

router = APIRouter()

@router.get("")
@router.get("/")
async def user(request: Request):
    try:
        uuid = request.session[voluba_config.PROFILE_KEY]
        return JSONResponse(
            voluba_auth.token_store.get_token(uuid)
        )
    except Exception as e:
        print('Get user error:', e)
        raise HTTPException(401)
