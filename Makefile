NAME = le_pong

$(NAME): required_folders
	docker compose up

all: $(NAME)
	docker compose up

required_folders:
	mkdir -p ./backend/db
	mkdir -p ./backend/cache

clean:
	docker compose down -v --rmi all

fclean: clean
	rm -rf ./backend/db
	rm -rf ./backend/cache

squeeky-clean: fclean
	rm -rf ./backend/nest/app/dist
	rm -rf ./backend/nest/app/node_modules
	rm -rf ./frontend/angular/.angular
	rm -rf ./frontend/angular/node_modules

docker-prune:
	docker system prune -a