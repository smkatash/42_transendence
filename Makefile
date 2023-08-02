NAME = le_pong

$(NAME): db
	docker compose up

all: $(NAME)
	docker compose up

db:
	mkdir -p ./backend/db

clean:
	docker compose down -v --rmi all

squeeky-clean:
	docker compose down -v --rmi all
	rm -rf ./backend/db
	rm -rf ./backend/nest/app/dist
	rm -rf ./backend/nest/app/node_modules
	rm -rf ./frontend/angular/.angular
	rm -rf ./frontend/angular/node_modules

docker-prune:
	docker system prune -a