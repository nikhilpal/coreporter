from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg

from .routers import data_sources, templates, reports, questions

app = FastAPI(
    title="Coreporter API",
    description="API for generating reports using templates and LLM",
    version="0.1.0",
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(data_sources.router)
app.include_router(templates.router)
app.include_router(reports.router)
app.include_router(questions.router)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "message": "Welcome to Coreporter API",
        "docs": "/docs",
        "version": "0.1.0"
    }
