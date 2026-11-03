FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build


FROM nginx:stable-alpine
RUN apk add --no-cache ca-certificates
RUN nginx -V 2>&1 | grep -q -- '--with-http_auth_request_module'
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
