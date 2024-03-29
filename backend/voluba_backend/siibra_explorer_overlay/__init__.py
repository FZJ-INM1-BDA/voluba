from fastapi import APIRouter, Response
from pathlib import Path
from typing import List
import json

with open(Path(__file__).parent / 'template.html', 'r') as fp:
    template_str = fp.read()

router = APIRouter()

def islen(num: int):
    return lambda variable: isinstance(variable, list) and len(variable) == num

def verify_transform(transform: str) -> List[List[float]]:
    """
    transform is provided as a str of 12 comma separated floats,
    reshaped to 4x3 row major affine.
    This function checks the validity and returns the actual affine.
    """
    return_result = [float(v) for v in transform.split(",")]
    assert islen(12)(return_result)
    return [
        return_result[:4],
        return_result[4:8],
        return_result[8:12],
        [0, 0, 0, 1]
    ]

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
