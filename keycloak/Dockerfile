FROM quay.io/keycloak/keycloak:latest

#Add realm template vars as ARG here:
ARG ROOTURL
ARG GITHUBID
ARG GITHUBSECRET
ARG KEYCLOAKURL

USER root

#Install uuidgen
RUN microdnf install -y util-linux && microdnf clean all

USER 1000

WORKDIR /tmp/realmconfig
COPY --chown=1000 realms ./realms
COPY --chown=1000 ./realmconfig.sh .

#Pass your template VARS to realmconfig script:
RUN ./realmconfig.sh "${ROOTURL}" "${GITHUBID}" "${GITHUBSECRET}" "${KEYCLOAKURL}"
RUN ls -m -d $PWD/realms/*.json | tr -d '[:space:]' > /tmp/realmfileslist

ENTRYPOINT /opt/jboss/tools/docker-entrypoint.sh -b 0.0.0.0 -Dkeycloak.import=$(cat /tmp/realmfileslist)
