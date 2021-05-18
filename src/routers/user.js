const express = require('express');
const multer = require('multer');

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

// Upload profile picture
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, callback) {
        if( !file.originalname.match(/\.(jpg|jpeg|png)$/) ) {
            return callback(new Error('Please upload a JPG, JPEG, or PNG file.'))
        }

        callback(undefined, true)
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();

    res.send();
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
});

/// DELETE user profile picture

router.delete('/users/me/avatar', auth, async (req, res) => {
    if(!req.user.avatar) res.status(400).send('No avatar found.');
    
    try {
        req.user.avatar = undefined;
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
});

///

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