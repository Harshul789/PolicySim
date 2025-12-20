import requests

url = "http://localhost:8000/analyze_policy"
data = {
    "city": "Hyderabad",
    "policy_text": "This is a test policy."
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
