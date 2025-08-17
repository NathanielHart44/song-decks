ASOIAF Decks is the unofficial website for the A Song of Ice and Fire Miniatures Game. It is a fan-made website and is not affiliated with CMON or any other for-profit entity.

## Django and Docker

In order to migrate, use the following command:
```
docker compose run web python3 /songdecks/manage.py migrate
```

To make migrations, use the following command while inside the `songdecks` directory that includes the `manage.py` file, and while inside the virtual environment:
```
python3 manage.py makemigrations
```

## Setup Guide

1. Place all .env files
2. Create a virtual environment and pip install everything from `django/requirements.txt`.
  - The backend uses PostgreSQL (Supabase). Ensure these env vars are set for Django:
    - `DATABASE_HOST` (e.g., your Supabase pooler host)
    - `DATABASE_USER` (Supabase user)
    - `DATABASE_PASSWORD` (Supabase password)
    - SSL is required; the app sets `sslmode=require` automatically.
3. While the Docker app is running, run:
```
docker compose up --build
```
  - If this fails the first time, just hit <kbd>Ctrl</kbd>+<kbd>C</kbd> and build again.
4. Migrate
5. While in the same directory as `manage.py`, run:
```
docker compose run web python3 /songdecks/manage.py createsuperuser
```

## Updating Frontend in Production

Run the following command locally to upload the build to Docker Hub:
```
docker build --platform=linux/amd64 -t nhart4141/asoiaf-decks:latest-amd64 .
```
```
docker images
```
(Use this to get the id for the next step)
```
docker tag <ID> nhart4141/asoiaf-decks:latest-amd64
docker push nhart4141/asoiaf-decks:latest-amd64
```
(replace the `<ID>` with your own image id)

After logging into the server, run the following commands:
```
docker pull nhart4141/asoiaf-decks:latest-amd64
```
```
docker compose up -d
```
## Updating Backend in Production

Run the following commands:

```
git pull
docker compose up --build -d
```

To migrate, navigate inside of the main directory (song-decks) and run the following command:
```
docker compose run web python3 /songdecks/manage.py migrate
```

Notes:
- The compose file no longer runs a local MySQL/MariaDB container. The Django app connects directly to Supabase Postgres using the `.env` values under `django/songdecks/songdecks/.env` (or your own overrides).
- If you prefer local Postgres instead of Supabase, run a `postgres` container separately and set `DATABASE_HOST`, `DATABASE_USER`, and `DATABASE_PASSWORD` accordingly.

## Updating .env files in Production

Navigate to the correct directory and run the following command, which will show the hidden files:

```
ls -la
```
  
Then, run the following command to edit the .env file:
  
```
nano .env
```

## Sharing Model Data Locally

When setting up the project locally, you will need to load the following model data into the database:
- Faction
- Commander
- CardTemplate

Run the following command to dump the model data from the database into a json file:

```
docker compose run web python3 songdecks/manage.py dumpdata songdecks.<Model> > songdecks/data/<model_name>.json
```
(replace `<Model>` with the model name and `<model_name>` with the name of the json file)

Then, run the following command to load the data into the database:
```
docker compose run web python3 songdecks/manage.py loaddata songdecks/data/<model_name>.json
```
(replace `<model_name>` with the name of the json file)
