"""Public recipe credits are separate from the account that owns the recipe."""
CHEF_EDITOR_EMAIL = "s3296900@gmail.com"
HIDDEN_NAMES = {"שרה פרקש", "שרי פרקש", "רבקי פרקש", "sara farkash", "sarah farkash", "rivky farkash", "rivki farkash", "רבקה פרקש"}


def hidden_credit(name):
    return " ".join((name or "").strip().casefold().split()) in HIDDEN_NAMES


def can_set_chef_name(user):
    return (getattr(user, "email", "") or "").strip().casefold() == CHEF_EDITOR_EMAIL


def hidden_account(user):
    return can_set_chef_name(user) or hidden_credit(getattr(user, "full_name", None)) or hidden_credit(getattr(user, "username", None))
