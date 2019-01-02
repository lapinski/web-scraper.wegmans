# Wegmans.com Web Scraper
A tool to scrape the wegmans.com website and download receipt information for a given user.

## Prerequisites
* NodeJS >= 10.4.0
* NPM >= 6.1.0 or [Yarn](https://yarnpkg.com/en/docs/install)
* [Docker](https://docs.docker.com/install/) (including Swarm, and Docker-Compose)

## Getting Setup for Development
1. Clone this repository
   ```bash
   git clone git@github.com:lapinski/web-scraper.wegmans.git
   ```

2. Install Dependencies
    ```bash
    yarn install
    ``` 
    OR
    ```bash
    npm install
    ```

3. Start Postgres DB Image
    ```bash
    docker stack deploy -c docker-compose.db.yml 
    ```