// Variables
var wss = null;
var connected = false;
var message = "";
var username = "";
var password = "";
var new_message = false;
var decode_i = 1;
var decoded_line = "";
var current_char = 1;
var data_len = 1;
const chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, " ", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "-", "_", "=", "+", "|", "\\", "/", "?", ".", ",", ">", "<", "{", "}", "]", "[", ";", ":", ")", "(", "*", "&", "^", "%", "$", "#", "@", "!", "~", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

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
        opcode: "decode_list_line",
        blockType: Scratch.BlockType.REPORTER,
        text: "decoded line [line] from encoded data [data]",
        arguments: {
          line: {
            type: Scratch.ArgumentType.NUMBER,
            defaultValue: 1,
          },
          data: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "019901",
          },
        },
      }, {
        opcode: "get_current_message",
        blockType: Scratch.BlockType.REPORTER,
        text: "current message",
      }],
    };
  };

  // Decode Line ___ From Encoded Data ___ - Reporter 
  decode_list_line({line, data}) {
    decoded_line = "";
    split_data = data.split("99");
    data_len = split_data[line-1].length / 2;
    for (decode_i = 0; decode_i < data_len; decode_i++) {
      current_char = split_data[line-1].charAt(decode_i*2) + split_data[line-1].charAt((decode_i*2) + 1);
      decoded_line += chars[current_char];
    };
    return decoded_line;
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
      new_message = true;
    };
  };

  // When New Message Recieved - Hat
  when_new_message() {
    if (Boolean(new_message)) {
      new_message = false;
      return true;
    } else {
      return false;
    }
  };

  // Get Data From URL - Reporter
  get_url_data({url}) {
    return fetch(url).then(response => response.text());
  };

  // Current Message - Reporter
  get_current_message() {
    return message;
  };

  // Send Message - Command
  send_message({msg}) {
    if (wss != null && Boolean(connected)) {
      wss.send(String(msg));
    };
  };

  // Disconnect From Server - Command
  disconnect_from_server() {
    if (Boolean(connected)) {
      wss.send("close_conn")
      wss.close(1000);
      connected = false;
      message = "";
      username = "";
      password = "";
      wss = null;
      new_message = false;
    };
  };
};

// Register Extension
Scratch.extensions.register(new vapor());