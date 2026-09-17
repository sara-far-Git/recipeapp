"""Public recipe credits are separate from the account that owns the recipe."""
# Who may publish a recipe under someone else's name — a guest cook's, say,
# where the recipe is theirs and the account posting it is not.
CHEF_EDITOR_EMAILS = {"s3296900@gmail.com", "8496444@gmail.com"}
HIDDEN_NAMES = {"שרה פרקש", "שרי פרקש", "רבקי פרקש", "sara farkash", "sarah farkash", "rivky farkash", "rivki farkash", "רבקה פרקש"}


def hidden_credit(name):
    return " ".join((name or "").strip().casefold().split()) in HIDDEN_NAMES


def can_set_chef_name(user):
    return (getattr(user, "email", "") or "").strip().casefold() in CHEF_EDITOR_EMAILS


def hidden_account(user):
    return can_set_chef_name(user) or hidden_credit(getattr(user, "full_name", None)) or hidden_credit(getattr(user, "username", None))
