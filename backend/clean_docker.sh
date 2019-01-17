#!/bin/bash

app="spatial-alignment-backend"

container_id=$(docker ps -q -f name="$app")
if [ -n "$container_id" ]; then
    # Stop and remove the old docker container
    docker stop "$app" && docker rm -f "$app"
    echo "Stopped and removed docker container \"$app\" successfully!"
else
    echo "Docker container \"$app\" does not exist!"
fi

image=$(docker images | grep "$app")
if [ -n "$image" ]; then
    # Remove the old docker image
    docker rmi -f "$app"
    echo "Removed docker image \"$app\" successfully!"
else
    echo "Docker image \"$app\" does not exist!"
fi
