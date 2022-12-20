# Cau-pre-timetable
This web app is to looking for [Chung-Ang Univ.](https://www.cau.ac.kr) lectures before official lecture schedule publication date.

This app uses docker, and crawls lectures automatically every 6 hours.

1. Build app with docker
1. Create docker volume (Skip this if you already did)
1. Run `docker run -e CAU_YEAR=2023 -e CAU_SEMESTER=1 -p 3000:3000/tcp -v <docker-volume-name>:/app/build/courses <image id>`
    * Change `<image id>` and `<docker-volume-name>` properly.
    * Change value of CAU_YEAR and CAU_SEMESTER to what you want to crawl.
    * Run with `-d` docker parameter if you want to run docker instance detached.
1. Wait some minutes if it's first run
1. Done! Visit `http://127.0.0.1:3000`