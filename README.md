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

3. Start Postgres DB Image (*or use any other Postgres Server*)
    ```bash
    docker stack deploy -c docker-compose.db.yml 
    ```
    
4. Run DB Migrations -- **TODO**

## Infrastructure
This project uses Google Cloud Platform and Terraform.

1. Create project in GCP
2. Update project id in main.tf
3. [Create GCP Service User](https://cloud.google.com/docs/authentication/getting-started)
    In order to run the included terraform scripts, you must first setup the service user 
    and then download the associated credentials (json key file).
4. Download keyfile
    ```bash
    mv ~/Downloads/{{keyfile}}.json ~/.gcp/
    ```
5. Export ENV Variable with keyfile location
    ```bash
    export GOOGLE_CLOUD_KEYFILE_JSON={{path}}    
    ```
6. Run terraform
```bash
terraform apply
```