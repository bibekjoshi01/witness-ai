import os
import datetime as dt
import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
from app.main import app  # noqa: E402

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # trigger startup events
    with TestClient(app) as c:
        c.get("/health")


def auth_token():
    resp = client.post("/auth/device", json={"device_id": "test-device"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_reflection_flow():
    token = auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    qresp = client.get("/reflections/questions", headers=headers)
    assert qresp.status_code == 200
    assert len(qresp.json()) >= 1

    today = str(dt.date.today())
    rresp = client.post(
        "/reflections",
        headers=headers,
        json={
            "date": today,
            "answers": {"avoided_task": True, "thought": "deadline approaching"},
            "mood_score": 3,
        },
    )
    assert rresp.status_code == 200

    iresp = client.get("/insights/latest", headers=headers)
    assert iresp.status_code == 200

    mresp = client.get("/micro-actions/next", headers=headers)
    assert mresp.status_code == 200
    action_id = mresp.json()["id"]

    cresp = client.post("/micro-actions/complete", headers=headers, json={"action_id": action_id})
    assert cresp.status_code == 200


def test_ai_stub():
    token = auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/ai/ask", headers=headers, json={"question": "What pattern do you see?"})
    assert resp.status_code == 200
    body = resp.json()
    assert "answer" in body
