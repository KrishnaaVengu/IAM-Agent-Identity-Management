import os
import time
import pytest
import requests

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:4000/api")

@pytest.fixture(scope="session", autouse=True)
def ensure_clean_clock():
    """Reset simulation clock before running test suite."""
    try:
        requests.post(f"{BASE_URL}/dev-clock/reset")
    except Exception as e:
        pytest.fail(f"Could not connect to backend server at {BASE_URL}: {e}")
    yield
    # Reset clock after tests completed
    requests.post(f"{BASE_URL}/dev-clock/reset")

# ============================================================================
# 1. HEALTH & SYSTEM CHECK
# ============================================================================
def test_health_check():
    """Verify backend health endpoint responds with 200 OK and valid status."""
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["data"]["status"] == "ok"
    assert "time" in data["data"]


# ============================================================================
# 2. ROLE-BASED ACCESS CONTROL & AGENT REGISTRATION
# ============================================================================
def test_agent_registration_rbac_denied():
    """Viewer/Unauthenticated roles must be rejected when registering an agent."""
    payload = {
        "name": f"unauthorized-agent-{time.time()}",
        "purpose": "Testing RBAC protection",
        "owning_team": "Security",
        "requested_scopes": ["read:tickets"],
        "requested_lifetime_days": 30
    }

    # Request without X-Role defaults to Viewer -> 403 Forbidden
    res_no_role = requests.post(f"{BASE_URL}/agents/register", json=payload)
    assert res_no_role.status_code == 403
    assert res_no_role.json()["ok"] is False

    # Explicit Viewer role -> 403 Forbidden
    res_viewer = requests.post(
        f"{BASE_URL}/agents/register",
        json=payload,
        headers={"X-Role": "Viewer"}
    )
    assert res_viewer.status_code == 403


def test_agent_registration_success():
    """Admin role must successfully register a new agent and issue a cleartext token."""
    agent_name = f"pytest-agent-{int(time.time())}"
    payload = {
        "name": agent_name,
        "purpose": "Automated pytest validation agent",
        "owning_team": "QA & Automation",
        "requested_scopes": ["read:tickets", "read:orders", "write:tickets"],
        "requested_lifetime_days": 14
    }

    res = requests.post(
        f"{BASE_URL}/agents/register",
        json=payload,
        headers={"X-Role": "Admin"}
    )
    assert res.status_code == 201
    res_data = res.json()
    assert res_data["ok"] is True

    # Validate agent structure
    agent = res_data["data"]["agent"]
    assert agent["name"] == agent_name
    assert agent["owningTeam"] == "QA & Automation"
    assert agent["status"] == "active"
    assert agent["approvedScopes"] == ["read:tickets", "read:orders", "write:tickets"]

    # Validate credential structure & cleartext token return
    credential = res_data["data"]["credential"]
    assert "credentialId" in credential
    assert "token" in res_data or "cleartextToken" in res_data or "fullToken" in credential
    token = res_data.get("token") or res_data.get("cleartextToken") or credential.get("fullToken")
    assert token.startswith("sk_agt_") or token.startswith("aim_tok_")


def test_agent_registration_duplicate_name_conflict():
    """Registering an agent with an existing name must return 409 Conflict."""
    dup_name = f"dup-agent-{int(time.time())}"
    payload = {
        "name": dup_name,
        "purpose": "Duplicate testing",
        "owning_team": "QA",
        "requested_scopes": ["read:tickets"],
        "requested_lifetime_days": 7
    }

    # First registration -> 201
    res1 = requests.post(f"{BASE_URL}/agents/register", json=payload, headers={"X-Role": "Admin"})
    assert res1.status_code == 201

    # Second registration with same name -> 409
    res2 = requests.post(f"{BASE_URL}/agents/register", json=payload, headers={"X-Role": "Admin"})
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "NAME_CONFLICT"


# ============================================================================
# 3. AGENT REGISTRY & SEARCH/FILTERING (SQL INJECTION RESILIENCE)
# ============================================================================
def test_list_agents_and_filtering():
    """Verify agent list query parameters work correctly."""
    res = requests.get(f"{BASE_URL}/agents")
    assert res.status_code == 200
    agents = res.json()["data"]["agents"]
    assert isinstance(agents, list)
    assert len(agents) > 0

    # Filter by scope
    res_scope = requests.get(f"{BASE_URL}/agents?scope=read:tickets")
    assert res_scope.status_code == 200

    # Filter by team
    res_team = requests.get(f"{BASE_URL}/agents?team=QA%20%26%20Automation")
    assert res_team.status_code == 200


def test_sql_injection_resilience():
    """Verify backend handles SQL injection attack vectors safely via prepared statements."""
    sqli_payloads = [
        "' OR '1'='1",
        "'; DROP TABLE agents; --",
        "\" UNION SELECT * FROM credentials --",
        "1' OR status = 'suspended' --"
    ]

    for sqli in sqli_payloads:
        res = requests.get(f"{BASE_URL}/agents", params={"q": sqli, "team": sqli, "scope": sqli})
        assert res.status_code == 200
        assert res.json()["ok"] is True
        assert isinstance(res.json()["data"]["agents"], list)


