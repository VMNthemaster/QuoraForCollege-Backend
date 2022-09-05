import mongoose from "mongoose";

const schoolNameSchema = new mongoose.Schema({
    schoolName: [String]
})

export default mongoose.model('SchoolName', schoolNameSchema)