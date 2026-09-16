import re
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings

# Curated reference localities in Chennai with representative coordinates and hubs
CHENNAI_LOCALITY_HUB_MAP: Dict[str, Dict[str, Any]] = {
    "adyar": {"lat": 13.0012, "lng": 80.2565, "pincode": "600020", "hub": "South Chennai Hub"},
    "besant nagar": {"lat": 13.0003, "lng": 80.2667, "pincode": "600090", "hub": "South Chennai Hub"},
    "thiruvanmiyur": {"lat": 12.9830, "lng": 80.2594, "pincode": "600041", "hub": "South Chennai Hub"},
    "velachery": {"lat": 12.9759, "lng": 80.2212, "pincode": "600042", "hub": "South Chennai Hub"},
    "mylapore": {"lat": 13.0368, "lng": 80.2676, "pincode": "600004", "hub": "Central Chennai Hub"},
    "t. nagar": {"lat": 13.0418, "lng": 80.2341, "pincode": "600017", "hub": "Central Chennai Hub"},
    "t nagar": {"lat": 13.0418, "lng": 80.2341, "pincode": "600017", "hub": "Central Chennai Hub"},
    "alwarpet": {"lat": 13.0336, "lng": 80.2505, "pincode": "600018", "hub": "Central Chennai Hub"},
    "nungambakkam": {"lat": 13.0569, "lng": 80.2425, "pincode": "600034", "hub": "Central Chennai Hub"},
    "anna nagar": {"lat": 13.0850, "lng": 80.2101, "pincode": "600040", "hub": "North-West Chennai Hub"},
    "kilpauk": {"lat": 13.0784, "lng": 80.2412, "pincode": "600010", "hub": "Central Chennai Hub"},
    "royapettah": {"lat": 13.0538, "lng": 80.2608, "pincode": "600014", "hub": "Central Chennai Hub"},
    "perungudi": {"lat": 12.9654, "lng": 80.2461, "pincode": "600096", "hub": "OMR South Hub"},
    "sholinganallur": {"lat": 12.9010, "lng": 80.2279, "pincode": "600119", "hub": "OMR South Hub"},
    "guindy": {"lat": 13.0067, "lng": 80.2025, "pincode": "600025", "hub": "South Chennai Hub"},
    "ashok nagar": {"lat": 13.0354, "lng": 80.2117, "pincode": "600083", "hub": "Central Chennai Hub"},
    "kodambakkam": {"lat": 13.0520, "lng": 80.2230, "pincode": "600024", "hub": "Central Chennai Hub"},
    "k.k. nagar": {"lat": 13.0382, "lng": 80.1973, "pincode": "600078", "hub": "Central Chennai Hub"},
    "kk nagar": {"lat": 13.0382, "lng": 80.1973, "pincode": "600078", "hub": "Central Chennai Hub"},
    "r.a. puram": {"lat": 13.0270, "lng": 80.2580, "pincode": "600028", "hub": "Central Chennai Hub"},
    "ra puram": {"lat": 13.0270, "lng": 80.2580, "pincode": "600028", "hub": "Central Chennai Hub"},
    "kotturpuram": {"lat": 13.0160, "lng": 80.2410, "pincode": "600085", "hub": "South Chennai Hub"},
}

class GeoService:
    @staticmethod
    def verify_address(
        address_line_1: str,
        locality: str,
        postal_code: str,
        city: str = "Chennai",
        state: str = "Tamil Nadu",
        simulate_state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate geographic address and return canonical serviceability status.
        Backend acts as the sole source of truth; never trusts client-supplied serviceable boolean.
        """
        # Handle QA simulation states
        if simulate_state == "PERMISSION_DENIED":
            return {
                "serviceable": False,
                "verificationStatus": "PERMISSION_DENIED",
                "message": "Location permission was denied or restricted. Please allow location access to continue.",
                "latitude": 0.0,
                "longitude": 0.0,
                "locality": locality,
                "city": city,
                "postalCode": postal_code,
                "assignedHub": None
            }

        if simulate_state == "UNABLE_TO_VERIFY":
            return {
                "serviceable": False,
                "verificationStatus": "UNABLE_TO_VERIFY",
                "message": "Unable to verify address coordinates. A Care Manager will contact you for manual confirmation.",
                "latitude": 0.0,
                "longitude": 0.0,
                "locality": locality,
                "city": city,
                "postalCode": postal_code,
                "assignedHub": None
            }

        # Validate input format
        if not address_line_1 or len(address_line_1.strip()) < 4:
            return {
                "serviceable": False,
                "verificationStatus": "INVALID_ADDRESS",
                "message": "Please provide a complete street address.",
                "latitude": 0.0,
                "longitude": 0.0,
                "locality": locality,
                "city": city,
                "postalCode": postal_code,
                "assignedHub": None
            }

        clean_postal = postal_code.strip()
        if not re.match(r"^\d{6}$", clean_postal):
            return {
                "serviceable": False,
                "verificationStatus": "INVALID_ADDRESS",
                "message": "Postal code must be a 6-digit Indian PIN code.",
                "latitude": 0.0,
                "longitude": 0.0,
                "locality": locality,
                "city": city,
                "postalCode": postal_code,
                "assignedHub": None
            }

        # Check Chennai city and Tamil Nadu state
        norm_city = city.strip().lower()
        norm_state = state.strip().lower()
        if "chennai" not in norm_city and "madras" not in norm_city:
            return {
                "serviceable": False,
                "verificationStatus": "NOT_SERVICEABLE",
                "message": f"CareConnect is currently active exclusively in Chennai metropolitan region. '{city}' is currently outside our service area.",
                "latitude": 0.0,
                "longitude": 0.0,
                "locality": locality,
                "city": city,
                "postalCode": postal_code,
                "assignedHub": None
            }

        # Validate pincode prefix: Chennai postal codes begin with 600
        pincode_int = int(clean_postal)
        is_chennai_pincode = (600001 <= pincode_int <= 600135)

        norm_loc = locality.strip().lower()
        matched_loc_data = CHENNAI_LOCALITY_HUB_MAP.get(norm_loc)

        if not is_chennai_pincode and not matched_loc_data:
            return {
                "serviceable": False,
                "verificationStatus": "NOT_SERVICEABLE",
                "message": f"Postal code {clean_postal} in '{locality}' is outside our active Chennai service corridors.",
                "latitude": 0.0,
                "longitude": 0.0,
                "locality": locality,
                "city": city,
                "postalCode": postal_code,
                "assignedHub": None
            }

        # Resolve coordinates and hub
        if matched_loc_data:
            lat = matched_loc_data["lat"]
            lng = matched_loc_data["lng"]
            hub = matched_loc_data["hub"]
        else:
            # Fallback coordinate inside Chennai central corridor
            lat = 13.0400 + ((pincode_int % 100) * 0.001)
            lng = 80.2400 + ((pincode_int % 100) * 0.001)
            hub = "Chennai Metropolitan Care Hub"

        return {
            "serviceable": True,
            "verificationStatus": "VERIFIED",
            "message": "Address verified successfully. CareConnect caregivers and clinical managers are active in this zone.",
            "latitude": round(lat, 6),
            "longitude": round(lng, 6),
            "locality": locality.strip(),
            "city": "Chennai",
            "postalCode": clean_postal,
            "assignedHub": hub
        }

