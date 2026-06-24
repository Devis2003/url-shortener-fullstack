FROM python:3.12-slim

EXPOSE 8000

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock /app/

RUN uv sync --frozen

COPY . .

CMD ["sh", "-c", "uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]