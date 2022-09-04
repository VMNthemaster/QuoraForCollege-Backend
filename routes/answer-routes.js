import express from 'express'
import { voteAnswer } from '../controllers/answer-controller.js'
const answerRouter = express.Router()

// upvote or downvote in a single route
answerRouter.post('/:school/:id/:vote', voteAnswer)      // id here is answer id ans vote can be upvote or downvote

export default answerRouter