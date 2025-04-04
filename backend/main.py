import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, admin, documents, clients, analysis
from app.core.config import settings
from app.db.session import create_tables

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Financial Statement Analysis Platform API",
    version="1.0.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

@app.on_event("startup")
async def startup_event():
    # Create database tables if they don't exist
    create_tables()

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)