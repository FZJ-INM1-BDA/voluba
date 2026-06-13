#! /bin/bash

helm install \
    -f .helm/deployments/ebrains/values.yaml \
    voluba-prod-ebrains \
    .helm/voluba-prod
