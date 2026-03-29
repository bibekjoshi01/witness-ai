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

## Tests

```bash
pytest -q
```
