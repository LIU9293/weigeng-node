## Weigeng JavaScript Client (微耕门禁NodeJS客户端)

> Control your weigeng locker with zero dependenies

To disable all console logs, set `process.env.HIDE_WEIGENG_MESSAGE` to true

### Example
```
const WeigengController = require('weigeng-node')

const controller = new WeigengController({})

setTimeout(controller.getStatus, 1000)
setTimeout(controller.openDoor(1), 2000)
```