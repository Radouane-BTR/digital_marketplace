#!/bin/bash

# Store the original IFS
OIFS="$IFS"
# Update the IFS to only include newline
IFS=$'\n'

#Test your custom vars here:

#?ROOTURL?
if [ ! "$1" ]; then
  read -rp "Root Url: " ROOTURL
else
  ROOTURL=$1
fi

#?GITHUBID?
if [ ! "$2" ]; then
  read -rp "Github Client ID: " GITHUBID
else
  GITHUBID=$2
fi

#?GITHUBSECRET?
if [ ! "$3" ]; then
  read -rp "Github Client Secret: " GITHUBSECRET
else
  GITHUBSECRET=$3
fi

#?KEYCLOAKURL?
if [ ! "$4" ]; then
  read -rp "Keycloak Url: " KEYCLOAKURL
else
  KEYCLOAKURL=$4
fi

#?KEYCLOAK_CLIENT_SECRET?
KEYCLOAK_CLIENT_SECRET=$5

#?IDIRCLIENTSECRET?
IDIRCLIENTSECRET="$6"

#?VENDORCLIENTSECRET?
VENDORCLIENTSECRET="$7"

#Add generated or constant Custom vars


for REALMFILE in realms/*.template.json; do
  PRODREALMFILE="${REALMFILE%%.*}.json"

  echo "GENERATING $PRODREALMFILE ..."

  while read -r LINE || [ -n "$LINE" ]; do

    #Secret Regeneration
    #?UUID?
    if [[ $LINE == *"?UUID?"* ]]; then
      LINE=${LINE//\?UUID\?/"$(uuidgen)"}
    fi

    #Add your custom vars swap here:

    #?ROOTURL?
    if [[ $LINE == *"?ROOTURL?"* ]]; then
      LINE=${LINE//\?ROOTURL\?/"${ROOTURL}"}
    fi

    #?GITHUBID?
    if [[ $LINE == *"?GITHUBID?"* ]]; then
      LINE=${LINE//\?GITHUBID\?/"${GITHUBID}"}
    fi

    #?GITHUBSECRET?
    if [[ $LINE == *"?GITHUBSECRET?"* ]]; then
      LINE=${LINE//\?GITHUBSECRET\?/"${GITHUBSECRET}"}
    fi

    #?KEYCLOAKURL?
    if [[ $LINE == *"?KEYCLOAKURL?"* ]]; then
      LINE=${LINE//\?KEYCLOAKURL\?/"${KEYCLOAKURL}"}
    fi

    #?IDIRCLIENTSECRET?
    if [[ $LINE == *"?IDIRCLIENTSECRET?"* ]]; then
      if [[ "$IDIRCLIENTSECRET" != "" ]]; then
        LINE=${LINE//\?IDIRCLIENTSECRET\?/"${IDIRCLIENTSECRET}"}
      else
        LINE=${LINE//\?IDIRCLIENTSECRET\?/"$(uuidgen)"}
      fi
    fi

    #?VENDORCLIENTSECRET?
    if [[ $LINE == *"?VENDORCLIENTSECRET?"* ]]; then
      if [[ "$VENDORCLIENTSECRET" != "" ]]; then
        LINE=${LINE//\?VENDORCLIENTSECRET\?/"${VENDORCLIENTSECRET}"}
      else
        LINE=${LINE//\?VENDORCLIENTSECRET\?/"$(uuidgen)"}
      fi
    fi

    #?VENDORCLIENTSECRET?
    if [[ $LINE == *"?KEYCLOAK_CLIENT_SECRET?"* ]]; then
      if [[ "$KEYCLOAK_CLIENT_SECRET" != "" ]]; then
        LINE=${LINE//\?KEYCLOAK_CLIENT_SECRET\?/"${KEYCLOAK_CLIENT_SECRET}"}
      else
        LINE=${LINE//\?KEYCLOAK_CLIENT_SECRET\?/"$(uuidgen)"}
      fi
    fi

    echo "$LINE"
  done <"${REALMFILE}" >"${PRODREALMFILE}"

  rm "${REALMFILE}"
done

# Reset IFS
IFS="$OIFS"
