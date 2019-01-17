# Backend

## Installation

First set up a virtual environment for the backend:

    cd backend
    python3 -m venv venv
    python -m pip install -r ./spatial_alignment_backend/requirements.txt
    pip install -e .
    
Once this is done, you can use the following command to start the backend:

    python ./spatial_alignment_backend/run.py
    

## Docker

Use the following commands to deploy the backend via Docker:

    cd backend
    sh ./run_docker.sh
    
To stop and remove the docker container (+ docker image) use the following commands:

    cd backend
    sh ./clean_docker.sh
