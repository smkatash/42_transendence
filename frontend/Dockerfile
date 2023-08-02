# Using LTS as it is stable
FROM node:lts AS development

WORKDIR /app/frontend

# Copy package-lock.json & package.json from host to inside container working directory
COPY /angular/package*.json ./

# Install deps inside container
RUN npm install
# Install angular cli
RUN npm install -g @angular/cli

# Bundle app srcs
COPY /angular ./

RUN npm run build

EXPOSE 4200
