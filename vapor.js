// Variables
var wss = null
var connected = 0
var message = ""
var username = ""
var password = ""
var new_message = 0

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
        opcode: "when_new_message",
        blockType: Scratch.BlockType.HAT,
        text: "when new message recieved",
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
      wss.send("new_conn")
    }
    wss.onmessage = function(event) {
      message = String(event.data)
      if (message == "conn_deny") {
        disconnect_from_server()
      } else if (message == "conn_accept") {
        connected = 1
        message = ""
      } else {
        new_message = 1
      }
    }
  }

  // When New Message Recieved - Hat
  when_new_message() {
    if (new_message == 1) {
      new_message = 0
      return true
    } else {
      return false
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
      wss.send("close_conn")
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