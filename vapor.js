var wss = null;

class vapor {
  constructor(runtime, extensionId) {
    this.runtime = runtime;
  }
	static get STATE_KEY() {
		return 'Scratch.websockets';
	}
  getInfo() {
    return {
      id: "vapor",
      name: "Vapor",
      blocks: [
      {
        opcode: "connectToServer",
        blockType: Scratch.BlockType.COMMAND,
        text: "connect to server [url]",
        arguments: {
          url: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "ws://127.0.0.1:3000",
            },
          },
        }
      ],
    }
  }
    
  connectToServer({url}) {
    wss = new WebSocket(url)
    wss.onopen = function(e) {
      wss.send("new connection")
    }
  }
}

Scratch.extensions.register(new vapor())