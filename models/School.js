import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  schoolEmail: {
    type: String,
  },
  schoolPassword: {
    type: String,
    minlength: 6,
  },
})

const schoolSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true,
  },
  adminDetails: [
    {
      email: {
        type: String,
        unique: true,
        required: true,
      },
      password: {
        type: String,
        minlength: 6,
        required: true,
      },
    },
  ],
  studentDetails: {
    type: [studentSchema],
  },
})



export default mongoose.model('School', schoolSchema)
