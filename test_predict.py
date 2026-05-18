import urllib.request
import json
import urllib.error

url = "http://localhost:8000/api/predict"
data = {
    "patient_id": "test",
    "clinical_flags": ["GDM"],
    "mode_of_delivery": "NSVD",
    "chief_complaint": ["pain"]
}
req = urllib.request.Request(url, json.dumps(data).encode('utf-8'), {'Content-Type': 'application/json'})

try:
    response = urllib.request.urlopen(req, timeout=5)
    print("SUCCESS:")
    print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"ERROR: {e}")
