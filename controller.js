const dgram = require('dgram')
const { parseData, packData } = require('./utils')

class WeigengController {
  constructor ({ port = 60000, selfPort = 6000 }) {
    this.originalIp = '255.255.255.255'
    this.selfPort = selfPort
    this.port = port
    this.messageQueue = []

    this.socket = this.init.bind(this)
    this.sendData = this.sendData.bind(this)
    this.broadcastData = this.broadcastData.bind(this)
    this.search = this.search.bind(this)
    this.getStatus = this.getStatus.bind(this)
    this.openDoor = this.openDoor.bind(this)
    this.getIp = this.getIp.bind(this)

    this.init()
  }

  init () {
    const socket = dgram.createSocket('udp4')
    this.socket = socket

    socket.on('error', err => {
      console.error(`[WeigengController] Lost UPD connection:\n${err.stack}.`)
      socket.close()
    })

    socket.on('message', (msg, rinfo) => {
      const message = parseData(msg)

      if (!process.env.HIDE_WEIGENG_MESSAGE) {
        console.log(
          `[UDP] Got message from ${rinfo.address}:${rinfo.port}.`,
          JSON.stringify(message)
        )
      }
     
      if (message.funcName === 'Search') {
        const { serial, subNet, gateway, mac } = message
        this.serial = serial
        this.ip = rinfo.address
        this.subNet = subNet
        this.gateway = gateway
        this.mac = mac
      }

      if (message.funcName === 'OpenDoor') {
        this.messageQueue.push({
          timestamp: new Date().getTime()
        })
      }
    })

    socket.bind(this.selfPort)
    setTimeout(this.search, 1000)
  }

  sendData (funcCode, payload) {
    this.socket.setBroadcast(false)
    const data = packData(funcCode, payload, this.serial)

    this.socket.send(
      data,
      0,
      data.byteLength,
      this.port,
      this.ip,
      err => {
        if (err) console.error(err)
      }
    )
  }

  broadcastData (funcCode, payload) {
    this.socket.setBroadcast(true)
    const data = packData(funcCode, payload, this.serial)

    this.socket.send(
      data,
      0,
      data.byteLength,
      this.port,
      this.originalIp,
      err => {
        if (err) console.error(err)
      }
    )
  }

  search () {
    this.broadcastData(0x94)
  }

  getStatus () {
    this.broadcastData(0x20)
  }

  getIp () {
    this.broadcastData(0x92)
  }

  openDoor (n) {
    this.broadcastData(0x40, n)
  }
}

module.exports = WeigengController
