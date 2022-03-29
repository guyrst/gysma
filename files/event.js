//
// Event emetter that is used for inter modules communication
//
const { EventEmitter } = require('events')
const Emitter = new EventEmitter();
module.exports = Emitter;
