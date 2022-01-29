// Variables
var wss = null
var connected = 0
var message = ""
var username = ""
var password = ""

// Class
class vapor {
	constructor(runtime) {
		this.runtime = runtime
	}
	static get STATE_KEY() {
		return "Scratch.websockets"
	}
  getInfo() {
    return {
      id: "vapor",
      name: "vapor",
      blocks: [
      {
        opcode: "connect_to_server",
        blockType: Scratch.BlockType.COMMAND,
        text: "connect to server [url]",
        arguments: {
          url: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "ws://127.0.0.1:3000",
          },
        },
      }, {
        opcode: "send_message",
        blockType: Scratch.BlockType.COMMAND,
        text: "send message [msg]",
        arguments: {
          msg: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "apple",
          },
        },
      }, {
        opcode: "disconnect_from_server",
        blockType: Scratch.BlockType.COMMAND,
        text: "disconnect",
      }, {
        opcode: "connected_to_server",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "connected",
      }, {
        opcode: "get_url_data",
        blockType: Scratch.BlockType.REPORTER,
        text: "get data from url [url]",
        arguments: {
          url: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "https://satyrnsstuff.github.io/vapor/list.txt",
          },
        },
      }, {
        opcode: "get_current_message",
        blockType: Scratch.BlockType.REPORTER,
        text: "current message",
      }],
    }
  }

  // Connected - Boolean
  connected_to_server() {
    if (connected == 1) {
      return true
    } else {
      return false
    }
  }

  // Connect To Server - Command
  connect_to_server({url}) {
    wss = new WebSocket(url)
    wss.onopen = function() {
      wss.send("conn_new")
    }
    wss.onmessage = function(event) {
      message = String(event.data)
      if (message == "conn_deny") {
        disconnect_from_server()
      } else if (message == "conn_accept") {
        connected = 1
        message = ""
      }
    }
  }

  // Get Data From URL - Reporter
  get_url_data({url}) {
    return fetch(url).then(response => response.text())
  }

  // Current Message - Reporter
  get_current_message() {
    return message
  }

  // Send Message - Command
  send_message({msg}) {
    if (connected == 1) {
      wss.send(String(msg))
    }
  }

  // Disconnect From Server - Command
  disconnect_from_server() {
    if (connected == 1) {
      wss.send("conn_close")
      wss.close(1000)
      connected = 0
      message = ""
      username = ""
      password = ""
      wss = null
      new_message = 0
    }
  }
}

// Register Extension
Scratch.extensions.register(new vapor())