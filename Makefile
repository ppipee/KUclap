#### Varible 
GUTHUB_USERNAME = aslupin
IMAGE_KUCLAP_WEB = kuclap-web
TAG_KUCLAP_WEB = v1
REPO_OWNER = kuclap
REPO_NAME = kuclap

#### Heroku
DYNO_PROCESS = web

#### Server 
WORKER_STAGING = kuclap-web-staging
WORKER_PRE_PRODUCTION = kuclap-web-pre-production

#### Utils
docker-compose-with-args:
	docker-compose build --build-arg URL_API="https://kuclap-api.herokuapp.com" --build-arg SERVER_PORT="8080" --build-arg SSR=true
docker-with-args-web:
	docker build --build-arg URL_API=https://kuclap-api.herokuapp.com --build-arg SERVER_PORT=8080 --build-arg SSR=true -f ./docker/Web.Dockerfile . --no-cache

#### Heroku On Hand
## push container 
heroku-container-push-staging:
	heroku container:push ${DYNO_PROCESS} --app ${WORKER_STAGING}
# heroku-container-push-production:
# 	heroku container:push ${DYNO_PROCESS} --app ${WORKER_PRE_PRODUCTION}
## release container 
heroku-container-release-staging:
	heroku container:release ${DYNO_PROCESS} --app ${WORKER_STAGING}
# heroku-container-release-production:
# 	heroku container:release ${DYNO_PROCESS} --app ${WORKER_PRE_PRODUCTION}

#### Deploy
## Staging 
deploy-to-staging:
	heroku container:push ${DYNO_PROCESS} --recursive --context-path . --app ${WORKER_STAGING} && heroku container:release ${DYNO_PROCESS} --app ${WORKER_STAGING}
deploy-to-pre-production:
	heroku container:push ${DYNO_PROCESS} --recursive --context-path . --app ${WORKER_PRE_PRODUCTION} && heroku container:release ${DYNO_PROCESS} --app ${WORKER_PRE_PRODUCTION}

#### Manual command
## Push image to kuclpa's github pkg.
handon-login-github-pkg-for-push-image-to-repo:
	# Prerequire: you have to already exist image built.
	# suggest: use kuclap-web:v1 for building image from dockerfile.
	@ docker tag ${IMAGE_KUCLAP_WEB}:${TAG_KUCLAP_WEB} docker.pkg.github.com/${REPO_OWNER}/${REPO_NAME}/${IMAGE_KUCLAP_WEB}:${TAG_KUCLAP_WEB}
	@ cat ./TOKEN_GITHUB_PKG_REGISTRY.txt | docker login https://docker.pkg.github.com -u ${GUTHUB_USERNAME} --password-stdin
	# you have to generate token from this url (https://github.com/settings/tokens)
	# copy token and paste in TOKEN_GITHUB_PKG_REGISTRY.txt file (you have to create text file)
	# change {GUTHUB_USERNAME} to your username 
	# then run the command "make onhand-login-github-pkg-for-push-image-to-repo"
	@ docker push docker.pkg.github.com/kuclap/kuclap/kuclap-web
	# push image to github pkg

