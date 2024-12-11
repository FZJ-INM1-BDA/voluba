#! /bin/bash

hosts='[{"host": "voluba.apps.ebrains.eu", "paths": [{ "path": "/", "pathType": "Prefix" }]}]'
tls='[{"secretName": "voluba-prod-ebrains-cert-secret", "hosts": ["voluba.apps.ebrains.eu"]}]'

helm install \
    voluba-prod-ebrains \
    .helm/voluba-prod/ \
    --set env.HOSTNAME=https://voluba.apps.ebrains.eu \
    --set-json ingress.hosts="$hosts" \
    --set-json ingress.tls="$tls"
