import Answer from '../models/Answer.js'
import School from '../models/School.js'
import QuestionId from '../models/QuestionId.js'
import e from 'express'

export const voteAnswer = async (req, res) => {
  const { id, vote, school } = req.params
  const { email: schoolEmail} = req.body
  const correctSchoolName = school.replace(/\+/g, ' ')

  // check if answer exists
  let answerExists
  try {
    answerExists = await Answer.findById(id)
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if(!answerExists){
    return res.status(400).json({success: false, message: 'Answer does not exist'})
  }

  // if school is not openForAll then only people from that school can vote
  let existingSchool
  if(correctSchoolName !== 'openForAll'){
    try {
      existingSchool = await School.findOne({school: correctSchoolName})
    } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
    }

    if(!existingSchool){
      return res.status(400).json({success: false, message: 'School does not exist'})
    }

    // checking if the student who wishes to vote belongs to the same school
    let studentExists = false
    const studentDetails = existingSchool.studentDetails
    for(let student of studentDetails){
      if(student.schoolEmail === schoolEmail){
        studentExists = true
        break
      }
    }
    if(studentExists === false){
      return res.status(400).json({success: false, message: 'You dont belong to this college, you cannot vote for this answer'})
    }
  }
  
  const previousVotes = answerExists.votes
  let newVotes
  if(vote === 'upvote'){
    newVotes = previousVotes + 1
  }
  else if(vote === 'downvote'){
    newVotes = previousVotes - 1
  }

  try {
    let updatedAnswers = await Answer.updateOne({_id: id}, {$set: {votes: newVotes}})
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({success: true, message: 'Vote registered successfully'})

}
