# Witness AI Backend

FastAPI backend for structured mental health reflection, with Google Sign-In auth, rule-based pattern detection, optional LLM summaries, and APScheduler-driven routines.

## Quick start (local)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # adjust secrets/db
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Frontend (Next.js client)
```bash
cd client
cp .env.example .env   # set NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_GOOGLE_CLIENT_ID
yarn install           # or npm install
yarn dev
```

## Docker
```bash
docker-compose up --build
```

## Core Endpoints
- `POST /auth/google` -> JWT from Google ID token
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
- Auth: set `GOOGLE_CLIENT_ID` for Google ID token verification.
