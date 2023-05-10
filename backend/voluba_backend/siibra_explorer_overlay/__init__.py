from fastapi import APIRouter, Response
from pathlib import Path
import json

with open(Path(__file__).parent / 'template.html', 'r') as fp:
    template_str = fp.read()

router = APIRouter()

def islen4(variable):
    assert isinstance(variable, list)
    assert len(variable) == 4

def verify_transform(transform: str):
    return_result = [float(v) for v in transform.split(",")]
    assert islen4(return_result)
    assert all([islen4(row) for row in return_result])
    assert all([isinstance(row, (int, float)) for row in return_result for item in row])

@router.get("/template.html", include_in_schema=False)
def get_template(precomputed: str, transform: str):

    return Response(
        template_str.replace(
            "const precomputedUrl = null",
            f"const precomputedUrl = DOMPurify.sanitize( {json.dumps(precomputed.replace('precomputed://', ''))} )"
        ).replace(
            "const transform = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]",
            f"const transform = {json.dumps(verify_transform(transform))}"
        ),
        headers={
            "cache-control": "no-cache",
            "content-type": "text/html; charset=UTF-8"
        }
    )
