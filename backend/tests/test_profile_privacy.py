from app.models.user import User


def test_profiles_require_pro_and_consent(client, registered_user, db_session):
    headers = registered_user['auth_header']
    user = db_session.query(User).filter_by(username='tester').one()
    for suffix in ['', '/recipes', '/followers', '/following']:
        assert client.get('/api/v1/users/tester' + suffix).status_code == 404
        assert client.get('/api/v1/users/tester' + suffix, headers=headers).status_code == 200
    assert client.put('/api/v1/users/me', headers=headers, json={'public_profile': True}).status_code == 403
    client.put('/api/v1/users/me', headers=headers, json={'plan': 'pro'})
    db_session.refresh(user)
    assert user.plan == 'free'
    user.plan = 'pro'
    db_session.commit()
    assert client.get('/api/v1/users/tester').status_code == 404
    assert client.put('/api/v1/users/me', headers=headers, json={'public_profile': True}).status_code == 200
    assert client.get('/api/v1/users/tester').status_code == 200
    assert client.put('/api/v1/users/me', headers=headers, json={'public_profile': False}).status_code == 200
    assert client.get('/api/v1/users/tester').status_code == 404
    user.public_profile = True
    user.plan = 'free'
    db_session.commit()
    assert client.get('/api/v1/users/tester').status_code == 404
