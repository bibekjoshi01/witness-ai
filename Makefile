.PHONY: dev lint test migrate

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

lint:
	python -m compileall app

test:
	pytest -q --disable-warnings --maxfail=1

migrate:
	alembic upgrade head
