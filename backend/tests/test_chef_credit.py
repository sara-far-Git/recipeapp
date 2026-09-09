from app.models.user import User


def recipe(client, headers, **extra):
    return client.post('/api/v1/recipes', headers=headers, json={'title': 'Test recipe', **extra})


def test_credit_requires_designated_account(client, registered_user):
    response = recipe(client, registered_user['auth_header'], chef_name='Chef Example')
    assert response.status_code == 403


def test_credit_roundtrip_and_public_identity(client, publisher_user, db_session):
    # This test exercises an explicitly public Pro account.
    from app.models.user import User
    for account in db_session.query(User).all():
        account.plan = "pro"
        account.public_profile = True
    db_session.commit()

    owner = db_session.query(User).filter_by(email=publisher_user['email']).one()
    owner.email = 's3296900@gmail.com'
    db_session.commit()
    response = recipe(client, publisher_user['auth_header'], chef_name='  Chef Example  ')
    assert response.status_code == 201, response.text
    result = response.json()
    assert result['chef_name'] == 'Chef Example'
    assert result['author']['attribution_hidden'] is True
    assert result['author']['full_name'] == 'מערכת האתר'
    assert publisher_user['username'] not in response.text
    public = client.get(f"/api/v1/recipes/{result['id']}")
    assert public.status_code == 200
    assert public.json()['chef_name'] == 'Chef Example'
    listed = client.get('/api/v1/recipes').json()
    assert listed[0]['chef_name'] == 'Chef Example'
    alias = result['author']['username']
    assert client.get(f'/api/v1/users/{alias}').status_code == 200
    me = client.get('/api/v1/users/me', headers=publisher_user['auth_header']).json()
    assert me['username'] == publisher_user['username']
    update = client.put(f"/api/v1/recipes/{result['id']}", headers=publisher_user['auth_header'], json={'chef_name': 'Other Chef'})
    assert update.json()['chef_name'] == 'Other Chef'
    clear = client.put(f"/api/v1/recipes/{result['id']}", headers=publisher_user['auth_header'], json={'chef_name': None})
    assert clear.json()['chef_name'] is None


def test_existing_hidden_publisher_is_anonymous(client, publisher_user, db_session):
    # This test exercises an explicitly public Pro account.
    from app.models.user import User
    for account in db_session.query(User).all():
        account.plan = "pro"
        account.public_profile = True
    db_session.commit()

    result = recipe(client, publisher_user['auth_header']).json()
    assert result['chef_name'] is None
    assert result['author']['attribution_hidden'] is True
    profile = client.get(f"/api/v1/users/{publisher_user['username']}").json()
    assert profile['full_name'] == 'מערכת האתר'
