const express = require('express');

const router = new express.Router();
const auth = require('../middleware/auth');
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

//Log Out
router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

//Log Out all sessions
router.post('/users/logoutall', auth, async(req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

// Get Profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// USER UPDATE
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) return res.status(400).send({error: 'Invalid updates.'});

    try {
        const user = req.user;

        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();

        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
});

// USER DELETE
router.delete('/users/me', auth, async (req, res) => {
    try {
        await  req.user.remove();
        
        res.send(req.user);
    } catch (err) {
        res.status(500).send(err)
    }
});

module.exports = router;