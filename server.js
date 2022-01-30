// imports
const fs = require("fs")
const uws = require("uWebSockets.js")
const _ = require("underscore")

// variables
const index_page = "index.html"
const port = 3000
var clients = []
var clients_acc = []

// convert an ArrayBuffer to a string
function ab2str (arraybuffer) {
	return Buffer.from(arraybuffer).toString("utf8")
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

// websocket
uws.App({}).ws("/*", {
  idleTimeout: 100,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  compression: uws.DEDICATED_COMPRESSOR_4KB,
  open: (ws) => {
    clients.push(ws)
    clients_acc.push("")
    console.log("new connection accepted")
  },
  message: (ws, message, isBinary) => {
    const msg = ab2str(message)
    const split_msg = msg.split(" ")

    /*
    anything beyond this point can be changed to fit your needs.
    
    functions implemented here:
    - ping (sends back "pong")
    - acc_reg <username> <password> (registers an account)
    - acc_login <username> <password> (logs into an account)
    
    this can be changed, removed, or more can be added if needed.
    */

    if (msg === "ping") {
      ws.send(str2ab("pong"), isBinary, true)
    } else if (split_msg[0] === "acc_reg") {
      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts")
      }
      const files = fs.readdirSync("accounts")
      const username = split_msg[1]
      if (files.includes(`${username}.txt`)) {
        ws.send(str2ab("acc_exist"), isBinary, true)
        console.log(`attempted to register already existing account ${username}`)
      } else {
        process.chdir("accounts")
        fs.writeFileSync(`${username}.txt`, split_msg[2])
        process.chdir("..")
        console.log(`new account ${username} registered`)
      }
    } else if (split_msg[0] === "acc_login") {
      if (!fs.existsSync("accounts")) {
        ws.send(str2ab("acc_not_exist"), isBinary, true)
      } else {
        const files = fs.readdirSync("accounts")
        const username = split_msg[1]
        if (!files.includes(`${username}.txt`)) {
          ws.send(str2ab("acc_not_exist"), isBinary, true)
        } else {
          process.chdir("accounts")
          const account_data = ab2str(b2ab(fs.readFileSync(`${username}.txt`)))
          process.chdir("..")
          if (!account_data.includes(split_msg[2])) {
            ws.send(str2ab("wrong_pass"), isBinary, true)
          } else {
            ws.send(str2ab(_.without(account_data.split("\n"), split_msg[2])), isBinary, true)
            clients_acc[clients.indexOf(ws)] = username
            console.log(`account ${username} logged in`)
          }
        }
      }
    } else {
      ws.send(str2ab("cmd_invalid"), isBinary, true)
    }
  },
  drain: (ws) => {
    console.log(`ws backpressure: ${ws.getBufferedAmount()}`);
  },
  close: (ws, code, message) => {
    clients_acc = _.without(clients_acc, clients_acc[clients.indexOf(ws)])
    clients = _.without(clients, ws)
    console.log("connection closed");
  }
}).get("/*", (res, req) => {
  res.writeStatus("200 OK").writeHeader("Content-Type", "text/html").end(b2ab(fs.readFileSync(index_page)))
}).listen(port, (listenSocket) => {
  if (listenSocket) {
    console.log(`vapor is now running at wss://0.0.0.0:${port}/`)
  }
})