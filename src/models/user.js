const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User', {
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
    }
});

module.exports = User;