'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class AuthController {
  async signup({ request, response }) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const userExists = await User.query().where('email', email).first()

      if (userExists) {
        return response.status(400).json({ message: 'User exists!' })
      }

      const hashedPassword = await Hash.make(password)

      const newUser = new User()
      newUser.email = email
      newUser.password = hashedPassword

      await newUser.save()

      return response.status(201).json({ message: 'Sign up successfully!' })
    } catch (error) {
      console.error('Signup Error:', error)
      return response.status(500).json({ message: 'Something went wrong. Please try again later.' })
    }
  }

  async index({ response }) {
    const users = await User.all()
    return response.json(users)
}
}

module.exports = AuthController
