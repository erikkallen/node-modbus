'use strict'

let debug = require('debug')('rtu-server-request-handler')
let RTURequest = require('./rtu-request.js')

class RTURequestHandler {
  constructor () {
    this._requests = []
    this._buffer = Buffer.alloc(0)
  }

  shift () {
    return this._requests.shift()
  }

  handle (data) {
    this._buffer = Buffer.concat([this._buffer, data])
    debug('this._buffer', this._buffer)

    do {
      let request = RTURequest.fromBuffer(this._buffer)
      debug('request from buffer', request)

      if (!request) {
        return
      }
      debug('request', request.byteCount)
      this._requests.unshift(request)
      this._buffer = this._buffer.slice(request.byteCount)
      
    } while (1)
  }
}

module.exports = RTURequestHandler
