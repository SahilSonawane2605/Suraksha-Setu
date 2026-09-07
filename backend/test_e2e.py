import urllib.request
import json

def main():
    # 1. Test List Villages
    res = urllib.request.urlopen("http://localhost:8000/api/v1/villages")
    villages = json.loads(res.read().decode("utf-8"))
    print(f"[OK] Loaded {len(villages)} Maharashtra villages from backend.")
    print(f"     Top Habitation: {villages[0]['name']} ({villages[0]['district']} District)")
    print(f"     Top Risk Score: {villages[0]['risk_score']} | Level: {villages[0]['risk_level']}")

    # 2. Test Post New Maharashtra Village
    payload = {
        "id": "VLG-MAHA-01",
        "name": "Khed Shivapur Settlement",
        "district": "Pune",
        "latitude": 18.35,
        "longitude": 73.85,
        "population": 1400,
        "elevation_meters": 1150,
        "slope_degrees": 28,
        "rainfall_mm": 115,
        "soil_saturation_pct": 80,
        "historical_hazards_count": 3,
    }
    req_data = json.dumps(payload).encode("utf-8")
    post_req = urllib.request.Request(
        "http://localhost:8000/api/v1/villages",
        data=req_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    post_res = urllib.request.urlopen(post_req)
    created = json.loads(post_res.read().decode("utf-8"))
    print(f"[OK] Created Maharashtra Habitation '{created['name']}' (ID: {created['id']})")
    print(f"     Score: {created['risk_score']} | Level: {created['risk_level']} | Priority: {created['priority']}")

    # 3. Test Village Assessment Endpoint
    ass_res = urllib.request.urlopen(f"http://localhost:8000/api/v1/villages/{created['id']}/assessment")
    ass = json.loads(ass_res.read().decode("utf-8"))
    rec = ass["final_recommendation"]
    print(f"[OK] Assessment Pipeline Success for {created['name']}:")
    print(f"     Recommended Shelter: {rec['target_shelter_name']}")
    print(f"     Headroom: {rec['remaining_headroom']} slots ({ass['status']})")
    print(f"     Urgency: {rec['evacuation_urgency']}")
    print(f"     Summary: {rec['summary']}")

if __name__ == "__main__":
    main()
