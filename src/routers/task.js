const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

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

//UPLOAD TASK IMAGE
const upload = multer({
    limits: {
        fileSize: 500000,
    },
    fileFilter(req, file, callback) {
        if( !file.originalname.match(/\.(jpg|jpeg|png)$/) ) {
            return callback(new Error('Please upload a JPG, JPEG, or PNG file.'))
        }

        callback(undefined, true)
    }
});

router.post('/tasks/:id/image', auth, upload.single('taskImage'), async (req, res) => {
    let task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if(!task) return res.status(404).send();

    const buffer = await sharp(req.file.buffer).resize({width: 400, height: 400}).png().toBuffer()
    task.taskImage = buffer;
    await task.save();

    res.send();
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed) match.completed = req.query.completed === 'true';
    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_');
        //Ascending vs Descending for whichever sort method was provided
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.send(req.user.tasks);
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
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) return res.status(400).send({error: 'Invalid updates.'});

    try {
        let task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if(!task) return res.status(404).send();

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
    
        res.send(task);   
    } catch (err) {
        res.status(500).send(err);
    }
});

// TASK DELETE
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        let task = await Task.findOneAndDelete({ 
            _id: req.params.id, 
            owner: req.user._id 
        });

        if(!task) return res.status(404).send();

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;