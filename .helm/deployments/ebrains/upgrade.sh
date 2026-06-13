#! /bin/bash

helm upgrade \
    --history-max 3 \
    -f .helm/deployments/ebrains/values.yaml \
    voluba-prod-ebrains \
    .helm/voluba-prod
