# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose port (change if your app runs on another)
EXPOSE 4000

# Start the app
CMD ["node", "server.js"]

