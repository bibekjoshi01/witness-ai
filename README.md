# Witness AI

Witness AI is a Nepal-US Hackathon project: an AI-assisted journaling and chat platform for capturing and analyzing first-person accounts. The backend is a FastAPI service exposing REST endpoints and AI integrations; the frontend is a Next.js app in the `client/` folder.

**Highlights**

- Authentication (JWT + Google Sign-In)
- Create/read/update journals and chat sessions
- AI-driven insight generation and question prompts
- PostgreSQL-ready with Alembic migrations

**Tech stack**

- Backend: FastAPI, Uvicorn, SQLAlchemy
- DB: PostgreSQL (recommended) / SQLite (local)
- Frontend: Next.js + Tailwind (in `client/`)
- Packaging: Docker

**Important files**

- [Dockerfile](Dockerfile)
- [.dockerignore](.dockerignore)
- [requirements.txt](requirements.txt)
- [app/main.py](app/main.py)
- [app/config.py](app/config.py)
- [client](client)

## Quickstart — Local development

Prereqs: Python 3.12+, Node 18+, (optional) Docker

1. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install backend deps

```bash
pip install -r requirements.txt
```

3. Create an `.env` file (see **Environment** below)

4. Run migrations (optional — recommended for Postgres)

```bash
alembic upgrade head
```

5. Run backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. Run frontend

```bash
cd client
npm install
npm run dev
```

Open the API docs at http://localhost:8000/docs and the frontend at http://localhost:3000.

## Docker

Build and run a container for demos:

```bash
# Build image
docker build -t witness-ai .

# Run (bind port 8000). Provide an .env file for config
docker run --rm -p 8000:8000 --env-file .env witness-ai
```

If you prefer Docker Compose (example config may exist in the repo):

```bash
docker-compose up --build
```

## Environment (example)

Create `.env` at the project root. Values can be set using either uppercase names or the lowercase names used by pydantic-settings; the app is case-insensitive.

```env
# Database (replace with Postgres URL for production)
DATABASE_URL=sqlite+aiosqlite:///./witness.db

# JWT secret (REPLACE in production)
JWT_SECRET=replace-with-a-secret

# Optional: LLM provider key
LLM_API_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
```

See [app/config.py](app/config.py) for all settings and defaults.

## Migrations

Run Alembic migrations against your database:

```bash
alembic upgrade head
```

## Tests

Run the backend tests with pytest:

```bash
pytest -q
```

## API

The backend routes live in `app/routes/`. With the server running, use the interactive docs:

```
http://localhost:8000/docs
```

## Contributors

- Team Witness AI
