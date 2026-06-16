from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
import os
from app.database import engine
from app.auth.router import router as auth_router
from app.api.companies import router as companies_router
from app.api.documents import router as documents_router
from app.api.valuations import router as valuations_router
from app.api.risk import router as risk_router
from app.api.application import router as application_router
from app.api.dashboard import router as dashboard_router
from app.api.admin import router as admin_router
from app.api.contact import router as contact_router
from app.api.simulation import router as simulation_router
from app.api.scenarios import router as scenarios_router
from app.api.simulation_export import router as sim_export_router
from app.api.simulation_assumptions import router as sim_assumptions_router

app = FastAPI(title="Pfurex Analytics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routers ---
app.include_router(auth_router)
app.include_router(companies_router)
app.include_router(documents_router)
app.include_router(valuations_router)
app.include_router(risk_router)
app.include_router(application_router)
app.include_router(dashboard_router)
app.include_router(admin_router)
app.include_router(contact_router)
app.include_router(simulation_router)
app.include_router(scenarios_router)
app.include_router(sim_export_router)
app.include_router(sim_assumptions_router)

@app.get("/api/health")
async def health():
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    return {"status": "ok", "db": "connected"}

# --- Serve React Frontend (for ngrok single‑port demo) ---
frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
