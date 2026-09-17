"""Public recipe credits are separate from the account that owns the recipe."""
# Who may publish a recipe under someone else's name — a guest cook's, say,
# where the recipe is theirs and the account posting it is not.
CHEF_EDITOR_EMAILS = {"s3296900@gmail.com", "8496444@gmail.com"}
HIDDEN_NAMES = {"שרה פרקש", "שרי פרקש", "רבקי פרקש", "sara farkash", "sarah farkash", "rivky farkash", "rivki farkash", "רבקה פרקש"}


# Cooks whose recipes go up for everyone the moment they save one, named
# rather than by plan — they were publishing here before plans existed.
# A plan grants this too; see plans.can_publish.
PUBLISHER_NAMES = {"שרי פרקש", "רבקי פרקש", "הני בקר"}


def publisher_by_name(user) -> bool:
    name = " ".join((getattr(user, "full_name", None) or "").strip().split())
    return name in PUBLISHER_NAMES


def hidden_credit(name):
    return " ".join((name or "").strip().casefold().split()) in HIDDEN_NAMES


def can_set_chef_name(user):
    return (getattr(user, "email", "") or "").strip().casefold() in CHEF_EDITOR_EMAILS


def hidden_account(user):
    return can_set_chef_name(user) or hidden_credit(getattr(user, "full_name", None)) or hidden_credit(getattr(user, "username", None))
