# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_BASE_URL=http://localhost:3001
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
