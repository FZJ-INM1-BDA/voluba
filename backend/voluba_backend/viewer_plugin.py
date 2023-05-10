from fastapi import APIRouter
from fastapi.responses import HTMLResponse
import math
from pathlib import Path
import json

router = APIRouter()

with open(Path(__file__).parent / "template.html", "r") as fp:
    cached_template = fp.read()

def verify_transform(transform: str):
    if not transform:
        return None
    
    to_number = [ float(v) for v in transform.split(",") ]

    if len(to_number) != 12 or any([math.isnan(v) for v in to_number]):
        return None
    return [
        to_number[:4],
        to_number[4:8],
        to_number[8:],
        [0, 0, 0, 1]
    ]


@router.get("/template.html")
def template_endpoint(precomputed: str, transform: str):
    global cached_template

    if precomputed is not None:
        return_content = cached_template.replace(
            "const precomputedUrl = null",
            f"const precomputedUrl = DOMPurify.sanitize( {json.dumps(precomputed.replace('precomputed://', ''))} )"
        )

    
    xform = verify_transform(transform)

    return_content = return_content.replace(
        "const transform = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]",
        f"const tranasform = {json.dumps(xform)}"
    )
    return HTMLResponse(return_content)
