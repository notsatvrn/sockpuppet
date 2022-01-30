// imports
const fs = require("fs")
const uws = require("uWebSockets.js")
const _ = require("underscore")

// variables
const index_page = "index.html"
const port = 3000
var clients = []
var clients_acc = []
const blocked_ips = ab2str(b2ab(fs.readFileSync("block.txt"))).split("\n")

// convert an ArrayBuffer to a string
function ab2str (arraybuffer, encoding) {
	if (encoding == null) encoding = 'utf8'
	return Buffer.from(arraybuffer).toString(encoding)
}

// convert a string to an ArrayBuffer
function str2ab (str) {
  const len = str.length
	var array = new Uint8Array(len)
	for(var i = 0; i < len; i++) {
		array[i] = str.charCodeAt(i)
	}
	return array.buffer
}

// convert a buffer to an ArrayBuffer
function b2ab (buf) {
  const len = buf.length
	var array = new Uint8Array(len)
	for (var i = 0; i < len; i++) {
		array[i] = buf[i]
	}
	return array.buffer
}

// websocket stuff
uws.App({}).ws("/*", {
  idleTimeout: 100,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: uws.DEDICATED_COMPRESSOR_4KB,
  message: (ws, message, isBinary) => {
    const str_msg = ab2str(message)
    const ip = ab2str(ws.getRemoteAddressAsText())
    if (str_msg === "conn_new") {
      if (blocked_ips.includes(ip)) {
        ws.send(str2ab("conn_deny"), isBinary, true)
        console.log(`new connection denied | origin: ${ip}`)
      } else {
        ws.send(str2ab("conn_accept"), isBinary, true)
        console.log(`new connection accepted | origin: ${ip}`)
        clients.push(ws)
      }
    } else if (str_msg === "ping") {
      ws.send(str2ab("pong"), isBinary, true)
    }
  },
  close: (ws, code, message) => {
    clients = _.without(clients, ws)
    console.log('WebSocket closed');
  }
}).get('/*', (res, req) => {
  res.writeStatus('200 OK').writeHeader("Content-Type", "text/html").end(b2ab(fs.readFileSync(index_page)))
}).listen(port, (listenSocket) => {
  if (listenSocket) {
    console.log(`vapor is now running at wss://0.0.0.0:${port}/`)
  }
})