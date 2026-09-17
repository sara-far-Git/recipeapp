"""What an account's plan lets it do.

`plan` is a single column on the user, and the tiers stack: pro_plus can do
everything pro can. Comparing against "pro" with `==` misses that, so the
checks here go through `rank`.
"""
PLANS = ("free", "pro", "pro_plus")

_RANK = {name: i for i, name in enumerate(PLANS)}


def rank(user) -> int:
    return _RANK.get((getattr(user, "plan", "") or "free").strip().lower(), 0)


def at_least_pro(user) -> bool:
    """Pro and anything above it — the paid features."""
    return rank(user) >= _RANK["pro"]


def can_publish(user) -> bool:
    """Whether a recipe this account saves goes up for everyone.

    Everyone else's recipes stay theirs until someone decides otherwise; this
    is the tier that publishes straight away.
    """
    return rank(user) >= _RANK["pro_plus"]
