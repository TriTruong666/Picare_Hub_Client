FROM node:24-alpine AS build
WORKDIR /app


ARG ENV_JSON
ENV ENV_JSON=$ENV_JSON

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .

# Generate .env.production from JSON secret
RUN if [ -n "$ENV_JSON" ]; then \
    node -e "const env = JSON.parse(process.env.ENV_JSON); Object.entries(env).forEach(([k, v]) => console.log(\`\${k}=\${v}\`))" > .env.production; \
    fi

RUN npm run build


FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]