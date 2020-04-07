run: 
	npm run start

testing:
	npm run test

docker_build:
	docker build -t "busse-api-v3-9090" .

docker_run:
	docker run -d --name "busse-api-v3-9090" --env-file "docker.env" --restart "always" -p 9090:9090 busse-api-v3-9090

docker_remove:
	docker stop busse-api-v3-9090 && docker image rm -f busse-api-v3-9090