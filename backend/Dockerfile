# Use official Node.js LTS light-weight alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package descriptors first to leverage Docker cache
COPY package*.json ./

# Install packages
RUN npm install

# Copy the rest of the application files
COPY . .

# Compile TypeScript into JavaScript
RUN npm run build

# Expose port
EXPOSE 3000

# Run migrations and start application
CMD ["node", "dist/index.js"]
