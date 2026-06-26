"""
EventPilot AI — QR Code Service
Generates QR codes for guest tickets and event check-in.
"""

import qrcode
import io
import base64
import json
import logging

logger = logging.getLogger(__name__)


def generate_qr_code(data: dict | str, size: int = 300) -> str:
    """
    Generate a QR code and return as base64-encoded PNG string.
    
    Args:
        data: The data to encode (string or dict that will be JSON-serialized)
        size: The pixel size of the QR code image
    
    Returns:
        Base64-encoded PNG image string (data URI format)
    """
    try:
        # Convert dict to JSON string
        if isinstance(data, dict):
            qr_data = json.dumps(data)
        else:
            qr_data = str(data)

        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)

        # Create image
        img = qr.make_image(fill_color="black", back_color="white")

        # Resize if needed
        img = img.resize((size, size))

        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return f"data:image/png;base64,{b64}"

    except Exception as e:
        logger.error(f"QR code generation error: {e}")
        return ""


def generate_guest_ticket_qr(
    event_id: str,
    guest_id: str,
    guest_name: str,
    event_name: str,
) -> str:
    """Generate a QR code for a guest ticket with event check-in data."""
    ticket_data = {
        "type": "eventpilot_ticket",
        "event_id": event_id,
        "guest_id": guest_id,
        "guest_name": guest_name,
        "event_name": event_name,
    }
    return generate_qr_code(ticket_data)
