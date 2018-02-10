let debug = require('debug')('rtu-request')
let CRC = require('crc')
let ModbusRequestBody = require('./request/request-body.js')

class ModbusRTURequest {
  constructor (address, body) {
    this._address = address
    this._body = body
  }

  static fromBuffer (buffer) {
    debug("Request buffer", buffer)
    if (buffer.length < 1) {
      return null
    }

    let address = buffer.readUInt8(0)

    debug('address', address, 'buffer', buffer.slice(1,-2))

    let body = ModbusRequestBody.fromBuffer(buffer.slice(1,-2))

    if (!body) {
      return null
    }
    debug("body", body)
    debug("body bc", body.byteCount)

    let crc
    try {
      crc = buffer.readUInt16LE(1 + body.byteCount)
      debug("Request crc", crc)
      
    } catch (e) {
      debug('If NoSuchIndexException, it is probably serial and not all data has arrived')
      return null
    }
    debug("New modbus request", address, crc, body)
    return new ModbusRTURequest(address, body)
  }

  get crc () {
    return this._crc
  }

  get body () {
    return this._body
  }

  get name () {
    return this._body.name
  }

  createPayload () {
    let bodyPayload = this._body.createPayload()

    let payload = Buffer.alloc(1 + bodyPayload.length + 2)
    payload.writeUInt8(this._address, 0) // address
    bodyPayload.copy(payload, 1) // copy body

    debug("Payload to crc", payload)

    this._crc = CRC.crc16modbus(payload.slice(0, -2)) // limit crc over body only
    payload.writeUInt16LE(this._crc, 1 + bodyPayload.length) // crc

    return payload
  }

  get byteCount () {
    debug("ByteCountBody", this._body)
    return this._body.byteCount + 3
  }
}

module.exports = ModbusRTURequest
