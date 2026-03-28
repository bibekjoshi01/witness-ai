# Witness AI Backend

FastAPI backend for structured mental health reflection, with anonymous device auth, rule-based pattern detection, optional LLM summaries, and APScheduler-driven routines.

## Quick start (local)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # adjust secrets/db
uvicorn app.main:app --reload
```

## Docker
```bash
docker-compose up --build
```

## Core Endpoints
- `POST /auth/device` -> JWT for a `device_id`
- `GET /reflections/questions` -> daily questions
- `POST /reflections` -> submit answers + mood
- `GET /insights/latest` / `GET /insights/history`
- `GET /micro-actions/next`, `POST /micro-actions/complete`
- `POST /ai/ask` -> guided AI/stub reply
- `POST /tasks/run/daily` and `/weekly` -> manual job triggers

Auth: send `Authorization: Bearer <token>` on protected routes.

## Tests
```bash
pytest -q
```

## Notes
- DB: defaults to SQLite; set `DATABASE_URL` for Postgres.
- LLM: set `LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`; falls back to stub if missing.
- Scheduler: enabled by `SCHEDULER_ENABLED`; runs daily/weekly cron inside app process.
