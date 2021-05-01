require('../src/db/mongoose');

const Task = require('../src/models/task');

Task.findByIdAndRemove('608d7f78d21041195c7a4ebd').then((task) => {
    console.log(task.description, 'was deleted.');
    return Task.countDocuments({ completed: false });
}).then((count) => {
    console.log('A total of', count, ' tasks remain to be completed.');
}).catch((e) => {
    console.log(e);
})