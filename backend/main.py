from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import email
from email import policy
import joblib
import re
import requests
import ipaddress

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("phishing_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

IP_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def is_public_ip(ip):
    try:
        addr = ipaddress.ip_address(ip)
        return not (addr.is_private or addr.is_loopback or addr.is_reserved or addr.is_link_local)
    except ValueError:
        return False


def find_origin_ip(received_headers):
    for header in reversed(received_headers):
        ips = IP_PATTERN.findall(header)
        for ip in ips:
            if is_public_ip(ip):
                return ip
    return None


def geolocate(ip):
    try:
        fields = "status,country,regionName,city,isp,lat,lon,proxy,hosting"
        response = requests.get(f"http://ip-api.com/json/{ip}?fields={fields}", timeout=5)
        data = response.json()
        if data.get("status") == "success":
            return {
                "ip": ip,
                "country": data.get("country"),
                "region": data.get("regionName"),
                "city": data.get("city"),
                "isp": data.get("isp"),
                "lat": data.get("lat"),
                "lon": data.get("lon"),
                "is_hosting_or_vpn": data.get("hosting", False) or data.get("proxy", False),
            }
        else:
            print("GeoIP failed:", data)
    except Exception as e:
        print("GeoIP error:", e)
    return None


def auth_status(text, key):
    if not text:
        return "unknown"
    match = re.search(rf"{key}=(pass|fail|none|neutral|softfail)", text, re.IGNORECASE)
    return match.group(1).lower() if match else "unknown"


@app.get("/")
def read_root():
    return {"message": "Email Threat Detection Platform backend is running"}


@app.post("/parse-email")
async def parse_email(file: UploadFile = File(...)):
    content = await file.read()
    msg = email.message_from_bytes(content, policy=policy.default)

    headers = {
        "From": msg.get("From"),
        "To": msg.get("To"),
        "Subject": msg.get("Subject"),
        "Return-Path": msg.get("Return-Path"),
        "Message-ID": msg.get("Message-ID"),
        "Reply-To": msg.get("Reply-To"),
        "SPF": msg.get("Received-SPF"),
        "DKIM-Signature": msg.get("DKIM-Signature"),
        "Authentication-Results": msg.get("Authentication-Results"),
    }

    received_headers = msg.get_all("Received", [])

    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                body = part.get_content()
                break
    else:
        body = msg.get_content()

    # ML prediction
    text_to_analyze = (msg.get("Subject") or "") + " " + (body or "")
    text_vec = vectorizer.transform([text_to_analyze])
    prediction = model.predict(text_vec)[0]
    probabilities = model.predict_proba(text_vec)[0]
    confidence = max(probabilities)

    # Origin IP + geolocation
    origin_ip = find_origin_ip(received_headers)
    geo = geolocate(origin_ip) if origin_ip else None

    # Auth statuses
    spf_status = "pass" if headers["SPF"] and "pass" in headers["SPF"].lower() else "fail" if headers["SPF"] else "unknown"
    dkim_status = auth_status(headers["Authentication-Results"], "dkim")
    dmarc_status = auth_status(headers["Authentication-Results"], "dmarc")

    # Fraud score
    fraud_score = 0
    if prediction == "Phishing Email":
        fraud_score += 60
    if spf_status == "fail":
        fraud_score += 15
    if dkim_status == "fail":
        fraud_score += 15
    if dmarc_status == "fail":
        fraud_score += 15
    if geo and geo.get("is_hosting_or_vpn"):
        fraud_score += 10
    fraud_score = min(fraud_score, 100)

    if fraud_score >= 60:
        risk_level = "High"
    elif fraud_score >= 25:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "headers": headers,
        "received_path": received_headers,
        "body_preview": body[:500] if body else None,
        "ml_prediction": {
            "classification": prediction,
            "confidence": round(float(confidence) * 100, 2)
        },
        "geolocation": geo,
        "fraud_score": {
            "score": fraud_score,
            "risk_level": risk_level
        }
    }