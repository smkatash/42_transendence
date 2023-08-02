# Using LTS as it is stable 
FROM node:lts AS development

WORKDIR /app/backend

# Copy package-lock.json & package.json from host to inside container working directory
COPY /app/package*.json ./

# Install deps inside container
RUN npm install

# Bundle app srcs
COPY /app ./

RUN npm run build

EXPOSE 3000

################
## PRODUCTION ##
################
# Build another image for production
FROM node:lts AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app/backend

COPY --from=development /app/backend ./

EXPOSE 3000

# Run app
CMD [ "node", "dist/main" ]

# Maybe this one also works?
# CMD [ "npm", "run", "start:prod" ]

