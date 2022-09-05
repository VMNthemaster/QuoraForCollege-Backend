import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  askedBy: {
    type: String,
    required: true,
  },
  askedByEmail: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  questionImageUrl: {
    type: String,
  },
  answerId: [String], // this has id of answers in answers model, answers should also contain the date when it has been answered and also in the frontend should sort according to most upvotes.
  keywords: [String],
  date: {
    type: String,
  }
  
})

export default mongoose.model('Question', questionSchema)
