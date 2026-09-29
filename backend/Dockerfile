# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm ci

# COPY . .

# RUN npm run build

# EXPOSE 5001

# CMD ["npm", "start"]


FROM node:24-alpine

WORKDIR /app

# Required to build native Node.js modules such as argon2
RUN apk add --no-cache \
    python3 \
    make \
    g++

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5001

CMD ["npm", "start"]