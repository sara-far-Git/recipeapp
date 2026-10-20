"""The right to see one's data and to have it deleted."""
from app.models.recipe import (
    Recipe, Like, Rating, Comment, Collection, CollectionItem, StoredImage,
)
from app.models.user import User, Follow
from tests.helpers import create_recipe


def _user(db, email):
    return db.query(User).filter(User.email == email).one()


def test_export_returns_my_account_and_recipes(client, registered_user):
    create_recipe(client, registered_user["auth_header"], title="עוגת שמרים")
    r = client.get("/api/v1/users/me/export", headers=registered_user["auth_header"])
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["account"]["email"] == registered_user["email"]
    assert body["account"]["terms_accepted_at"]
    assert [x["title"] for x in body["recipes"]] == ["עוגת שמרים"]
    assert "hashed_password" not in str(body)


def test_export_requires_sign_in(client):
    assert client.get("/api/v1/users/me/export").status_code == 401


def test_delete_account_removes_everything_and_fixes_counters(
    client, db_session, registered_user, publisher_user,
):
    mine = create_recipe(client, registered_user["auth_header"], title="שלי")
    theirs = create_recipe(client, publisher_user["auth_header"], title="של אחרת")
    me = _user(db_session, registered_user["email"])
    other = _user(db_session, publisher_user["email"])

    # What this account did to someone else's recipe, and what someone else
    # did with this account's recipe.
    db_session.add_all([
        Like(user_id=me.id, recipe_id=theirs["id"]),
        Rating(user_id=me.id, recipe_id=theirs["id"], score=5),
        Comment(author_id=me.id, recipe_id=theirs["id"], content="מעולה"),
        Follow(follower_id=other.id, followed_id=me.id),
        StoredImage(id="a" * 32, owner_id=me.id, content_type="image/webp", byte_size=3, data=b"abc"),
    ])
    shelf = Collection(user_id=other.id, name="אהובים")
    db_session.add(shelf)
    db_session.flush()
    db_session.add(CollectionItem(collection_id=shelf.id, recipe_id=mine["id"]))
    rec = db_session.get(Recipe, theirs["id"])
    rec.likes_count, rec.ratings_count, rec.ratings_sum, rec.comments_count = 1, 1, 5, 1
    db_session.commit()

    r = client.delete("/api/v1/users/me", headers=registered_user["auth_header"])
    assert r.status_code == 204, r.text

    db_session.expire_all()
    assert db_session.query(User).filter(User.email == registered_user["email"]).first() is None
    assert db_session.get(Recipe, mine["id"]) is None
    assert db_session.query(StoredImage).count() == 0
    assert db_session.query(Follow).count() == 0
    assert db_session.query(CollectionItem).count() == 0
    rec = db_session.get(Recipe, theirs["id"])
    assert (rec.likes_count, rec.ratings_count, rec.ratings_sum, rec.comments_count) == (0, 0, 0, 0)

    # The token outlives the account, and opens nothing.
    assert client.get("/api/v1/users/me", headers=registered_user["auth_header"]).status_code == 401
