import requests

res = requests.post(
    "http://127.0.0.1:8000/agent/message", 
    json={"text": "Hi, who are you? And which doctors are available?", "language_code": "en-IN"}
)

print(res.status_code)
print(res.json().get('text'))
