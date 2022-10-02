# pull official base image
FROM python:3.10.4-alpine3.15
# set work directory
WORKDIR /usr/src/app
# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# install psycopg2 dependencies
RUN apk update \
    && apk add --no-cache g++ postgresql-dev gcc python3-dev musl-dev
RUN apk add libffi-dev

RUN pip install pandas
# install dependencies
RUN pip install --upgrade pip
COPY ../../server/requirements.txt .
RUN pip install -r requirements.txt

# copy entrypoint.sh
COPY ../../server/entrypoint.sh .
RUN sed -i 's/\r$//g' /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# copy project
COPY . .

# run entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]