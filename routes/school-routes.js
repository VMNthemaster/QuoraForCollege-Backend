import express from 'express'
import { addAdmin, addSchool, addStudent, joinSchool, leaveSchool, removeAdmin, removeSchool, removeStudent } from '../controllers/school-controller.js'
const schoolRouter = express.Router()

// we will also add 1 admin simultanously while adding school
schoolRouter.post('/addSchool', addSchool)
schoolRouter.delete('/removeSchool/:school', removeSchool)

// only admins can add or remove other admins
schoolRouter.patch('/:school/addAdmin', addAdmin)
schoolRouter.patch('/:school/removeAdmin', removeAdmin)

// only admins can add or remove a student
schoolRouter.patch('/:school/addStudent', addStudent)
schoolRouter.patch('/:school/removeStudent', removeStudent)

// student to join or leave school
schoolRouter.post('/joinSchool/:school', joinSchool)
schoolRouter.post('/leaveSchool/:school', leaveSchool)

export default schoolRouter