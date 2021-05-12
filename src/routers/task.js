const express = require('express');

const router = new express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

/// TASK GET/POST

// Create
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save();

        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        let tasks = await Task.find({});

        if(!tasks) return res.status(404).send();

        res.send(tasks);
    } catch (err) {
        res.status(500).send(err);
    }
});

//Get task by id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        let task = await Task.findOne({ _id, owner: req.user._id });

        if(!task) return res.status(404).send();

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

// TASK UPDATE
router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) return res.status(400).send({error: 'Invalid updates.'});

    try {

        let task = await Task.findById(req.params.id);

        if(!task) return res.status(404).send();

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
    
        res.send(task);   
    } catch (err) {
        res.status(500).send(err);
    }
});

// TASK DELETE
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if(!task) return res.status(404).send();

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;