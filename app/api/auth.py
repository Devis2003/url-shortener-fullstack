from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse, TokenResponse
from app.services.user_service import create_user, get_user_by_email
from app.core.security import get_password_hash, verify_password, create_access_token

from app.core.dependencies import get_current_user
from app.models.user import User

from fastapi.security import OAuth2PasswordRequestForm

from app.core.logger import auth_logger

router = APIRouter(prefix="/auth", tags=["Auth"])


# signup
@router.post(
    "/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    auth_logger.info(f"Signup attempt | email={user_data.email}")

    existing_user = await get_user_by_email(db, user_data.email)

    if existing_user:
        auth_logger.warning(
            f"Signup failed - email already registered | email={user_data.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = get_password_hash(user_data.password)

    user = await create_user(
        db=db,
        email=user_data.email,
        hashed_password=hashed_password,
    )

    auth_logger.info(f"Signup successful | user_id={user.id} | email={user.email}")

    return user


# login
@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    auth_logger.info(f"Login attempt | email={form_data.username}")

    user = await get_user_by_email(db, form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        auth_logger.warning(f"Login failed | email={form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    auth_logger.info(f"Login successful | user_id={user.id} | email={user.email}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
