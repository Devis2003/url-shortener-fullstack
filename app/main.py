from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.links import router as link_router
from app.api.redirect import router as redirect_router
from app.api.admin import router as admin_router

from app.core.logger import app_logger, api_logger

app = FastAPI()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    api_logger.info(
        f"Request started | method={request.method} | path={request.url.path}"
    )

    response = await call_next(request)

    api_logger.info(
        f"Request completed | method={request.method} | path={request.url.path} | status_code={response.status_code}"
    )

    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(link_router)
app.include_router(admin_router)


@app.get("/health")
def health_check():
    app_logger.info("Health endpoint hit")
    return {"status": "ok"}


# Redirect router should be last
app.include_router(redirect_router)
