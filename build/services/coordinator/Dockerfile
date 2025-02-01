FROM node:20

WORKDIR /app

COPY package*.json ./
COPY entrypoint.sh /usr/local/bin/
COPY start.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/start.sh

RUN npm install --omit=dev

COPY . .

EXPOSE 3001

ENTRYPOINT ["entrypoint.sh"]
CMD ["start.sh"]