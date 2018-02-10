let ModbusResponseBody = require('./response-body.js')
let debug = require('debug')('read-holding-response')

/** Read Holding Registers ResponseBody (Function Code 0x03)
 * @extends ModbusResponseBody
 * @class
 */
class ReadHoldingRegistersResponseBody extends ModbusResponseBody {
  /** Create ReadHoldingRegistersResponseBody from Request
   * @param {ReadHoldingRegistersRequestBody} request
   * @param {Buffer} holdingRegisters
   * @returns ReadHoldingRegistersResponseBody
   */
  static fromRequest (requestBody, holdingRegisters) {
    let startByte = requestBody.start
    let endByte = requestBody.start + (requestBody.count * 2)

    let bufferSegment = holdingRegisters.slice(startByte, endByte)
    let buf = Buffer.from(bufferSegment)

    return new ReadHoldingRegistersResponseBody(buf.length, buf)
  }

  /** Create ReadHoldingRegistersResponseBody from Buffer
   * @param {Buffer} buffer
   * @returns ReadHoldingRegistersResponseBody
   */
  static fromBuffer (buffer) {
    let fc = buffer.readUInt8(0)
    let byteCount = buffer.readUInt8(1)
    let payload = buffer.slice(2, 2 + byteCount)

    debug("Read holding from buffer", buffer ,byteCount, payload)
    if (fc !== 0x03) {
      return null
    }

    let values = []
    for (let i = 0; i < byteCount; i += 2) {
      values.push(payload.readUInt16BE(i))
      debug("Adding value ", payload.readUInt16BE(i))
    }

    return new ReadHoldingRegistersResponseBody(byteCount, values)
  }

  constructor (byteCount, values) {
    super(0x03)
    this._byteCount = byteCount
    this._values = values

    if (values instanceof Array) {
      this._valuesAsArray = values
    }

    if (values instanceof Buffer) {
      this._valuesAsBuffer = values
    }
  }

  get byteCount () {
    return (this._values.length * 2) + 2
  }

  get values () {
    return this._values
  }

  get valuesAsArray () {
    return this._valuesAsArray
  }

  get valuesAsBuffer () {
    return this._valuesAsBuffer
  }

  get length () {
    return this._values.length
  }

  createPayload () {
    let payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    // Input registers are 16 bit
    payload.writeUInt8((this._values.length * 2), 1)
    this._values.forEach(function (value, i) {
      payload.writeUInt16BE(value, 2 + ( i * 2))
    })

    return payload
  }
}

module.exports = ReadHoldingRegistersResponseBody
