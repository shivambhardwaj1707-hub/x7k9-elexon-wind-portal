from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from elexon_service import ElexonDataService

app = FastAPI(
    title="UK Day-Ahead Wind Generation Analytics API",
    description="Backend API for REint / Gridbricks Full Stack SWE Challenge",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "system": "UK Wind Energy Analytics Platform"}

@app.get("/api/wind/analytics")
def get_analytics():
    return ElexonDataService.get_january_2026_wind_data()