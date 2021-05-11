const express = require('express');

const router = new express.Router();
const User = require('../models/user');

/// USERS GET/POST

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try{
        const token = await user.generateAuthToken();

        await user.save();

        res.status(201).send({ user, token });
    } catch(err) {
        res.status(400).send(err);
    }
});

// Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
} catch (err) {
        res.status(400).send();
    }
});

router.get('/users', async (req, res) => {
    try {
        let users = await User.find({});

        res.send(users)
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        let user = await User.findById(_id);

        if(!user) return res.status(404).send();

        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
});

// USER UPDATE

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) return res.status(400).send({error: 'Invalid updates.'});

    try {
        let user = await User.findById(req.params.id);
        
        if(!user) return res.status(404).send();

        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();

        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
});

// USER DELETE
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if(!user) return res.status(404).send();

        res.send(user);
    } catch (err) {
        res.status(500).send(err)
    }
});

module.exports = router;