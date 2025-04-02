#! /bin/bash

helm install \
    -f .helm/deployments/legacy/values.yaml \
    voluba-prod-legacy \
    .helm/voluba-prod
