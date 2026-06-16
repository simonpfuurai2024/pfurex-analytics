import os
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM_EMAIL", "noreply@pfurex.co.zw")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

async def send_email(to_addresses: List[str], subject: str, body: str):
    """Send an email via SMTP, or log to console if SMTP is not configured."""
    if not SMTP_HOST or not SMTP_USERNAME:
        # Log to console for development
        print(f"\n📧 EMAIL NOTIFICATION")
        print(f"   To: {', '.join(to_addresses)}")
        print(f"   Subject: {subject}")
        print(f"   Body: {body}\n")
        return

    # Real SMTP sending
    msg = MIMEMultipart()
    msg["From"] = SMTP_FROM
    msg["To"] = ", ".join(to_addresses)
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    def _send():
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            if SMTP_USE_TLS:
                server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to_addresses, msg.as_string())

    await asyncio.to_thread(_send)
