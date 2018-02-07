'use strict'

let debug = require('debug')('modbus rtu client socket')
let RequestHandler = require('./rtu-server-request-handler.js')
let ResponseHandler = require('./rtu-server-response-handler.js')

class ModbusRTUClient {
  constructor (server, socket) {
    this._server = server
    this._socket = socket

    this._requestHandler = new RequestHandler()
    this._responseHandler = new ResponseHandler(this._server)

    debug(server._server)
    
    this._server._server.on('data', this._onData.bind(this))
  }

  get socket () {
    return this._socket
  }

  get server () {
    return this._server
  }

  _onData (data) {
    debug('new data coming in')
    this._requestHandler.handle(data)
    debug('done handling')
    do {
      let request = this._requestHandler.shift()

      if (!request) {
        debug('no request to process')
        /* TODO: close client connection */
        break
      }

      this._responseHandler.handle(request, function (response) {
        this._server._server.write(response, function () {
          debug('response flushed')
        })
      }.bind(this))
    } while (1)
  }
}

module.exports = ModbusRTUClient
