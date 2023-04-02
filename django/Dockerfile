FROM python:3.10

WORKDIR /
COPY ./requirements.txt /
RUN apt-get update && \
    apt-get install -y default-mysql-client
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r requirements.txt
COPY . /
EXPOSE 80

CMD ["python", "songdecks/manage.py", "runserver", "0.0.0.0:80"]
