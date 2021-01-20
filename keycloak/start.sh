#!/bin/bash

#doc Keycloak: https://www.keycloak.org/getting-started/getting-started-docker

source .env

if [ ! "$(docker ps -q -f name=keycloak_dm)" ]; 
then
    if [ "$(docker ps -aq -f status=exited -f name=keycloak_dm)" ]; 
    then
        docker start keycloak
    else
        docker run -d --name keycloak_dm -p 8080:8080 -e KEYCLOAK_USER=$KEYCLOAK_ADMIN_USER -e KEYCLOAK_PASSWORD=$KEYCLOAK_ADMIN_PASS keycloak_dm
    fi
else
    docker stop keycloak
    docker start keycloak
fi