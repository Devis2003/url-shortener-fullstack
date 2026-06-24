from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, HttpUrl


class LinkCreate(BaseModel):
    original_url: HttpUrl


class LinkResponse(BaseModel):
    id: UUID
    original_url: str
    short_code: str
    click_count: int
    owner_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
