# Cau-pre-timetable
This web app is to looking for [Chung-Ang Univ.](https://www.cau.ac.kr) lectures before official lecture schedule publication date.

This app uses docker, and crawls lectures automatically every 6 hours if you use docker.

## With docker
1. Build an app image with docker
1. Create docker volume (Skip this if you already did)
1. Run `docker run -p 3000:3000/tcp -v <docker-volume-name>:/app/build/courses <image id>`
    * Change `<image id>` and `<docker-volume-name>` properly.
    * Run with `-d` docker parameter if you want to run docker instance detached.
1. Wait some minutes if it's first run
1. Done! Visit `http://127.0.0.1:3000`

## Without docker
1. Install node v16 and [yarn](https://yarnpkg.com).
1. run `yarn`
1. run `yarn build`
1. run `node ./crawl`
1. run `yarn serve`
1. Set timer to run `node ./crawl` periodically with something like crontab.

## License
Distributed under MIT License. For further information, see [LICENSE](LICENSE) file.