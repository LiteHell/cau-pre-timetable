#!/bin/sh
cd /app

# Configure cron
echo "0 0/6 * * * node /app/crawl > /app/crontab.log" > /etc/crontabs/root

# Crawl before app start
if [ ! -f /app/build/courses/crawlInfo.json ]
then
    echo "First crawl"
    node ./crawl
else
    echo "Skipping first crawl"
fi

# Run cron
crond

# Start production
echo "Starting"
yarn serve