const express = require('express');
require('./db/mongoose');

const taskRouter = require('./routers/task');
const userRouter = require('./routers/user');

const app = express();
const port = process.env.PORT || 3000;

const multer = require('multer');
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if( !file.originalname.match(/\.(doc|docx)$/) ) {
            return callback(new Error('Please upload a Word Document'))
        }

        callback(undefined, true);
    }
});

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send();
}, (err, req, res, next) =>{
    res.status(400).send({ error: err.message });
});


app.use(express.json());
app.use(taskRouter);
app.use(userRouter);

app.listen(port, () => {
    console.log('Server up on port ' +  port);
});

