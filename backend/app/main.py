from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.api import auth, me, elders, locations, assessments, matching, interviews, payments, sla
from app.models.caregiver import CaregiverProfile, CaregiverExperience, CaregiverAvailability

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on startup
    await init_db()
    
    # Seed initial Chennai caregivers if table is empty
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(CaregiverProfile))
        caregivers = result.scalars().all()
        if not caregivers:
            cg1 = CaregiverProfile(
                fullName="Lakshmi Sundaram",
                phone="+919876543210",
                email="lakshmi.s@careconnect.in",
                profilePhoto="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
                gender="FEMALE",
                age=38,
                languages=["Tamil", "English"],
                primaryLanguage="Tamil",
                skills=["Vitals Monitoring", "Dementia Care", "Medication Management", "Bathing & Hygiene"],
                mobilityExperience=["WHEELCHAIR", "BEDRIDDEN", "CANE_WALKER", "INDEPENDENT"],
                medicalConditions=["Dementia", "Alzheimer's", "Diabetes", "Hypertension", "Post-Stroke"],
                shiftPreferences=["EIGHT_HOUR_DAY", "TWELVE_HOUR_DAY_NIGHT", "TWENTY_FOUR_HOUR_LIVE_IN"],
                serviceLocalities=["Adyar", "Mylapore", "Velachery", "Besant Nagar", "T. Nagar"],
                hourlyRate=250.0,
                dailyRate=1800.0,
                rating=4.9,
                reviewCount=24,
                verificationStatus="VERIFIED",
                isAvailable=True
            )
            cg1.experiences.append(CaregiverExperience(category="Dementia Care", yearsExperience=6, description="Specialized in memory care and daily routine enforcement for senior citizens."))
            cg1.experiences.append(CaregiverExperience(category="Post-Stroke Rehab", yearsExperience=4, description="Assisting mobility, physio exercises, and vital monitoring."))
            
            cg1.availabilities.append(CaregiverAvailability(slotDate="2026-09-18", startTime="10:00", endTime="10:15", status="AVAILABLE"))
            cg1.availabilities.append(CaregiverAvailability(slotDate="2026-09-18", startTime="11:30", endTime="11:45", status="AVAILABLE"))
            cg1.availabilities.append(CaregiverAvailability(slotDate="2026-09-18", startTime="15:00", endTime="15:15", status="AVAILABLE"))

            cg2 = CaregiverProfile(
                fullName="Anitha Ramanathan",
                phone="+919876543211",
                email="anitha.r@careconnect.in",
                profilePhoto="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80",
                gender="FEMALE",
                age=42,
                languages=["Tamil", "English", "Telugu"],
                primaryLanguage="Tamil",
                skills=["Catheter Care", "Physiotherapy Support", "Dietary Assistance", "Bathing & Hygiene"],
                mobilityExperience=["BEDRIDDEN", "WHEELCHAIR", "CANE_WALKER"],
                medicalConditions=["Post-Stroke", "Parkinson's", "Cardiac Care", "Diabetes"],
                shiftPreferences=["EIGHT_HOUR_DAY", "TWELVE_HOUR_DAY_NIGHT"],
                serviceLocalities=["Anna Nagar", "T. Nagar", "Kilpauk", "Mylapore", "Nungambakkam"],
                hourlyRate=280.0,
                dailyRate=2000.0,
                rating=4.8,
                reviewCount=18,
                verificationStatus="VERIFIED",
                isAvailable=True
            )
            cg2.experiences.append(CaregiverExperience(category="Elderly Palliative Care", yearsExperience=8, description="8 years of dedicated home care nursing for bedridden elderly patients."))
            
            cg2.availabilities.append(CaregiverAvailability(slotDate="2026-09-18", startTime="14:00", endTime="14:15", status="AVAILABLE"))
            cg2.availabilities.append(CaregiverAvailability(slotDate="2026-09-18", startTime="16:30", endTime="16:45", status="AVAILABLE"))

            cg3 = CaregiverProfile(
                fullName="Karthik Venkatesh",
                phone="+919876543212",
                email="karthik.v@careconnect.in",
                profilePhoto="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
                gender="MALE",
                age=34,
                languages=["Tamil", "English", "Hindi"],
                primaryLanguage="Tamil",
                skills=["Physical Mobility", "Wheelchair Transfer", "Medication Management", "Companion Care"],
                mobilityExperience=["WHEELCHAIR", "CANE_WALKER", "INDEPENDENT"],
                medicalConditions=["Parkinson's", "Arthritis", "Diabetes", "Hypertension"],
                shiftPreferences=["EIGHT_HOUR_DAY", "TWENTY_FOUR_HOUR_LIVE_IN"],
                serviceLocalities=["Adyar", "Velachery", "Thiruvanmiyur", "Besant Nagar", "Guindy"],
                hourlyRate=240.0,
                dailyRate=1700.0,
                rating=4.7,
                reviewCount=15,
                verificationStatus="VERIFIED",
                isAvailable=True
            )
            cg3.experiences.append(CaregiverExperience(category="Geriatric Assistance", yearsExperience=5, description="Expertise in male senior mobility support, walking assistance, and companionship."))

            cg3.availabilities.append(CaregiverAvailability(slotDate="2026-09-18", startTime="10:30", endTime="10:45", status="AVAILABLE"))
            cg3.availabilities.append(CaregiverAvailability(slotDate="2026-09-18", startTime="12:00", endTime="12:15", status="AVAILABLE"))

            db.add(cg1)
            db.add(cg2)
            db.add(cg3)
            await db.commit()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CareConnect Elder Care Platform API — Family Sponsor Intake & Phase B Matching, Intro Call, Payment, SLA",
    lifespan=lifespan
)

# CORS configuration for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(me.router, prefix=settings.API_V1_STR)
app.include_router(elders.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(assessments.router, prefix=settings.API_V1_STR)

# Phase B Routers
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(sla.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check probe."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }
