from fastapi import Request
from fastapi.routing import APIRouter
from fastapi.responses import RedirectResponse

from authlib.integrations.starlette_client import OAuth
from authlib.integrations.requests_client.oauth2_session import OAuth2Session
from authlib.oauth2.auth import OAuth2Token
from base64 import b64decode

import voluba_config
from voluba_store import VolubaStore

from uuid import uuid4
import time
import json

# By default, starlette session writes *everything* in cookie
# This is inefficient and adds attack surface.
# Instead, tokens will be stored server side. Client will be issued a
# UUID. With the said UUID, server will fetch the token.
token_store = VolubaStore()

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

router = APIRouter(include_in_schema=False)

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
    token_store.set_value(
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
    token_store.set_value(
        request.session[voluba_config.PROFILE_KEY],
        process_orcid_user(token)
    )
    return RedirectResponse(voluba_config.HOSTNAME)



@router.get("/logout")
async def logout(request: Request):
    token_store.delete_value(
        request.session.pop(voluba_config.PROFILE_KEY, None)
    )
    return RedirectResponse(voluba_config.HOSTNAME)


class S2SToken:
    s2s_token=None
    exp=None

    @staticmethod
    def refresh():
        
        token_endpoint = f"{voluba_config.EBRAINS_IAM_DISCOVERY_URL}/protocol/openid-connect/token"
        if not voluba_config.EBRAINS_SA_CLIENT_SECRET or not voluba_config.EBRAINS_SA_CLIENT_ID:
            raise Exception(f"sa client id or sa client secret not set. cannot get s2s token")
        
        client = OAuth2Session(voluba_config.EBRAINS_SA_CLIENT_ID, voluba_config.EBRAINS_SA_CLIENT_SECRET, scope="openid team roles group")
        token = client.fetch_token(token_endpoint, grant_type='client_credentials')
        auth_token = token.get("access_token")
        S2SToken.s2s_token = auth_token
        _header, body, _sig, *_rest = auth_token.split('.')
        S2SToken.exp = json.loads(b64decode(body.encode("utf-8") + b"====").decode("utf-8")).get("exp")

    @staticmethod
    def get_token():
        if S2SToken.s2s_token is None:
            S2SToken.refresh()
        diff = S2SToken.exp - time.time()
        # if the token is about to expire (30 seconds)
        if diff < 30:
            S2SToken.refresh()
        return S2SToken.s2s_token
        