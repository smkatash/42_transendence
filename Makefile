NAME = le_pong

$(NAME):
	./docker/replace_ng_env.sh
	docker compose up --build

all: $(NAME)

clean:
	docker compose down -v --rmi all

fclean: clean
	rm -rf ./app/backend/app/node_modules
	rm -rf ./app/frontend/.angular
	rm -rf ./app/frontend/node_modules

docker-prune:
	docker system prune -a --volumes