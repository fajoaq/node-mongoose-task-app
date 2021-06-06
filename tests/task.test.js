const request = require('supertest');

const app = require('../src/app');
const Task = require('../src/models/task');
const { 
    userOneId, 
    userOne, 
    userTwoId, 
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase } = require('./fixtures/db');

beforeEach(() => setupDatabase());

test("Should create task for user", async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "My new task"
        })
        .expect(201);

    //assertions
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toBe(false);
});

test("Should get user tasks", async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    //assertions
    expect(response.body.length).toBe(2);
});

test("Should not delete unauthorized user task", async () => {
    const response = await request(app)
    .delete(`/task/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

    //assertions
    const task = await Task.findById(taskOne._id);

    expect(task).not.toBeNull();
});