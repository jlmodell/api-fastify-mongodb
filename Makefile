all: stop build run

build:
	docker build -t "busseapi9090" .

run:
	docker run -d --name "busseapi90900" --env-file "docker.env" --restart "always" -p 9090:9090 busseapi9090

stop:
	docker stop busseapi9090 && docker rm busseapi9090 && docker image rm -f busseapi9090

git:
	git commit -m "updates" && git push
