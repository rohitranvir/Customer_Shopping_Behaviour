FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy project files
COPY . .

EXPOSE 5173
