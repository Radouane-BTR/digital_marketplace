# Déploiement de Keycloak

Basé sur https://github.com/CQEN-QDCE/keycloak-utils/tree/master/realm-deploy

## Créer un OAUTH app Github

https://github.com/settings/developers

    Application name : "Digital Marketplace local"
    Homepage URL : "http://localhost:3000"
    Autorization callback url : "http://localhost:3000"


## Construire l'image

Passer les valeurs de remplacement comme build arguments.

```bash
podman build -t keycloak_dm_test --build-arg=ROOTURL=http://localhost:3000 --build-arg=GITHUBID=[GITHUB_ID_CRÉÉ]--build-arg=GITHUBSECRET=[GITHUB_SECRET_CRÉÉ] --build-arg=KEYCLOAKURL=http://localhost:8080 .
```

## Démarrer le conteneur

```bash
podman run -d --name keycloak -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin keycloak_dm_test
```

# Choix et ajout d'un identity provider

L'application marketplace supporte plusieurs fournisseurs d'identités (identity provider) pour ses authentifications. Ceux-ci doivent être configurés dans Keycloak puis être inscrits dans le fichier de config partagé (src/shared/config.ts)

## Ajouter un identity provider dans keycloak
https://www.keycloak.org/docs/latest/server_admin/#_general-idp-config

Un mapper de type "Hardcoded Attribute" doit être ajouté ensuite. Celui-ci doit définir l'attribut "loginSource" avec l'alias du IDP comme valeur.