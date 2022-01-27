// Variables
var wss = null;
var connected = false;
var message = "";
var username = "";
var password = "";

// Class
class vapor {
	constructor(runtime) {
		this.runtime = runtime;
	};
	static get STATE_KEY() {
		return "Scratch.websockets";
	};
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
        opcode: "get_current_message",
        blockType: Scratch.BlockType.REPORTER,
        text: "current message",
      }],
    };
  };

  // Connect To Server - Command
  connect_to_server({url}) {
    wss = new WebSocket(url);
    wss.onopen = function() {
      connected = true;
      wss.send("new_conn");
    };
    wss.onmessage = function(event) {
      message = String(event.data);
    };
  };

  // Current Message - Reporter
  get_current_message() {
    return message;
  };

  // Send Message - Command
  send_message({msg}) {
    if (wss != null) {
      wss.send(String(msg));
    };
  };

  // Disconnect From Server - Command
  disconnect_from_server() {
    if (wss != null) {
      wss.send("close_conn")
      wss.close(1000);
      connected = false;
      message = "";
      username = "";
      password = "";
      wss = null;
    };
  };
};

// Register Extension
Scratch.extensions.register(new vapor());