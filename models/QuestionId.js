import mongoose from 'mongoose'

const questionIdSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true,
  },
  questionId: [String]
})

export default mongoose.model('QuestionId', questionIdSchema)
