'use strict'

const jwt = require('jsonwebtoken')
const Env = use('Env')

class JwtAuth {
  async handle ({ request, response }, next) {
    const authHeader = request.header('authorization')
    const token = authHeader ? authHeader.split(' ')[1] : null

    if (!token) {
      return response.status(403).json({ message: 'Token is empty' })
    }

    try {
      const decoded = jwt.verify(token, Env.get('JWT_SECRET'))
      request.user = decoded
      await next()
    } catch (error) {
      return response.status(403).json({ message: 'Token invalid' })
    }
  }
}

module.exports = JwtAuth
