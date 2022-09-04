import express from 'express'
import { addAnswer, addQuestion, deleteQuestion, getAllAnswers, getAllQuestions, getSingleQuestion, searchQuestion } from '../controllers/question-controller.js'
const questionRouter = express.Router()
// add route for asking general question also

// anybody from that school can ask question
questionRouter.post('/:school/addQuestion', addQuestion)
questionRouter.delete('/:school/deleteQuestion/:id', deleteQuestion)

questionRouter.get('/:school/getAllQuestions', getAllQuestions)
questionRouter.get('/:school/getSingleQuestion/:id', getSingleQuestion)

// only people from the same school can answer if the question is not openForAll
questionRouter.post('/:school/:id/addAnswer', addAnswer)    // id here is question id
questionRouter.get('/:school/:id/getAllAnswers', getAllAnswers)

// search question
questionRouter.post('/:school/searchQuestion', searchQuestion)


export default questionRouter