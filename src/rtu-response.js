let debug = require('debug')('rtu-response')
let CRC = require('crc')
let ResponseFactory = require('./response/response-factory.js')

class ModbusRTUResponse {
  constructor (address, crc, body) {
    this._address = address
    this._crc = crc
    this._body = body
  }

  static fromRequest (tcpRequest, modbusBody) {
    debug("FROM request", tcpRequest, modbusBody)
    debug("FROM request", modbusBody.crc)
    return new ModbusRTUResponse(tcpRequest._address, 0, modbusBody)
  }

  static fromBuffer (buffer) {
    if (buffer.length < 5) {
      return null
    }

    let address = buffer.readUInt8(0)

    debug('address', address, 'buffer', buffer)

    let body = ResponseFactory.fromBuffer(buffer.slice(1))

    debug('body', body)

    if (!body) {
      return null
    }

    debug("body", body)
    debug("body bc", body.byteCount)

    let crc = 0
    try {
      crc = buffer.readUInt16LE(1 + body.byteCount)
    } catch (e) {
      debug('If NoSuchIndexException, it is probably serial and not all data has arrived', e)
      return null
    }

    return new ModbusRTUResponse(address, crc, body)
  }

  get address () {
    return this._address
  }

  get crc () {
    return this._crc
  }

  get body () {
    return this._body
  }

  get byteCount () {
    return this._body.byteCount + 3
  }

  /** Creates a buffer object representing the modbus rtu response.
   * @returns {Buffer} */
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

}

module.exports = ModbusRTUResponse
