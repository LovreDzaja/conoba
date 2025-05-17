const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const User = require('./models/User')

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection failed:', err))

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body
  const hashed = await bcrypt.hash(password, 10)

  try {
    const user = await User.create({ email, password: hashed })
    res.json({ message: 'User created', user: { id: user._id, email: user.email } })
  } catch (err) {
    res.status(400).json({ error: 'User already exists or invalid input' })
  }
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
  res.json({ message: 'Login successful', token })
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
