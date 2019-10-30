const dgram = require('dgram')
const { parseData, packData } = require('./utils')

class WeigengController {
  constructor (ip = '255.255.255.255', port = 60000) {
    this.ip = ip
    this.port = port

    this.sendData = this.sendData.bind(this)
    this.initLocalSocket = this.initLocalSocket.bind(this)
    this.search = this.search.bind(this)
    this.getStatus = this.getStatus.bind(this)
    this.openDoor = this.openDoor.bind(this)
    this.getIp = this.getIp.bind(this)
    this.getDate = this.getDate.bind(this)

    this.initLocalSocket()
  }

  initLocalSocket () {
    const socket = dgram.createSocket('udp4')
    this.localSocket = socket

    socket.on('error', err => {
      console.log(`[UDP] Error:\n${err.stack}.`)
      socket.close()
    })

    socket.on('message', (msg, rinfo) => {
      const message = parseData(msg)
      console.log(
        `[UDP] Got message from ${rinfo.address}:${rinfo.port}.`,
        JSON.stringify(message)
      )

      if (message.funcName === 'Search') {
        const { serial, /* ip, */ subNet, gateway, mac } = message
        this.serial = serial
        // this.ip = ip
        this.subNet = subNet
        this.gateway = gateway
        this.mac = mac
      }
    })

    socket.bind(6000)
    setTimeout(this.search, 1000)
  }

  sendData (funcCode, payload) {
    if (this.ip === '255.255.255.255') {
      console.log('----')
      this.localSocket.setBroadcast(true)
    }
    const data = packData(funcCode, payload, this.serial)

    console.log(`Sending local data to ${this.ip}, data length: ${data.byteLength}`)
    this.localSocket.send(
      data,
      0,
      data.byteLength,
      this.port,
      this.ip,
      err => {
        if (err) {
          console.error(err)
          if (this.ip === '255.255.255.255') {
            this.localSocket.setBroadcast(false)
          }
        }
      }
    )
  }

  search () {
    this.sendData(0x94)
  }

  getStatus () {
    this.sendData(0x20)
  }

  getIp () {
    this.sendData(0x92)
  }

  getDate () {
    this.sendData(0x32)
  }

  openDoor () {
    this.sendData(0x40)
  }
}

module.exports = WeigengController
