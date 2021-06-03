const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const mongoose = require('mongoose');

const userOne = {
    name: 'Francis Tester',
    email: 'francistester@testingtest.com',
    password: '56What!!'
}

beforeEach( async () => {
    await User.deleteMany();
    await new User(userOne).save();
});


afterAll(() => {
    mongoose.connection.close();
});

test('Should sign up a new user', async () => {
    await request(app).post('/users').send({
        name: 'Francis J',
        email: 'francis@yandex.com',
        password: 'MyPass777!'
    }).expect(201);
});