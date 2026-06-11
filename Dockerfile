# =========================================
# Stage 1: Build Angular
# =========================================
FROM node:24.14.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build 

# =========================================
# Stage 2: Serve with Nginx
# =========================================
FROM nginx:alpine
# Angular builds into /dist/[project-name]. 
# Ensure you check your angular.json for the exact "outputPath"
COPY --from=builder /app/dist/diet-FE/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
