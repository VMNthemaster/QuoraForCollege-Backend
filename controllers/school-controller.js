import bcrypt from 'bcryptjs'
import School from '../models/School.js'
import User from '../models/User.js'
import QuestionId from '../models/QuestionId.js'
import Question from '../models/Question.js'

export const addSchool = async (req, res) => {
  const { school, email: adminEmail, password: adminPassword } = req.body
  let existingSchool

  try {
    existingSchool = await School.findOne({ school })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if (existingSchool) {
    return res
      .status(400)
      .json({ success: false, message: 'School already exists' })
  }

  const hashedAdminPassword = bcrypt.hashSync(adminPassword)

  const adminDetails = [
    {
      email: adminEmail,
      password: hashedAdminPassword,
    },
  ]

  const newSchool = new School({
    school,
    adminDetails,
    studentDetails: []
  })

  try {
    await newSchool.save()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res
    .status(201)
    .json({ success: true, message: 'School added successfully', newSchool })
}

export const removeSchool = async (req, res) => {
  const { email: adminEmail, password: adminPassword } = req.body
  const { school } = req.params
  let existingSchool
  let isAdmin = false
  const correctSchoolName = school.replace(/\+/g, ' ')

  try {
    existingSchool = await School.findOne({ school: correctSchoolName })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if (!existingSchool) {
    return res
      .status(400)
      .json({ success: false, message: 'School Does not exist' })
  }

  const adminDetails = existingSchool.adminDetails

  for (let admin of adminDetails) {
    if (admin.email === adminEmail) {
      const isPasswordCorrect = bcrypt.compareSync(
        adminPassword,
        admin.password
      )
      if (isPasswordCorrect) {
        isAdmin = true
        break
      }
    }
  }

  if (!isAdmin) {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid credentials' })
  }

  let questionIdSchema
  let questionId = []
  try {
    let deletedSchool = await School.deleteOne({ school: correctSchoolName })
    let questionIdSchema = await QuestionId.findOne({school: correctSchoolName}) 

    if(questionIdSchema){
      questionId = questionIdSchema.questionId
  
      for(let qid of questionId){
        let questionExists = await Question.findById(qid)
        if(questionExists){
          let deletedQuestion = await Question.deleteOne({_id: qid})
        }
      }
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({
    success: true,
    message: 'School deleted successfully',
    existingSchool,
  })
}

export const addAdmin = async (req, res) => {
  const { school } = req.params
  const { email: newAdminEmail, password: newAdminPassword } = req.body
  let existingSchool, adminDetails, updatedAdminDetails
  const correctSchoolName = school.replace(/\+/g, ' ')

  try {
    existingSchool = await School.findOne({ school: correctSchoolName })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if (!existingSchool) {
    return res
      .status(400)
      .json({ success: false, message: 'School Does not exist' })
  }

  adminDetails = existingSchool.adminDetails

  for (let admin of adminDetails) {
    if (admin.email === newAdminEmail) {
      return res
        .status(400)
        .json({ success: false, message: 'Admin already exists' })
    }
  }

  const newAdmin = {
    email: newAdminEmail,
    password: bcrypt.hashSync(newAdminPassword),
  }
  adminDetails.push(newAdmin)

  try {
    updatedAdminDetails = await School.updateOne(
      { school: correctSchoolName },
      { $set: { adminDetails } }
    )
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({
    success: true,
    message: 'Admin added successfully',
    updatedAdminDetails,
  })
}

export const removeAdmin = async (req, res) => {
  const { email: adminEmail } = req.body
  const { school } = req.params
  let existingSchool, adminDetails
  let adminDoesExist = false
  const correctSchoolName = school.replace(/\+/g, ' ')

  try {
    existingSchool = await School.findOne({ school: correctSchoolName })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if (!existingSchool) {
    return res
      .status(400)
      .json({ success: false, message: 'School Does not exist' })
  }

  adminDetails = existingSchool.adminDetails

  for (let admin of adminDetails) {
    if (admin.email === adminEmail) {
      adminDoesExist = true
      break
    }
  }

  if (!adminDoesExist) {
    return res.status(400).json({
      success: false,
      message: 'Admin with this credentials does not exist',
    })
  }

  if (adminDetails.length === 1) {
    return res.status(400).json({
      success: false,
      message: 'Schools need to have at least one admin',
    })
  }

  const newAdminDetails = adminDetails.filter(
    (admin) => admin.email !== adminEmail
  )

  try {
    let updatedAdminDetails = await School.updateOne(
      { school: correctSchoolName },
      { $set: { adminDetails: newAdminDetails } }
    )
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res
    .status(200)
    .json({ success: true, message: 'Admin removed successfully' })
}

export const addStudent = async (req, res) => {
  const { school } = req.params
  const {
    name: studentName,
    email: studentEmail,
    password: studentPassword,
  } = req.body
  let existingSchool, updatedStudentDetails
  let studentExists = false
  const correctSchoolName = school.replace(/\+/g, ' ')

  try {
    existingSchool = await School.findOne({ school: correctSchoolName })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if (!existingSchool) {
    return res
      .status(400)
      .json({ success: false, message: 'School Does not exist' })
  }

  let studentDetails = existingSchool.studentDetails

  for (let student of studentDetails) {
    if (student.schoolEmail === studentEmail) {
      studentExists = true
      break
    }
  }

  if (studentExists) {
    return res
      .status(400)
      .json({ success: false, message: 'Student already exists' })
  }

  const newStudent = {
    name: studentName,
    schoolEmail: studentEmail,
    schoolPassword: studentPassword,
  }

  studentDetails.push(newStudent)

  try {
    updatedStudentDetails = await School.updateOne(
      { school: correctSchoolName },
      { $set: { studentDetails } }
    )
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res
    .status(200)
    .json({
      success: true,
      message: 'Student added successfully',
      studentDetails,
    })
}

export const removeStudent = async (req, res) => {
  const { school } = req.params
  const { email: studentEmail } = req.body
  let existingSchool, updatedStudentDetails
  let studentExists = false
  const correctSchoolName = school.replace(/\+/g, ' ')

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
    if (student.schoolEmail === studentEmail) {
      studentExists = true
      break
    }
  }

  if (!studentExists) {
    return res
      .status(400)
      .json({ success: false, message: 'Student does not exist' })
  }

  studentDetails = studentDetails.filter(
    (student) => student.schoolEmail !== studentEmail
  )

  try {
    updatedStudentDetails = await School.updateOne(
      { school: correctSchoolName },
      { $set: { studentDetails } }
    )
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({
    success: true,
    message: 'Student removed successfully',
    studentDetails,
  })
}

export const joinSchool = async (req, res) => {
  const { school } = req.params
  const { email: studentEmail, generalEmail } = req.body
  let existingSchool
  let studentExists = false
  const correctSchoolName = school.replace(/\+/g, ' ')

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
    if (student.schoolEmail === studentEmail) {
      studentExists = true
      break
    }
  }

  if (studentExists === false) {
    return res
      .status(400)
      .json({ success: false, message: 'You are not allowed to join this school' })
  }

  // change his userdetails school name with the provided school name
  let user
  try {
    user = await User.findOne({email: generalEmail})
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if(!user){
    return res.status(400).json({success: false, message: 'User does not exist'})
  }

  if(user.school !== 'Anonymous'){
    return res.status(400).json({success: false, message: 'You have already joined the school'})
  }

  try {
    let updatedUser = await User.updateOne({email: generalEmail}, {$set: {school: correctSchoolName}})
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({success: true, message: 'School joined successfully'})
}

export const leaveSchool = async (req, res) => {
  const { school } = req.params
  const { email: studentEmail, generalEmail } = req.body
  let existingSchool
  let studentExists = false
  const correctSchoolName = school.replace(/\+/g, ' ')

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
    if (student.schoolEmail === studentEmail) {
      studentExists = true
      break
    }
  }

  if(studentExists === false){
    return res.status(400).json({success: false, message: 'You need to join a school first'})
  }

  let user
  try {
    user = await User.findOne({email: generalEmail})
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if(!user){
    return res.status(400).json({success: false, message: 'User does not exist'})
  }
  else if(user.school === 'Anonymous'){
    return res.status(400).json({success: false, message:'You need to join a school first'})
  }

  try {
    let updatedUser = await User.updateOne({email: generalEmail}, {$set: {school: 'Anonymous'}})
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res.status(200).json({success: true, message: 'School left successfully'})
}
