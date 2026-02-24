import requests

URL = "https://myrtie-recallable-flynn.ngrok-free.dev/api/projects"
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": "Key-9b8c9e5f-1a2b-4c3d-5e6f-7g8h9i0j1k2l"
}

project = {
    "name": "Test Tower",
    "developerName": "Emaar Properties",
    "community": "Dubai Marina",
    "city": "Dubai",
    "propertyType": "Apartment",
    "startingPrice": 1500000,
    "completionDate": "Q4 2026",
    "paymentPlan": "60/40",
    "amenities": ["Gym", "Pool"],
    "fullDescription": "Full description here.",
    "status": "New Launch"
}

r = requests.post(URL, json=project, headers=HEADERS)
print(r.json())