# 🔧 Build Angular app
FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN npm install && npm run build -- --configuration production

# 🚀 Serve con nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Optional: elimina cache
RUN rm -rf /etc/nginx/conf.d/default.conf
