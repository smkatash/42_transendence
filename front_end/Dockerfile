FROM node:18

WORKDIR pong/app

# RUN npm install -g npm@9.8.0
RUN npm install
RUN npm link @angular/cli
RUN export PATH="$HOME/.npm-packages/bin:$PATH"
RUN npm uninstall -g @angular/cli
RUN npm install -g @angular/cli -y

EXPOSE 4200

# Start the Angular development server
# CMD ["ng serve --host 0.0.0.0 --port 4200"]
# CMD ["sleep", "3600"]