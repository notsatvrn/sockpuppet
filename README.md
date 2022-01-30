# vapor
vapor is a simple websocket extension for Scratch 3.0.

## features
- connecting and disconnecting from a websocket server
- sending messages to a websocket server
- getting the contents of a URL

## how to use
### server (linux)
```
git clone https://github.com/satyrnsstuff/vapor.git
cd vapor/server
npm install git+https://github.com/uNetworking/uWebSockets.js.git#v20.6.0 underscore
node server.js
```

### extension
you can use one of these Scratch mods to install the extension:
- [adacraft](https://adacraft.org/studio)
- [TurboWarp](https://turbowarp.org/editor)
- [E羊icques](https://sheeptester.github.io/scratch-gui/)

add the extension using the URL `https://satyrnsstuff.github.io/vapor/ext.js`.

you can add a custom extension by clicking the addons button in the lower left corner, and clicking "Custom Extension".