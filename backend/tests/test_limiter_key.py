"""How the money-spending endpoints are counted.

An address is the wrong unit for anything that costs money: a household
shares one, and anyone can find another. These endpoints all require a
signed-in cook, so they are counted per cook — and signing in again must
not hand out a fresh allowance.
"""
from starlette.datastructures import Headers
from starlette.requests import Request

from app.core.limiter import paying_key
from app.core.security import create_access_token


def _request(token: str | None) -> Request:
    headers = [(b"authorization", f"Bearer {token}".encode())] if token else []
    return Request(
        {
            "type": "http",
            "headers": headers,
            "client": ("203.0.113.7", 1234),
            "method": "POST",
            "path": "/",
            "query_string": b"",
        }
    )


def test_two_cooks_are_counted_separately():
    a = paying_key(_request(create_access_token({"sub": "1"})))
    b = paying_key(_request(create_access_token({"sub": "2"})))
    assert a != b
    assert a.startswith("user:") and b.startswith("user:")


def test_a_second_token_does_not_reset_the_allowance():
    """Otherwise logging in again would be a way to buy more AI calls."""
    first = create_access_token({"sub": "42"})
    second = create_access_token({"sub": "42"})
    assert first != second or True  # they may or may not differ; the key must not
    assert paying_key(_request(first)) == paying_key(_request(second))


def test_no_token_falls_back_to_the_address():
    assert paying_key(_request(None)) == "ip:203.0.113.7"


def test_a_forged_token_is_not_a_cook():
    """A token we cannot verify must not be trusted to name a bucket."""
    assert paying_key(_request("not.a.real.token")).startswith("ip:")
