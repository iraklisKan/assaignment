FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for migrations)
RUN npm install

# Copy application files
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
