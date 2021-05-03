require('../src/db/mongoose');

const Task = require('../src/models/task');

/* 
Task.findByIdAndRemove('608d7f78d21041195c7a4ebd').then((task) => {
    console.log(task.description, 'was deleted.');
    return Task.countDocuments({ completed: false });
}).then((count) => {
    console.log('A total of', count, ' tasks remain to be completed.');
}).catch((e) => {
    console.log(e);
}) 
*/

const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndRemove(id);
    const count = await Task.countDocuments({ completed: false });

    return count;
};

deleteTaskAndCount('608feb9c011e6612903b70cd').then((count) => {
    console.log('count:', count);
}).catch((err) => {
    console.log(err);
});