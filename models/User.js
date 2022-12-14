import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    school: {
        type: String,
        required: true,
        default: 'Anonymous'
    },
    upvotedAnswers: {
        type: [String],
        required: true,
        default: []
    },
    downvotedAnswers: {
        type: [String],
        required: true,
        default: []
    }
    
})

export default mongoose.model('User', userSchema)
