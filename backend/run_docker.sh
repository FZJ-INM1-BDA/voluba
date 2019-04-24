#!/bin/bash

app="spatial-alignment-backend"

sh ./clean_docker.sh

# Build the new docker image
docker build -t "$app" .

# Run the new docker container
docker run --name "$app" --restart always -d -p 5000:5000 "$app"
