from typing import Iterator, Tuple
import json
import numpy as np

def convert_output(obj: dict) -> Iterator[Tuple[str, bytes]]:
    coordinate_space = obj.get("coordinateSpace")
    for expected in ["x", "y", "z"]:
        s = coordinate_space.get(expected)
        assert s, f"expected {expected} in coordinate space, but was not found"
        assert len(s) == 2, f"exactly len 2 for {expected}, but found {len(s)}"
        assert s[0] == 1e-9, f"expected 1e-9 for unit size, but got {s[0]}"
        assert s[1] == "m", f"expected 'm' for unit size, but got {s[1]}"
    transform = obj.get("transform")
    assert len(transform) == 16, f"expected len 16 for transform, but got {len(transform)}"
    assert all(isinstance(v, (int, float)) for v in transform), f"expected all transform to be int or float, but was not"

    transform = np.array(transform)
    transform = np.reshape(transform, (4, 4))
    transform = np.transpose(transform)
    
    yield "transform.json", json.dumps(transform.tolist(), indent=2).encode("utf-8")
    yield "meta.json", json.dumps({
        "version": 1,
        "transform": transform.tolist()
    }, indent=2).encode("utf-8")


foo = {
  "@type": "https://voluba.apps.hbp.eu/@types/transform",
  "version": "1.02",
  "contentHash": "Unknown hash",
  "incomingVolume": "1micron slabs",
  "referenceVolume": "Big Brain (2015 Release)",
  "coordinateSpace": {
    "x": [
      1e-9,
      "m"
    ],
    "y": [
      1e-9,
      "m"
    ],
    "z": [
      1e-9,
      "m"
    ]
  },
  "transform": [
    0.9925590753555298,
    -0.000003495841610856587,
    0.12176414579153061,
    0,
    0.12176414579153061,
    -0.00008289964898722246,
    -0.9925590753555298,
    0,
    0.000013564014807343483,
    1,
    -0.00008185712795238942,
    0,
    -43079228,
    -61343712,
    21235186,
    1
  ]
}


if __name__ == "__main__":
    for f, c in convert_output(foo):
        with open(f, "wb") as fp:
            fp.write(c)
