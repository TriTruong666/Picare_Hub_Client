FROM node:24-alpine AS build
WORKDIR /app


ARG VITE_OMS_API_URL
ARG VITE_HUB_API_URL


ENV VITE_OMS_API_URL=$VITE_OMS_API_URL
ENV VITE_HUB_API_URL=$VITE_HUB_API_URL

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build


FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]