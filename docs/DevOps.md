# DevOps

## deploy setup - client

deploy nginx without cert

certbot --nginx

add new domain
copy certbot block to nginx file for later

## deploy setup - server

have to setup a test repo on GCP to get an address to deploy to via the webUI first

https://medium.com/@taylorhughes/how-to-deploy-an-existing-docker-container-project-to-google-cloud-run-with-the-minimum-amount-of-daca0b5978d8

new one:
https://console.cloud.google.com/artifacts/create-repo?project=kbxt-404306

setup here:
https://console.cloud.google.com/artifacts/docker/kbxt-404306/us-west2/kbx?project=kbxt-404306



```sh
# https://buildpacks.io/docs/tools/pack/
brew install buildpacks/tap/pack
just g
```

gcloud auth configure-docker us-west2-docker.pkg.dev

