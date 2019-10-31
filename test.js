const WeigengController = require('./controller')

const controller = new WeigengController({})

global.cc = controller

setTimeout(controller.getStatus, 2000)
