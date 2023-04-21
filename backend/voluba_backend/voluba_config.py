import os

HOSTNAME = os.getenv("HOSTNAME", "http://localhost:3000")
EBRAINS_IAM_CLIENT_ID = os.getenv("HBP_V2_CLIENTID")
EBRAINS_IAM_CLIENT_SECRET = os.getenv("HBP_V2_CLIENTSECRET")
EBRAINS_IAM_DISCOVERY_URL = 'https://iam.ebrains.eu/auth/realms/hbp'
EBRAINS_IAM_REDIRECT_URL = f"{HOSTNAME}/hbp-oidc-v2/cb"
EBRAINS_IAM_SCOPE = os.getenv("HBP_V2_SCOPE", 'openid email profile collab.drive')

SESSION_SECRET = os.getenv("SESSION_SECRET", "foo-bar-twelve-second")

PROFILE_KEY = 'voluba_user_uuid'


ORCID_CLIENTID = os.getenv("ORCID_CLIENTID")
ORCID_CLIENTSECRET = os.getenv("ORCID_CLIENTSECRET")
ORCID_DISCOVERY_URL = "https://orcid.org"
ORCID_REDIRECT_URL = f"{HOSTNAME}/orcid-oidc/cb"
ORCID_SCOPE = 'openid'

PATH_TO_STATIC = os.getenv("PATH_TO_STATIC", "../../app/dist")