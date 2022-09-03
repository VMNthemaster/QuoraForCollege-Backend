import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
  answers: [
    {
      answeredBy: {
        type: String, 
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
      date: {
        type: String,
      },
      votes: {
        type: Number,
        default: 0,
      },
    },
  ],
})

export default mongoose.model('Answer', answerSchema)
