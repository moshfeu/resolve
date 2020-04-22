import jwt from 'jsonwebtoken'
import jwtSecret from './jwt_secret'

const routeLoginCallback = async ({ resolve }, nickname) => {
  const user = await resolve.executeQuery({
    modelName: 'user-profiles',
    resolverName: 'user',
    resolverArgs: { name: nickname.trim() }
  })

  if (!user) {
    throw new Error('Incorrect "nickname"')
  }

  return jwt.sign(user, jwtSecret)
}

export default routeLoginCallback
