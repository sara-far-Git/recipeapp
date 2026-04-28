"""Sentry initialization. No-op when SENTRY_DSN is not configured."""
from app.core.config import settings


def init_sentry() -> None:
    """Initialize Sentry if a DSN is configured. Safe to call multiple times."""
    if not settings.SENTRY_DSN:
        return
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration
    except ImportError:  # sentry-sdk not installed yet
        return

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.SENTRY_ENVIRONMENT,
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        send_default_pii=False,
        integrations=[
            StarletteIntegration(),
            FastApiIntegration(),
        ],
    )
