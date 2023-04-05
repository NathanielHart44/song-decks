ASOIAF Decks is the unofficial website for the A Song of Ice and Fire LCG. It is a fan-made website and is not affiliated with CMON or any other for-profit entity.

## Django and Docker

In order to migrate, use the following command:
```
docker compose run web python3 /songdecks/manage.py migrate
```

To make migrations, use the following command while inside the `songdecks` directory that includes the `manage.py` file, and while inside the virtual environment:
```
python3 manage.py makemigrations
```