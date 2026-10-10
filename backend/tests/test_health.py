from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_health():
    """Verify that root GET /health returns 200 and expected schema."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "nebius_configured" in data
    assert isinstance(data["nebius_configured"], bool)
    assert "nebius_base_url" in data
    assert "nebius_model" in data
    assert "timestamp" in data


def test_api_health():
    """Verify that /api/health also responds with 200."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_llm_status():
    """Verify that /api/llm/status responds without exposing secrets."""
    response = client.get("/api/llm/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_configured" in data
    assert "base_url" in data
    assert "model" in data
    assert "message" in data
    # Ensure no secret strings or tokens are exposed
    assert "sk-" not in str(data)
