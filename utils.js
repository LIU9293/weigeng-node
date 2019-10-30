const funcNames = require('./funcNames')

function packData (funcCode, payload, serial) {
  const data = Buffer.alloc(64)

  data.writeUInt8(0x17, 0)
  data.writeUInt8(funcCode, 1)
  if (serial) {
    data.writeUInt32LE(serial, 4)
  }
  if (payload) {
    if (Buffer.isBuffer(payload)) {
      data.fill(payload, 8, 8 + payload.byteLength)
    } else if (typeof payload === 'number') {
      data.writeUInt8(payload, 8)
    } else {
      data.write(payload.replace(/\s/g, ''), 8, 'hex')
    }
  } else {
    payload = Buffer.alloc(0)
  }

  return data
}

function parseData (data) {
  var funcCode = '0x' +
        data
          .slice(1, 2)
          .toString('hex')
          .toUpperCase()
  var serial = data.readUInt32LE(4)
  var payload = data.slice(8)
  return Object.assign({ serial: serial }, payloadParser(funcCode, payload))
}

function parseDate (buffer) {
  const text = buffer.toString('hex')

  if (parseInt(text) === 0) {
    return 0
  }
  const date = new Date(text.slice(0, 4), text.slice(4, 6), text.slice(6, 8), text.slice(8, 10), text.slice(10, 12), text.slice(12))
  return date.getTime()
}

function payloadParser (funcCode, payload) {
  switch (funcCode) {
    case '0x20':
      var types = ['none', 'card', 'open', 'alert']
      var index = payload.readUInt32LE(0)
      var type = payload.readUInt8(4)
      var allow = payload.readUInt8(5)
      var door = payload.readUInt8(6)
      var inOut = payload.readUInt8(7)
      var cardNo = payload.readUInt32LE(8)
      var time = payload.slice(12, 19)
      // console.log("[DEBUG] Card No. hex is: ", payload.slice(8, 12));
      return {
        funcName: funcNames[funcCode],
        index: index,
        type: types[type],
        allow: !!allow,
        door: door,
        inOut: inOut === 1 ? 'in' : 'out',
        cardNo: cardNo,
        time: parseDate(time)
      }
    case '0x32':
      var date = payload.slice(0, 7)
      return {
        funcName: funcNames[funcCode],
        date: parseDate(date)
      }
    case '0x40':
      return {
        funcName: funcNames[funcCode],
        success: payload.readUInt8(0)
      }
    case '0x50':
      return {
        funcName: funcNames[funcCode],
        success: !!payload.readUInt8(0)
      }
    case '0x52':
      return {
        funcName: funcNames[funcCode],
        success: !!payload.readUInt8(0)
      }
    case '0x54':
      return {
        funcName: funcNames[funcCode],
        success: !!payload.readUInt8(0)
      }
    case '0x5A':
      return {
        funcName: funcNames[funcCode],
        cardNo: payload.readUInt32LE(0) || null,
        from: payload.slice(4, 8).toString('hex'),
        to: payload.slice(8, 12).toString('hex')
      }
    case '0x90':
      return {
        funcName: funcNames[funcCode],
        success: !!payload.readUInt8(0)
      }
    case '0x92':
      return {
        funcName: funcNames[funcCode],
        ip: hexToIp(payload.slice(0, 4).toString('hex')),
        port: payload.readUInt16LE(4),
        interval: payload.readUInt8(6)
      }
    case '0x94':
      return {
        funcName: funcNames[funcCode],
        ip: hexToIp(payload.slice(0, 4).toString('hex')),
        subNet: hexToIp(payload.slice(4, 8).toString('hex')),
        gateway: hexToIp(payload.slice(8, 12).toString('hex')),
        mac: (payload
          .slice(12, 18)
          .toString('hex')
          .toUpperCase()
          .match(/.{1,2}/g) || []).join(':'),
        version: +payload.slice(18, 20).toString('hex') / 100,
        release: payload.slice(20, 24).toString('hex')
      }
    case '0x96':
      return {
        funcName: funcNames[funcCode],
        ip: hexToIp(payload.slice(0, 4).toString('hex')),
        subNet: hexToIp(payload.slice(4, 8).toString('hex')),
        gateway: hexToIp(payload.slice(8, 12).toString('hex'))
      }
    default:
      return {
        funcName: 'Unknown (' + funcCode + ')',
        data: payload
      }
  }
}

function hexStringToDecArray (hexString) {
  var matches = hexString.match(/.{1,2}/g)
  if (!matches) {
    return []
  }
  return matches.map(function (byteString) { return parseInt(byteString, 16) })
}

// function decArrayToHexString (decArray) {
//   var hex = decArray.map(function (d) { return d.toString(16).padStart(2, '0') }).join('')
//   return hex
// }

// function ipToHex (ip) {
//   return decArrayToHexString(ip.split('.').map(function (d) { return +d }))
// }

function hexToIp (hex) {
  return hexStringToDecArray(hex).join('.')
}

module.exports = {
  packData,
  parseData
}
