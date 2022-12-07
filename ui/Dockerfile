FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
# RUN npm install -g npm
RUN npm install
COPY . .
RUN npm run build
RUN chmod a+x /app/entry.sh
EXPOSE 3000
CMD ["/bin/sh", "/app/entry.sh"]