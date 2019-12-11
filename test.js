const WeigengController = require('./controller')

const controller = new WeigengController({})

setTimeout(() => {
  controller.getStatus()

  setTimeout(() => {
    process.exit(0)
  }, 1000);
}, 2000)