# ============================================================================
# 4. AGENT LIFECYCLE & STATE TRANSITIONS
# ============================================================================
def test_agent_lifecycle_transitions():
    """Test full status transition pipeline: active -> suspended -> reactivated -> decommissioned."""
    # 1. Register agent
    agent_name = f"lifecycle-bot-{int(time.time())}"
    reg_res = requests.post(
        f"{BASE_URL}/agents/register",
        json={
            "name": agent_name,
            "purpose": "Lifecycle test bot",
            "owning_team": "Ops",
            "requested_scopes": ["read:tickets"],
            "requested_lifetime_days": 30
        },
        headers={"X-Role": "Admin"}
    )
    assert reg_res.status_code == 201
    agent_id = reg_res.json()["data"]["agent"]["agentId"]
    token = reg_res.json()["token"]

    # 2. Verify simulator call works while active
    sim_active = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {token}"},
        json={"scope_required": "read:tickets"}
    )
    assert sim_active.status_code == 200
    assert sim_active.json()["result"] == "ALLOWED"

    # 3. Suspend Agent -> 200 OK
    sus_res = requests.post(f"{BASE_URL}/agents/{agent_id}/suspend", headers={"X-Role": "Admin"})
    assert sus_res.status_code == 200
    assert sus_res.json()["data"]["agent"]["status"] == "suspended"

    # 4. Verify simulator call is rejected while suspended -> 403 Forbidden
    sim_suspended = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {token}"},
        json={"scope_required": "read:tickets"}
    )
    assert sim_suspended.status_code == 403
    assert sim_suspended.json()["result"] == "DENIED"

    # 5. Reactivate Agent -> 200 OK
    react_res = requests.post(f"{BASE_URL}/agents/{agent_id}/reactivate", headers={"X-Role": "Admin"})
    assert react_res.status_code == 200
    assert react_res.json()["data"]["agent"]["status"] == "active"

    # 6. Verify simulator call succeeds after reactivation -> 200 OK
    sim_reactivated = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {token}"},
        json={"scope_required": "read:tickets"}
    )
    assert sim_reactivated.status_code == 200

    # 7. Attempt Decommission with wrong confirmed name -> 400 Bad Request
    dec_invalid = requests.post(
        f"{BASE_URL}/agents/{agent_id}/decommission",
        json={"confirmedName": "wrong-name"},
        headers={"X-Role": "Admin"}
    )
    assert dec_invalid.status_code == 400
    assert dec_invalid.json()["error"]["code"] == "NAME_MISMATCH"

    # 8. Decommission with correct confirmed name -> 200 OK
    dec_valid = requests.post(
        f"{BASE_URL}/agents/{agent_id}/decommission",
        json={"confirmedName": agent_name},
        headers={"X-Role": "Admin"}
    )
    assert dec_valid.status_code == 200
    assert dec_valid.json()["data"]["agent"]["status"] == "decommissioned"

    # 9. Verify simulator call fails on decommissioned agent -> 401 (Credential Revoked) or 403 (Decommissioned)
    sim_decom = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {token}"},
        json={"scope_required": "read:tickets"}
    )
    assert sim_decom.status_code in [401, 403]


# ============================================================================
# 5. CREDENTIAL ROTATION & HISTORY
# ============================================================================
def test_credential_rotation():
    """Verify rotating a credential revokes old token and issues a new working token."""
    agent_name = f"rotation-bot-{int(time.time())}"
    reg_res = requests.post(
        f"{BASE_URL}/agents/register",
        json={
            "name": agent_name,
            "purpose": "Credential rotation test",
            "owning_team": "Infra",
            "requested_scopes": ["read:logs"],
            "requested_lifetime_days": 10
        },
        headers={"X-Role": "Admin"}
    )
    assert reg_res.status_code == 201
    agent_id = reg_res.json()["data"]["agent"]["agentId"]
    old_token = reg_res.json()["token"]
    old_cred_id = reg_res.json()["data"]["credential"]["credentialId"]

    # Rotate Credential
    rot_res = requests.post(
        f"{BASE_URL}/credentials/rotate",
        json={"agent_id": agent_id, "lifetimeDays": 15},
        headers={"X-Role": "Admin"}
    )
    assert rot_res.status_code == 200
    rot_data = rot_res.json()
    new_token = rot_data["token"]
    new_cred_id = rot_data["newCredential"]["credentialId"]
    assert new_cred_id != old_cred_id

    # Test old token -> 401 CREDENTIAL_REVOKED
    sim_old = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {old_token}"},
        json={"scope_required": "read:logs"}
    )
    assert sim_old.status_code == 401
    assert sim_old.json()["reasonCode"] == "CREDENTIAL_REVOKED"

    # Test new token -> 200 OK ALLOWED
    sim_new = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {new_token}"},
        json={"scope_required": "read:logs"}
    )
    assert sim_new.status_code == 200
    assert sim_new.json()["result"] == "ALLOWED"

    # GET credentials history
    history_res = requests.get(f"{BASE_URL}/agents/{agent_id}/credentials")
    assert history_res.status_code == 200
    creds = history_res.json()["data"]["credentials"]
    assert len(creds) >= 2


