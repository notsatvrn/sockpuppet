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
};

Scratch.extensions.register(new vapor());