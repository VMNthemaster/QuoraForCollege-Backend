import Answer from '../models/Answer.js'

export const voteAnswer = async (req, res) => {
  const { id, vote } = req.params

  // check if answer exists
  let answerSchema 
  let answerExists = false
  try {
    answerSchema = await Answer.find({})
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  console.log(answerSchema)

  for(let answers of answerSchema){
    if (answers._id.toString() === id){
        answerExists = true
        // console.log(answers.answers[0].votes)
        answers.answers[0].votes++
        // console.log(answers.answers[0].votes)
        break
    }
  }

  console.log("new")
  console.log(answerSchema)
  

  if(answerExists === false){
    return res.status(400).json({success: false, message: 'Answer does not exist'})
  }

  try {
    // let updatedAnswers = await Answer.updateOne({_id: id}, {$set: {answers: answerSchema}})
    let updatedAnswers = await Answer.updateOne({ answers: answerSchema })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({success: true, message: 'Vote added successfully', answerSchema})



//   let answerVotesValue = existingAnswer.answers.votes
  if(vote === 'upvote'){

  }
}
