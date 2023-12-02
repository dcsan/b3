login:="root@rik.ai"
appName:="kb.rik.ai"
deployDir:="/mnt/ext250/web-apps/kb.rik.ai"
clientDir:="/mnt/ext250/web-apps/kb.rik.ai/client"
serverDir:="/mnt/ext250/web-apps/kb.rik.ai/server"

default:
  @just --list

# remove build artifacts
clean:
  rm -rf dist

cls:
  clear && printf '\e[3J'

login:
	ssh {{login}}


############---------- DEVOPS -----------
# just run this once
nginxSetup:
	# scp devops/*.nginx ${login}:${deployDir}
	scp devops/*.nginx {{login}}:/etc/nginx/sites-enabled/
	@echo "testing config:"
	ssh {{login}} "sudo nginx -t"
	@echo "restarting nginx"
	ssh {{login}} "sudo nginx -t && sudo systemctl restart nginx"

check-deploy-dirs:
	# make deploy dir
	ssh {{login}} "mkdir -p {{clientDir}}"
	ssh {{login}} "mkdir -p {{serverDir}}"

# image files can have wrong permissions when copied from internet
fixPermissionsClient:
	# directories 755
	find client/public -type d -exec chmod 755 {} \;
	# files 644
	find client/public -type f -name '*.jpg' -exec chmod 644 {} \;
	find client/public -type f -name '*.png' -exec chmod 644 {} \;
	find client/public -type f -name '*.gif' -exec chmod 644 {} \;
	find client/public -type f -name '*.mp4' -exec chmod 644 {} \;
	find client/public -type f -name '*.mov' -exec chmod 644 {} \;
	find client/public -type f -name '*.svg' -exec chmod 644 {} \;
	find client/public -type f -name '*.webp' -exec chmod 644 {} \;



sync-client: fixPermissionsClient
	rsync -avi --delete \
		--exclude .git \
		--exclude coverage \
		--exclude ./src/* \
		--exclude *.ts \
		--exclude .vscode \
		--exclude .build \
		--exclude .github \
		--exclude coverage \
		--exclude logs/*.log \
		--exclude docs \
		--exclude .vscode \
		--exclude node_modules \
		--exclude *.map \
		--exclude src \
		--exclude bin \
		--exclude more \
		--exclude .DS_Store \
		--exclude ignored \
		--exclude readme.md \
		client/dist/ {{login}}:{{clientDir}}

sync-server:
	rsync -avi --delete \
		--exclude .git \
		--exclude coverage \
		--exclude src \
		--exclude *.ts \
		--exclude .vscode \
		--exclude .build \
		--exclude .github \
		--exclude coverage \
		--exclude logs/*.log \
		--exclude docs \
		--exclude .vscode \
		--exclude *.map \
		--exclude src \
		--exclude bin \
		--exclude more \
		--exclude .DS_Store \
		--exclude node_modules \
		--exclude ignored \
		--exclude readme.md \
		server/ {{login}}:{{serverDir}}

	echo "done"

switch-env name='.env.production':
	-cd client && rm .env
	cd client && ln -s {{name}} .env

switch-prod:
	@just switch-env ".env.production"

switch-local:
	@just switch-env ".env.local"

deploy-client: switch-prod build-client sync-client switch-local

build-client:
	cd client && pnpm build

build-server:
	cd server && pnpm build

# first time cold start
# assumes pnpm -g is on the server
server-boot:
	ssh {{login}} "cd {{serverDir}} pnpm install"
	ssh {{login}} "cd {{serverDir}} && NODE_ENV=prod pm2 start dist/server.js --name {{appName}}"
	ssh {{login}} "pm2 logs {{appName}}"

deploy-server: build-server
	cd server && bin/deploy-image.sh

deploy-both: deploy-client deploy-server

## ---------- GCP ----------

gcp-login:
	gcloud auth login --account dc@rik.ai

# confirm active project eg dev/staging etc
gcp-check-project:
  @echo "project is: "
  @gcloud config get-value project

confirm:
  @read -p "continue or cancel? " -n 1 -r

gcp-project-set projectID='kbxt-404306':
  gcloud config set project {{projectID}}

gcp-show-config:
  gcloud projects list
  gcloud auth list
  gcloud config configurations list


