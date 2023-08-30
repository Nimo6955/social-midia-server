const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    image: {
        publicId: String,
        url: String
    },
    caption: {
        type: String,
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
}, {
    timestamps: true
})

// module.exports = mongoose.model('post', postSchema);
const Post  = mongoose.model('post', postSchema);
module.exports = Post