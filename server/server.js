/*
this is a vapor server.
it's really just a simple websocket/https server.
you may change anything in here to your liking.

dependencies:
- uWebSockets.js
- Underscore

optional dependencies (for index page):
- Pug
- Handlebars

if you would like to help add support for EJS or Mustache, please open a PR.
*/

// imports
const fs = require("fs")
const uws = require("uWebSockets.js")
const _ = require("underscore")

// settings
const index_page = "./server/index.html"
const port = 3000

// variables
var clients = []
var clients_acc = []
var index_contents = ""
const index_ext = index_page.slice(index_page.length - 4)
var pug = null
var hbs = null

// convert to arraybuffer - credit: jhiesey + dy
function to_ab(data) {
  if (data instanceof Uint8Array) {
    if (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
      return data.buffer
    }
    else if (typeof data.buffer.slice === "function") {
      return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    }
  } else {
    const len = data.length
    var array = new Uint8Array(len)
    if (typeof data === "string") {
      for (var i = 0; i < len; i++) {
        array[i] = data.charCodeAt(i)
      }
    } else {
      for (var i = 0; i < len; i++) {
        array[i] = data[i]
      }
    }
    return array.buffer
  }
}

// import pug/handlebars plugins if needed
switch (index_ext) {
  case ".pug":
    pug = require("pug")
    break
  case ".hbs":
    hbs = require("handlebars")
    break
}

// get index page contents - supports pug/handlebars
function get_index_contents() {
  switch (index_ext) {
    case ".pug":
      index_contents = pug.compileFile(index_page)
      index_contents = index_contents({})
      break
    case ".hbs":
      index_contents = hbs.compile(fs.readFileSync(index_page).toString())
      index_contents = index_contents({})
      break
    case "html":
      index_contents = fs.readFileSync(index_page)
      break
    default:
      index_contents = "invalid index page type used"
  }
  return to_ab(index_contents)
}

// websocket
uws.App({}).ws("/*", {
  idleTimeout: 100,
  maxBackpressure: 1024,
  maxPayloadLength: 1024,
  compression: uws.DEDICATED_COMPRESSOR_4KB,
  open: (ws) => {
    clients.push(ws)
    clients_acc.push("")
    console.log("new connection accepted")
  },
  message: (ws, message, isBinary) => {
    const msg = Buffer.from(message).toString()
    const split_msg = msg.split(" ")
    if (msg === "ping") {
      ws.send(to_ab("pong"), isBinary, true)
    } else if (split_msg[0] === "acc_reg") {
      if (!fs.existsSync("accounts")) { fs.mkdirSync("accounts") }
      const files = fs.readdirSync("accounts")
      const username = split_msg[1]
      if (files.includes(`${username}.txt`)) {
        ws.send(to_ab("acc_exist"), isBinary, true)
        console.log(`attempted to register already existing account ${username}`)
      } else {
        process.chdir("accounts")
        fs.writeFileSync(`${username}.txt`, split_msg[2])
        process.chdir("..")
        console.log(`new account ${username} registered`)
      }
    } else if (split_msg[0] === "acc_login") {
      const username = split_msg[1]
      if (!fs.existsSync("accounts")) {
        ws.send(to_ab("acc_not_exist"), isBinary, true)
        console.log(`nonexistent account ${username} attempted to log in`)
      } else {
        const files = fs.readdirSync("accounts")
        const username = split_msg[1]
        if (!files.includes(`${username}.txt`)) {
          ws.send(to_ab("acc_not_exist"), isBinary, true)
          console.log(`nonexistent account ${username} attempted to log in`)
        } else {
          process.chdir("accounts")
          const account_data = fs.readFileSync(`${username}.txt`).toString()
          process.chdir("..")
          if (!account_data.includes(split_msg[2])) {
            ws.send(to_ab("wrong_pass"), isBinary, true)
            console.log(`account ${username} attempted to log in with incorrect password`)
          } else {
            ws.send(to_ab(_.without(account_data.split("\n"), split_msg[2])), isBinary, true)
            clients_acc[clients.indexOf(ws)] = username
            console.log(`account ${username} logged in`)
          }
        }
      }
    } else {
      ws.send(to_ab("msg_invalid"), isBinary, true)
      console.log("invalid message recieved")
    }
  },
  drain: (ws) => { console.log(`websocket backpressure: ${ws.getBufferedAmount()}`) },
  close: (ws, code, message) => {
    clients_acc = _.without(clients_acc, clients_acc[clients.indexOf(ws)])
    clients = _.without(clients, ws)
    console.log("connection closed")
  },
}).get("/", (res, req) => {
  res.writeStatus("200 OK").writeHeader("Content-Type", "text/html").end(get_index_contents())
}).listen(port, (listenSocket) => {
  if (listenSocket) { console.log(`vapor is now running at wss://0.0.0.0:${port}/`) }
})