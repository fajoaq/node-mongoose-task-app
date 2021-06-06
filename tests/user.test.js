const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(() => setupDatabase());


afterAll(() => {
    mongoose.connection.close();
});

test('Should sign up a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Francis J',
        email: 'francistester@yandex.com',
        password: 'MyPass777!'
    })
    .expect(201)

    //assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);

    expect(user).not.toBeNull();

    // assertions about the reponse
    expect(response.body).toMatchObject({
        user: {
            name: 'Francis J',
            email: 'francistester@yandex.com',
        },
        token: user.tokens[0].token
    });

    expect(user.password).not.toBe('MyPass777!');
});

test('Should log in existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200); // Ok

    //assertions about the response
    const user = await User.findById(userOneId);

    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not log in nonexistant user/bad credentials', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'wrongpassword!'
    }).expect(400); // bad request
});

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200); // OK
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401); // Unauthorized
});

test('Should delete account for user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    // assertions 
    const user = await User.findById(userOneId);

    expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
    .delete('/users/me/avatar')
    .send()
    .expect(401);
});

test("Should upload avatar image", async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

    //assertions
    const user = await User.findById(userOneId);
    
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
    const newName = "My new name";

    await request(app)
    .patch(`/users/me`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: newName
    })
    .expect(200);

    // assertions
    const user = await User.findById(userOneId);

    expect(user.name).toBe(newName);
});

test("Should not update invalid user fields", async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'New York'
    })
    .expect(400);
});