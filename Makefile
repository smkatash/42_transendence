NAME = le_pong

$(NAME):
	docker compose up --build

all: $(NAME)

clean:
	docker compose down -v --rmi all

fclean: clean
	rm -rf ./backend/nest/app/dist
	rm -rf ./backend/nest/app/node_modules
	rm -rf ./frontend/angular/.angular
	rm -rf ./frontend/angular/node_modules

docker-prune:
	docker system prune -a --volumes