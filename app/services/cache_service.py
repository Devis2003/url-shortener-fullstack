from app.core.logger import api_logger
from app.core.redis import redis_client

CACHE_TTL_SECONDS = 60 * 60


async def get_cached_url(short_code: str) -> str | None:
    cached_url = await redis_client.get(f"short:{short_code}")

    if cached_url:
        api_logger.info(f"Cache hit | short_code={short_code}")
    else:
        api_logger.info(f"Cache miss | short_code={short_code}")

    return cached_url


async def set_cached_url(short_code: str, original_url: str) -> None:
    await redis_client.set(
        f"short:{short_code}",
        original_url,
        ex=CACHE_TTL_SECONDS,
    )

    api_logger.info(
        f"Cache set | short_code={short_code} | ttl_seconds={CACHE_TTL_SECONDS}"
    )


async def delete_cached_url(short_code: str) -> None:
    await redis_client.delete(f"short:{short_code}")

    api_logger.info(f"Cache deleted | short_code={short_code}")
