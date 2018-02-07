'use strict'

let debug = require('debug')('modbus rtu server')
let EventEmitter = require('events')
let ModbusRTUClient = require('./rtu-server-client.js')

class ModbusRTUServer extends EventEmitter {
  constructor (server, options) {
    super()
    debug("test")
    this._server = server
    this._options = options || {}

    this._coils = this._options.coils || Buffer.alloc(1024)
    this._discrete = this._options.discrete || Buffer.alloc(1024)
    this._holding = this._options.holding || Buffer.alloc(1024)
    this._input = this._options.input || Buffer.alloc(1024)

    server.on('open', this._onConnection.bind(this))
  }

  _onConnection (socket) {
    debug('new connection coming in')
    let client = new ModbusRTUClient(this, socket)

    this.emit('connection', client)
  }

  get coils () {
    return this._coils
  }

  get discrete () {
    return this._discrete
  }

  get holding () {
    return this._holding
  }

  get input () {
    return this._input
  }
}

module.exports = ModbusRTUServer
