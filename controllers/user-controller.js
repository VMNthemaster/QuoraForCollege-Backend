import User from '../models/User.js'
import bcrypt from 'bcryptjs'

export const signup = async (req, res) => {
  let { name, email, password, school } = req.body
  let existingUser

  try {
    existingUser = await User.findOne({ email })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: 'User already exists' })
  }

  const hashedPassword = bcrypt.hashSync(password)

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    // school,  by default it will be anonymous while signing up
  })

  try {
    await newUser.save()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

  return res
    .status(201)
    .json({ success: true, message: 'User created successfully', newUser })
}

export const login = async (req, res) => {
    const {email, password} = req.body
    let existingUser

    try {
        existingUser = await User.findOne({email})
    } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
    }

    if(!existingUser){
        return res.status(400).json({success: false, message: 'User does not exist'})
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password)

    if(!isPasswordCorrect){
        return res.status(400).json({success: false, message: 'Invalid credentials'})
    }

    return res.status(200).json({success: true, message: 'User logged in successfully', existingUser})
}

