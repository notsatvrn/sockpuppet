// Variables which will be used.
let wss = null
let connected = false
let message = ""
let username = ""
let password = ""

// The main class.
class sockpuppet {
    constructor(runtime) {
        this.runtime = runtime;
    }

    static get STATE_KEY() {
        return "Scratch.websockets";
    }

    getInfo() {
        return {
            id: "sockpuppet",
            name: "sockpuppet",
            blocks: [
                {
                    opcode: "connectToServer",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Connect To Server [url]",
                    arguments: {
                        url: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "ws://127.0.0.1:3000",
                        },
                    },
                }, {
                    opcode: "sendMessage",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Send Message [msg]",
                    arguments: {
                        msg: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "apple",
                        },
                    },
                }, {
                    opcode: "disconnectFromServer",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Disconnect From Server",
                }, {
                    opcode: "connectedToServer",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "Connected To Server?",
                }, {
                    opcode: "getDataFromURL",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Data From URL [url]",
                    arguments: {
                        url: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "https://notsatvrn.github.io/sockpuppet/helloworld.txt",
                        },
                    },
                }, {
                    opcode: "getCurrentMessage",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Current Message",
                }
            ],
        }
    }
    
    // Connected To Server (boolean)
    connectedToServer() {
        return connected;
    }

    // Connect To Server (command)
    connectToServer({url}) {
        wss = new WebSocket(url);

        wss.onopen = function() {
            connected = 1;
        };

        wss.onmessage = function(event) {
            message = String(event.data);
        };
    }

    // Data From URL (reporter)
    getDataFromURL({url}) {
        return fetch(url).then(response => response.text());
    }

    // Current Message (reporter)
    getCurrentMessage() {
        return message;
    }

    // Send Message (command)
    sendMessage({msg}) {
        if (connected) {
            wss.send(String(msg));
        };
    }

    // Disconnect From Server (command)
    disconnectFromServer() {
        if (connected) {
            wss.close(1000);
            connected = false;
            message = "";
            username = "";
            password = "";
            wss = null;
            new_message = 0;
        };
    }
}

// Register the extension.
Scratch.extensions.register(new sockpuppet())
