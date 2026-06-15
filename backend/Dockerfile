FROM python:3.11-slim

WORKDIR /backend

ENV POETRY_HTTP_TIMEOUT=600 \
    POETRY_NO_INTERACTION=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=300 \
    PIP_RETRIES=10

RUN pip install --no-cache-dir --default-timeout=300 poetry

COPY pyproject.toml poetry.lock* ./

RUN poetry config keyring.enabled false \
    && poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port \"${PORT:-8000}\""]

