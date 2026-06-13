#! /bin/bash

helm upgrade \
    --history-max 3 \
    -f .helm/deployments/legacy/values.yaml \
    voluba-prod-legacy \
    .helm/voluba-prod
