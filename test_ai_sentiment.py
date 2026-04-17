"""Test AI analyst with sentiment"""
import httpx

BASE = "https://web-production-4faa7.up.railway.app/api/v1"
c = httpx.Client(timeout=120, verify=False)

print("=== Testing AI Analyst with sentiment context ===")
r = c.post(f"{BASE}/ai-analyst/chat", json={
    "message": "What is the current sentiment outlook for CUE Energy? Should I invest?",
    "context": {"ticker": "CUE", "exchange": "ASX"}
})
print(f"Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    response = data.get("response", data.get("message", data))
    if isinstance(response, dict):
        for key in ["headline", "interpretation", "investment_outlook", "risks"]:
            val = response.get(key)
            if val:
                print(f"\n{key.upper()}:")
                print(f"  {str(val)[:300]}")
    else:
        print(f"\nResponse:\n{str(response)[:800]}")
else:
    print(f"Error: {r.text[:400]}")

c.close()
