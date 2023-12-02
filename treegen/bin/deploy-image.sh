# from the dropdown at the top of Cloud Console:
export GCLOUD_PROJECT="kbxt-404306"
# from Step 2.2 above:
export REPO="kbx"
# the region you chose in Step 2.4:
export REGION="us-west2"
# whatever you want to call this image:
export IMAGE="kbx-image"

# use the region you chose above here in the URL:
export IMAGE_TAG=${REGION}-docker.pkg.dev/$GCLOUD_PROJECT/$REPO/$IMAGE

# Build the image:
docker build -t $IMAGE_TAG -f ./Dockerfile --platform linux/x86_64 .
# Push it to Artifact Registry:
docker push $IMAGE_TAG

gcloud run deploy kbx-v1 --image us-west2-docker.pkg.dev/kbxt-404306/kbx/kbx-image --region us-west2

echo "IMAGE_TAG $IMAGE_TAG"

curl https://kbx-v1-dmtlqdu4eq-wl.a.run.app