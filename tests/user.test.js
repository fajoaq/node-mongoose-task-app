const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = require('../src/app');
const User = require('../src/models/user');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'Francis Tester',
    email: 'francistester@testingtest.com',
    password: '56What!!',
    tokens: [{
        token: jwt.sign({ _id: userOneId}, process.env.JWT_SECRET)
    }]
}

beforeEach( async () => {
    await User.deleteMany();
    await new User(userOne).save();
});


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