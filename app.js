import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/user-routes.js'
import schoolRouter from './routes/school-routes.js'
import questionRouter from './routes/question-routes.js'
import answerRouter from './routes/answer-routes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello world')
  res.end() 
})

// routes
app.use('/api/users', userRouter)
app.use('/api/schools', schoolRouter)
app.use('/api/questions', questionRouter)
app.use('/api/answers', answerRouter)

const port = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(port))
  .then(() =>
    console.log(`Connected to database and listening to localhost ${port}`)
  )
  .catch((err) => console.log(err))
