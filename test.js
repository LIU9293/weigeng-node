const WeigengController = require('./controller')

const controller = new WeigengController()

setTimeout(controller.getStatus, 2000)
