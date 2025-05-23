ARG TARGET_ENV=local

# ---------------------Base Stage------------------------
FROM python:3.10 AS base

WORKDIR /
COPY ./requirements.txt /tmp/requirements.txt

RUN set -ex && \
    echo "Running base stage" && \
    apt-get update && \
    pip install --upgrade pip && \
    pip install --upgrade setuptools && \
    pip install -r /tmp/requirements.txt && \
    rm -rf /root/.cache/

COPY . /

# -----------------Local Testing Stage-------------------
FROM base AS local

RUN echo "Running local testing stage"

EXPOSE 80

CMD ["python", "songdecks/manage.py", "runserver", "0.0.0.0:80"]

# --------------------Fly.io Stage-----------------------
FROM base AS flyio

RUN echo "Running Fly.io stage" && \
    pip install gunicorn

EXPOSE 8000

WORKDIR /songdecks

CMD ["sh", "-c", "python manage.py collectstatic --noinput && gunicorn --bind :8000 --workers 2 songdecks.wsgi"]

# ----------------Final Stage Selection-------------------
FROM ${TARGET_ENV} AS final

RUN echo "Running final stage"