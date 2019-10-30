const WeigenController = require('./controller')

const controller = new WeigenController()

setTimeout(controller.getStatus, 2000)
