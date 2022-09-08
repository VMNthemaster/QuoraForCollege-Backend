import express from 'express'
import { adminLogin, signup, studentLogin } from '../controllers/user-controller.js'

const userRouter = express.Router()

userRouter.post('/signup', signup)
userRouter.post('/adminLogin', adminLogin)
userRouter.post('/studentLogin', studentLogin)

export default userRouter