# ============================================================================
# 6. API SIMULATOR POLICY ENFORCEMENT
# ============================================================================
def test_simulator_policy_enforcement():
    """Verify scope checks, invalid tokens, and auto-revokes on token expiry."""
    agent_name = f"scope-test-bot-{int(time.time())}"
    reg_res = requests.post(
        f"{BASE_URL}/agents/register",
        json={
            "name": agent_name,
            "purpose": "Scope policy check bot",
            "owning_team": "SecOps",
            "requested_scopes": ["read:documents"],
            "requested_lifetime_days": 2
        },
        headers={"X-Role": "Admin"}
    )
    agent_id = reg_res.json()["data"]["agent"]["agentId"]
    token = reg_res.json()["token"]

    # 1. Granted scope -> 200 ALLOWED
    res_allow = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {token}"},
        json={"scope_required": "read:documents"}
    )
    assert res_allow.status_code == 200
    assert res_allow.json()["result"] == "ALLOWED"

    # 2. Scope Violation -> 403 INSUFFICIENT_SCOPE
    res_deny = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {token}"},
        json={"scope_required": "write:financial_records"}
    )
    assert res_deny.status_code == 403
    assert res_deny.json()["reasonCode"] == "INSUFFICIENT_SCOPE"

    # 3. Invalid Token -> 401 INVALID_CREDENTIAL
    res_invalid = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": "Bearer sk_agt_invalid_token_999"},
        json={"scope_required": "read:documents"}
    )
    assert res_invalid.status_code == 401
    assert res_invalid.json()["reasonCode"] == "INVALID_CREDENTIAL"

    # 4. Advance time by 3 days (past 2-day TTL) -> Token Expiry & Auto-Revoke
    requests.post(f"{BASE_URL}/dev-clock/advance", json={"days_to_advance": 3})

    res_expired = requests.post(
        f"{BASE_URL}/simulator/execute",
        headers={"Authorization": f"Bearer {token}"},
        json={"scope_required": "read:documents"}
    )
    assert res_expired.status_code == 401
    assert res_expired.json()["reasonCode"] in ["CREDENTIAL_EXPIRED", "CREDENTIAL_REVOKED"]


# ============================================================================
# 7. QUARTERLY ACCESS REVIEW & STALE REPORTING
# ============================================================================
def test_access_reviews_stale_report():
    """Verify access review generator identifies stale agents and groups by team."""
    # Reset clock and advance 35 days to ensure stale agents exist
    requests.post(f"{BASE_URL}/dev-clock/reset")
    requests.post(f"{BASE_URL}/dev-clock/advance", json={"days_to_advance": 35})

    # GET stale report
    res = requests.get(f"{BASE_URL}/reviews/stale-report")
    assert res.status_code == 200
    data = res.json()
    report = data.get("report") or data.get("data", {}).get("report")
    assert report is not None
    assert "totalActiveAgents" in report or "total_active_agents" in report
    assert "staleAgentIds" in report or "stale_agent_ids" in report
    assert "teamBreakdown" in report or "team_breakdown" in report

    # Trigger fresh review run
    run_res = requests.post(f"{BASE_URL}/reviews/run", json={"runBy": "Auditor"}, headers={"X-Role": "Auditor"})
    assert run_res.status_code == 201


# ============================================================================
# 8. AUDIT LOGGING & SECURITY VULNERABILITY CHECKS
# ============================================================================
def test_audit_logs():
    """Verify audit log captures lifecycle and simulation events."""
    res = requests.get(f"{BASE_URL}/audit-log")
    assert res.status_code == 200
    entries = res.json()["data"]["entries"]
    assert isinstance(entries, list)
    assert len(entries) > 0


def test_cors_headers():
    """Verify backend includes CORS headers to prevent browser cross-origin policy issues."""
    res = requests.options(f"{BASE_URL}/agents")
    assert res.status_code in [200, 204]
    assert res.headers.get("Access-Control-Allow-Origin") == "*"
    assert "X-Role" in res.headers.get("Access-Control-Allow-Headers", "")


def test_malformed_json_handling():
    """Verify server gracefully rejects malformed JSON without crashing."""
    res = requests.post(
        f"{BASE_URL}/agents/register",
        data="INVALID_JSON_BODY",
        headers={"Content-Type": "application/json", "X-Role": "Admin"}
    )
    assert res.status_code == 400


def test_nonexistent_endpoint():
    """Verify 404 response for undefined API endpoints."""
    res = requests.get(f"{BASE_URL}/nonexistent-route-12345")
    assert res.status_code == 404
