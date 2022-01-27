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
        opcode: "fetchURL",
        blockType: Scratch.BlockType.REPORTER,
        text: "fetch data from [url]",
        arguments: {
          url: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "https://api.weather.gov/stations/KNYC/observations",
            },
          },
        }
      ],
    }
  }
    
  fetchURL({url}) {
    return fetch(url).then(response => response.text())
  }

  jsonExtract({name,data}) {
    var parsed = JSON.parse(data)
    if (name in parsed) {
      var out = parsed[name]
      var t = typeof(out)
      if (t == "string" || t == "number")
        return out
      if (t == "boolean")
        return t ? 1 : 0
      return JSON.stringify(out)
    } else {
      return ""
    }
  }
}

Scratch.extensions.register(new vapor())