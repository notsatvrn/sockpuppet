var wss = null;
var connected = false;
var new_message = false;
var message = "";
var username = ""

class vapor {
  constructor(runtime, extensionId) {
    this.runtime = runtime;
  };
	static get STATE_KEY() {
		return "Scratch.websockets";
	};
  getInfo() {
    return {
      id: "vapor",
      name: "Vapor",
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
        opcode: "get_current_message",
        blockType: Scratch.BlockType.REPORTER,
        text: "current message",
      }, {
        opcode: "new_message_recieved",
        blockType: Scratch.BlockType.HAT,
        text: "when new message received",
      }],
    }
  };
    
  connect_to_server({url}) {
    wss = new WebSocket(url);
    wss.onopen = function() {
      connected = true;
      wss.send("new connection");
    };
    wss.onmessage = function(event) {
      message = String(event.data);
      new_message = true;
    };
  };

  get_current_message() {
    return message;
  };

  new_message_received() {
    if (new_message) {
      new_message = false;
      return true;
    } else {
      return false;
    };
  };
};

Scratch.extensions.register(new vapor());