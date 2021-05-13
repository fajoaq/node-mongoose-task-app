const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) throw new Error('Must provide valid email.');
        }
    },
    password: {
        type: String,
        trim: true,
        minLength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')) throw new Error('Must not contain word password.');
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) throw new Error('Age must be positive number.');
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

//virtual attribute, relationship between User and Task
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

//lock down password and tokens on INSTANCE of user, 'toJSON' required
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

// Generate Token, available on INSTANCE of user
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'testsecret');

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

// Find by credential on MODEL of user
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user) throw new Error('Unable to login');

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) throw new Error('Unable to login');

    return user;
};

// Middleware, Hash plaintext password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    if(user.isModified('password'))  user.password = await bcrypt.hash(user.password, 8);

    next();
});

//Middleware, Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;