def test_image_credit_round_trip(client, registered_user):
    headers = registered_user['auth_header']
    response = client.post('/api/v1/recipes', headers=headers, json={
        'title': 'Photo credit test', 'image_url': '/photo.jpg',
        'image_source': '  Personal photo  ', 'image_credit': '  Photographer  ',
    })
    assert response.status_code == 201
    data = response.json()
    assert data['image_credit'] == 'Photographer'
    assert data['image_source'] == 'Personal photo'
    url = f"/api/v1/recipes/{data['id']}"
    assert client.get(url).json()['image_credit'] == 'Photographer'
    update = client.put(url, headers=headers, json={'image_credit': 'New credit'})
    assert update.json()['image_credit'] == 'New credit'
    assert update.json()['image_source'] == 'Personal photo'
    clear = client.put(url, headers=headers, json={'image_credit': None, 'image_source': None})
    assert clear.json()['image_credit'] is None
    assert clear.json()['image_source'] is None
