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
    
4. Run DB Migrations **(see note on TypeORM & Typescript)**
    ```bash
    npm run db:migrate
    ```
    OR
    ```bash
    yarn run db:migrate
    ```

## Generating Migrations
**(see note on TypeORM & Typescript)**
Run the following command:
```bash
npm run db:generate -- "-n <EntityName>"
```
Where <EntityName> is the exported class name of an entity to generate a new migration from.


## Note on TypeORM CLI & Typescript
Typeorm loads JS files, so we need to build the TS files first, and the paths for entities,migrations,etc used by
the CLI must target the ```dist/``` folder.

The NPM scripts in this package are setup to build first, so just execute the ```db:*``` commands included.

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

## Travis Builds
If you need to change the encrypted secrets used within the travi-ci build environment
the following command needs to be run localy. See [Travis Docs](https://docs.travis-ci.com/user/environment-variables/#encrypting-environment-variables)
```sh
travis encrypt TYPEORM_PASSWORD=<secret> --add
travis encrypt WEGMANS_USERNAME=<secret> --add
travis encrypt WEGMANS_PASSWORD=<secret> --add
```