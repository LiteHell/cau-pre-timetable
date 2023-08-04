FROM node:18-alpine

# Set workdir
WORKDIR /app

# Install cron
RUN apk add --no-cache dcron

# Copy public files
COPY public /app/public

# Copy package.json and install dependencies
COPY yarn.lock /app
COPY package.json /app
RUN yarn

# Copy source files
COPY src /app/src
COPY tsconfig.json /app

# Build web app
RUN yarn build

# Set volume
VOLUME [ "/app/build/courses" ]

# Copy start script and crawl script
COPY start.sh /app/start.sh
COPY crawl.js /app

# Expose port
EXPOSE 3000

# Mark entrypoint file executable
RUN ["chmod", "+x", "/app/start.sh"]

# Set entrypoint
ENTRYPOINT [ "/app/start.sh" ]
