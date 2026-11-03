FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build


FROM node:24-alpine AS ui-access
WORKDIR /app
COPY security/ui-access.mjs ./ui-access.mjs
COPY --from=build /app/dist/.security/ui-policy.json ./ui-policy.json
USER node
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD node -e "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "ui-access.mjs"]

FROM nginx:stable-alpine AS hub-client
RUN apk add --no-cache ca-certificates
RUN nginx -V 2>&1 | grep -q -- '--with-http_auth_request_module'
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q --spider http://127.0.0.1/login || exit 1
CMD ["nginx", "-g", "daemon off;"]
