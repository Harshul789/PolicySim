import requests
import json

url = "http://localhost:8000/analyze_policy"
data = {
    "city": "Hyderabad",
    "policy_text": "Digital Ration Card Policy 2025: All households must perform biometric authentication."
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print(f"Error Detail: {response.text}")
    else:
        print(f"Success: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
