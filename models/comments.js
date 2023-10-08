const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentsScheema = new Schema({

    comment: {
        type: String,      
    },
    commentsImage:{
        publicId: String,
        url: String
    },
    commentsName: {
        type: String
    }
})

const comment  = mongoose.model('comment', commentsScheema);
module.exports = comment