process.env.TZ = 'Europe/Moscow'

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.css': 'jest-css-modules-transform'
  }
}
