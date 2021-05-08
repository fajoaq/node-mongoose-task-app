const express = require('express');
require('./db/mongoose');

const taskRouter = require('./routers/task');
const userRouter = require('./routers/user');
const { findByIdAndUpdate } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(taskRouter);
app.use(userRouter);

app.listen(port, () => {
    console.log('Server up on port ' +  port);
});

