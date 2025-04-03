FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm 
COPY . .
EXPOSE 4000
CMD ["node", "src/app.js"]
