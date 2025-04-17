'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')
const Env = use('Env')
const jwt = require('jsonwebtoken')

class AuthController {
  async signup({ request, response }) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const userExists = await User.query().where('email', email).first()

      if (userExists) {
        return response.status(400).json({ message: 'User exists!' })
      }

      const newUser = new User()
      newUser.email = email
      newUser.password = password

      await newUser.save()

      return response.status(201).json({ message: 'Sign up successfully!' })
    } catch (error) {
      console.error('Signup Error:', error)
      return response.status(500).json({ message: 'Something went wrong. Please try again later.' })
    }
  }

  async signin({ request, response }) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const user = await User.query().where('email', email).first()

      if (!user) {
        return response.status(400).json({ message: 'User not exists!' })
      }

      const isMatch = await Hash.verify(password, user.password)
      if (!isMatch) {
        return response.status(400).json({ message: 'Incorrect password!' })
      }

      const secretKey = Env.get('JWT_SECRET')
      if (!secretKey) {
        throw new Error('JWT_SECRET is not defined in the environment variables')
      }

      const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
        expiresIn: '24h',
      })

      return response.json({ token })
    } catch (error) {
      console.error('Signin Error:', error)
      return response.status(500).json({ message: 'Something went wrong. Please try again later.' })
    }
  }
}

module.exports = AuthController
