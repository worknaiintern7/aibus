# ===============================
# Stage 1: Build React/Vite App
# ===============================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Pass API URL if provided at build time (e.g., https://api.yourdomain.com or /api)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Address of the separate agent portal app (/agent on this site redirects there)
ARG VITE_AGENT_PORTAL_URL
ENV VITE_AGENT_PORTAL_URL=$VITE_AGENT_PORTAL_URL

# Build production bundle
RUN npm run build

# ===============================
# Stage 2: Serve with Nginx
# ===============================
FROM nginx:alpine

# Remove default nginx config and replace with custom SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
