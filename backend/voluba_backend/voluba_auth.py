from fastapi import Request
from fastapi.routing import APIRouter
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from authlib.oauth2.auth import OAuth2Token
from authlib.integrations.starlette_client import StarletteOAuth2App
import voluba_config
from uuid import uuid4
import time

class token_store:
    _dict = {}

    @staticmethod
    def set_token(key: str, token):
        token_store._dict[key] = {
            'created_time': time.time(),
            'data': token
        }
    
    @staticmethod
    def get_token(key: str):
        if key in token_store._dict:
            return token_store._dict[key].get("data")
    
    @staticmethod
    def delete_token(key: str):
        token_store._dict.pop(key, None)


oauth = OAuth()

oauth.register(
    name="ebrains",
    server_metadata_url=f"{voluba_config.EBRAINS_IAM_DISCOVERY_URL}/.well-known/openid-configuration",
    client_id=voluba_config.EBRAINS_IAM_CLIENT_ID,
    client_secret=voluba_config.EBRAINS_IAM_CLIENT_SECRET,
    client_kwargs={
        "scope": voluba_config.EBRAINS_IAM_SCOPE,
    },
)

oauth.register(
    name="orcid",
    server_metadata_url=f"{voluba_config.ORCID_DISCOVERY_URL}/.well-known/openid-configuration",
    client_id=voluba_config.ORCID_CLIENTID,
    client_secret=voluba_config.ORCID_CLIENTSECRET,
    client_kwargs={
        "scope": voluba_config.ORCID_SCOPE,
    },
)

router = APIRouter()

def process_hbp_user(resp):
    userinfo = resp.get("userinfo")
    return {
        'id': f'hbp-oidc-v2:{userinfo.get("sub")}',
        'name': f'{userinfo.get("given_name")} {userinfo.get("family_name")}',
        'type': 'hbp-oidc-v2',
        'idToken': resp.get("id_token"),
        'accessToken': resp.get("access_token"),
    }
@router.get("/hbp-oidc-v2/auth")
async def login_via_ebrains(request: Request, state: str = None):
    kwargs = {}
    if state:
        kwargs["state"] = state
    return await oauth.ebrains.authorize_redirect(request, redirect_uri=voluba_config.EBRAINS_IAM_REDIRECT_URL, **kwargs)

@router.get("/hbp-oidc-v2/cb")
async def ebrains_callback(request: Request):
    if voluba_config.PROFILE_KEY not in request.session:
        request.session[voluba_config.PROFILE_KEY] = str(uuid4())
    token: OAuth2Token = await oauth.ebrains.authorize_access_token(request)
    token_store.set_token(
        request.session[voluba_config.PROFILE_KEY],
        process_hbp_user(token)
    )
    return RedirectResponse(voluba_config.HOSTNAME)


def process_orcid_user(resp):
    userinfo = resp.get("userinfo")
    return {
        'id': f'orcid:{userinfo.get("sub")}',
        'name': f'{userinfo.get("given_name")} {userinfo.get("family_name")}',
        'type': 'orcid-oidc',
        'idToken': resp.get("id_token"),
        'accessToken': resp.get("access_token"),
    }
@router.get("/orcid-oidc/auth")
async def login_via_orcid(request: Request, state: str = None):
    kwargs = {}
    if state:
        kwargs["state"] = state
    return await oauth.orcid.authorize_redirect(request, redirect_uri=voluba_config.ORCID_REDIRECT_URL, **kwargs)

@router.get("/orcid-oidc/cb")
async def orcid_callback(request: Request):
    if voluba_config.PROFILE_KEY not in request.session:
        request.session[voluba_config.PROFILE_KEY] = str(uuid4())
    token: OAuth2Token = await oauth.orcid.authorize_access_token(request)
    token_store.set_token(
        request.session[voluba_config.PROFILE_KEY],
        process_orcid_user(token)
    )
    return RedirectResponse(voluba_config.HOSTNAME)



@router.get("/logout")
async def logout(request: Request):
    token_store.delete_token(
        request.session.pop(voluba_config.PROFILE_KEY, None)
    )
    return RedirectResponse(voluba_config.HOSTNAME)
