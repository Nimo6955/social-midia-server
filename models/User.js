const mongoose = require('mongoose');
const { Schema } = mongoose;


// const userSchema = mongoose.Schema({
    const userSchema = new Schema({
    
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        // select: false
    },
    name: {
        type: String,
        // required: true
    },
    bio: {
        type: String,
    },
    avatar: {
        publicId: String,
        url: String
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ],
    bookmarks:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
}, {
    timestamps: true
});

// module.exports = mongoose.model("user", userSchema);
const User  = mongoose.model('user', userSchema);
module.exports = User