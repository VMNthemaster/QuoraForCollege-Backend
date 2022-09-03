import Answer from '../models/Answer.js'
import Question from '../models/Question.js'
import QuestionId from '../models/QuestionId.js'
import School from '../models/School.js'

export const addQuestion = async (req, res) => {
  // we have to check for image file also
  const { school } = req.params // when we want it in 'openForAll' section, school value will be openForAll
  const { question, askedBy, keywords } = req.body // handle keywords at the frontend
  const correctSchoolName = school.replace('+', ' ')

  let existingSchool
  let studentExists = false

  if (correctSchoolName !== 'openForAll') {
    try {
      existingSchool = await School.findOne({ school: correctSchoolName })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
    if (!existingSchool) {
      return res
        .status(400)
        .json({ success: false, message: 'School does not exist' })
    }

    let studentDetails = existingSchool.studentDetails
    for (let student of studentDetails) {
      if (student.name === askedBy) {
        studentExists = true
        break
      }
    }
    if (studentExists === false) {
      return res
        .status(400)
        .json({ success: false, message: 'Student does not exist' })
    }
  }

  const date = new Date()
  const day = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  const newQuestion = new Question({
    askedBy,
    question,
    keywords,
    answerId: [],
    date: `${day}/${month}/${year}`,
  })

  let newQuestionSchema
  try {
    newQuestionSchema = await newQuestion.save()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  // adding the questions' id to the questionId schema
  let schoolExists
  try {
    schoolExists = await QuestionId.findOne({ school: correctSchoolName })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  // check if school already exists for holding questions
  if (schoolExists) {
    let questionIds = schoolExists.questionId
    questionIds.push(newQuestionSchema._id)

    let updatedQuestionIdSchema
    try {
      updatedQuestionIdSchema = await QuestionId.updateOne(
        { school: correctSchoolName },
        { $set: { questionId: questionIds } }
      )
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  } else {
    const newQuestionIdSchema = new QuestionId({
      school: correctSchoolName,
      questionId: [newQuestionSchema._id],
    })

    try {
      await newQuestionIdSchema.save()
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  return res.status(201).json({
    success: true,
    message: 'Question added successfully',
    newQuestionSchema,
  })
}

export const deleteQuestion = async (req, res) => {
  // we also have to remove the answers
  const { school, id } = req.params
  const correctSchoolName = school.replace('+', ' ')

  let existingSchool
  if (correctSchoolName !== 'openForAll') {
    try {
      existingSchool = await QuestionId.findOne({ school: correctSchoolName })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
    if (!existingSchool) {
      return res
        .status(400)
        .json({ success: false, message: 'School does not exist' })
    }
  } else {
    try {
      existingSchool = await QuestionId.findOne({ school: 'openForAll' })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  let questionIds = existingSchool.questionId
  questionIds = questionIds.filter((qid) => qid !== id)

  try {
    let updatedQuestionIds = await QuestionId.updateOne(
      { school: correctSchoolName },
      { $set: { questionId: questionIds } }
    )
    let deletedQuestion = await Question.deleteOne({ _id: id })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({
    success: true,
    message: 'Question deleted successfully',
    questionIds,
  })
}

export const getAllQuestions = async (req, res) => {
  const { school } = req.params
  const correctSchoolName = school.replace('+', ' ')

  let existingSchool
  if (correctSchoolName !== 'openForAll') {
    try {
      existingSchool = await QuestionId.findOne({ school: correctSchoolName })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
    if (!existingSchool) {
      return res
        .status(400)
        .json({ success: false, message: 'School does not exist' })
    }
  } else {
    try {
      existingSchool = await QuestionId.findOne({ school: 'openForAll' })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const questionIds = existingSchool.questionId
  let questionsArray = []

  try {
    for (let questionId of questionIds) {
      let question = await Question.findOne({ _id: questionId })
      questionsArray.push(question)
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({
    success: true,
    message: 'Questions retrieved successfully',
    questionsArray,
  })
}

export const getSingleQuestion = async (req, res) => {
  const { school, id } = req.params
  const correctSchoolName = school.replace('+', ' ')

  let existingSchool
  if (correctSchoolName !== 'openForAll') {
    try {
      existingSchool = await QuestionId.findOne({ school: correctSchoolName })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
    if (!existingSchool) {
      return res
        .status(400)
        .json({ success: false, message: 'School does not exist' })
    }
  } else {
    try {
      existingSchool = await QuestionId.findOne({ school: 'openForAll' })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  let question
  try {
    question = await Question.findOne({ _id: id })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if (!question) {
    return res
      .status(400)
      .json({ success: false, message: 'Question does not exist' })
  }

  // checking if that question is for that college only
  let questionBelongsToCollege = false
  const questionIdArray = existingSchool.questionId
  for (let qid of questionIdArray) {
    if (qid === id) {
      questionBelongsToCollege = true
      break
    }
  }

  if (questionBelongsToCollege === false) {
    return res
      .status(400)
      .json({
        success: false,
        message: 'Question does not belong to this college',
      })
  }

  return res.status(200).json({
    success: true,
    message: 'Question retrieved successfully',
    question,
  })
}

export const addAnswer = async (req, res) => {
  const { name: studentName, email: studentEmail, answer } = req.body
  const { school, id } = req.params
  const correctSchoolName = school.replace('+', ' ')

  let existingSchool
  let studentExists = false
  if (correctSchoolName !== 'openForAll') {
    try {
      existingSchool = await School.findOne({ school: correctSchoolName })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    if (!existingSchool) {
      return res
        .status(400)
        .json({ success: false, message: 'School does not exist' })
    }

    const studentsArray = existingSchool.studentDetails
    for (let student of studentsArray) {
      if (student.schoolEmail === studentEmail) {
        studentExists = true
        break
      }
    }
    if (studentExists === false) {
      return res
        .status(400)
        .json({ success: false, message: 'Student does not exist' })
    }
  } else {
    try {
      existingSchool = await School.findOne({ school: 'openForAll' })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // checking if questionId is correct
  let questionIdSchema
  let questionExists = false
  try {
    questionIdSchema = await QuestionId.findOne({ school: correctSchoolName })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  let questionIdArray = questionIdSchema.questionId
  for (let questionId of questionIdArray) {
    if (questionId === id) {
      questionExists = true
      break
    }
  }

  if (questionExists === false) {
    return res
      .status(400)
      .json({ success: false, message: 'Question does not exist' })
  }

  const date = new Date()
  const day = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  const newAnswer = new Answer({
    answers: [{
      answeredBy: studentName,
      answer,
      date: `${day}/${month}/${year}`,
    }]
  })

  let answerDocument, questionSchema
  try {
    answerDocument = await newAnswer.save()
    questionSchema = await Question.findOne({ _id: id })

    let answersIdArray = questionSchema.answerId
    answersIdArray.push(answerDocument._id)
    let answers = []

    let updatedQuestionSchema = await Question.updateOne(
      { _id: id },
      { $set: { answerId: answersIdArray } }
    )
    
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res
    .status(201)
    .json({ success: true, message: 'Answer added successfully', answerDocument })
}

export const getAllAnswers = async (req, res) => {
  const { school, id } = req.params
  const correctSchoolName = school.replace('+', ' ')

  let existingSchool
  if (correctSchoolName !== 'openForAll') {
    try {
      existingSchool = await School.findOne({ school: correctSchoolName })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    if (!existingSchool) {
      return res
        .status(400)
        .json({ success: false, message: 'School does not exist' })
    }
  }

  // checking if question exists
  let questionIdSchema
  let questionExists = false
  try {
    questionIdSchema = await QuestionId.findOne({ school: correctSchoolName })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  let questionIdArray = questionIdSchema.questionId
  for (let questionId of questionIdArray) {
    if (questionId === id) {
      questionExists = true
      break
    }
  }

  if (questionExists === false) {
    return res
      .status(400)
      .json({ success: false, message: 'Question does not exist' })
  }

  // getting the question and answers id associated with it and storing the answers in an array
  let questionSchema, answerIdArray
  let answersArray = []
  try {
    questionSchema = await Question.findById(id)
    answerIdArray = questionSchema.answerId

    for (let answerId of answerIdArray) {
      let answer = await Answer.findById(answerId)
      answersArray.push(answer)
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res
    .status(200)
    .json({ success: true, message: 'Answers retrieved successfully', answersArray })
}

export const searchQuestion = async (req, res) => {
  const {question} = req.body
  // we will sort question according to most matched keywords
  // we will remove general words like is, the, how, to, etc
  // TODO
}
