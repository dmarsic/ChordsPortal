FROM python:3

WORKDIR /app

RUN pip install pdm

COPY chords_portal .
COPY LICENSE .

RUN pdm install

CMD ["make"]
