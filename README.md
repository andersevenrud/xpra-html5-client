# xpra-html5-client

This is the monorepo for the unofficial typescript Xpra HTML5 client.

Focuses on modularity, embedding, general improvements and is based off the
[official](https://github.com/Xpra-org/xpra-html5) client.

**[Live demo](https://andersevenrud.github.io/xpra-html5-client/ts/client/)**

**[Documentation](https://andersevenrud.github.io/xpra-html5-client/ts/docs/)**

![xpra-html5-client-react](https://user-images.githubusercontent.com/161548/157789860-dabe3617-52e3-4b8d-9fee-950f018f879b.png)

## Notes

This is a work in progress and some features are not fully implemented or not fully tested.

Please note that **rendering is a bit broken** at this moment because the rendering module
is being reworked and some procedures does not work optimally.

[Old version of this project](https://github.com/andersevenrud/xpra-html5-client/tree/legacy)

## Setup

This project requires `node` and `yarn`.

Run `yarn install` to install all required dependencies.

### Library

Run `yarn workspace xpra-html5-client build` to build the Xpra client library.

### UI

After building the Xpra client library you can set up the included user interface.

#### Running

First, run `uarn workspace xpra-html5-client-react build` to build the application.

Run `yarn workspace xpra-html5-client-react preview` to start a production server.

To automatically connect to a target, use `http://localhost:port/?host=ws://ip:port&connect=true`.

You can also apply any option defined in [`XpraConnectionOptions`](https://andersevenrud.github.io/xpra-html5-client/ts/docs/interfaces/XpraConnectionOptions.html),
like `username` and `password`.

#### Deployment

Run `yarn workspace xpra-html5-client-react build` and copy the artifacts in `packages/ui/dist/` to your destination.

#### Development

Run `yarn workspace xpra-html5-client-react dev` to start a development server.

To set up a X11 environment for testing purposes:

```bash
# Start a nested X server
Xephyr -br -ac -noreset -screen 800x600 :10

# Start an xpra session on the new X server
xpra --no-daemon --bind-ws=127.0.0.1:10000 --start=xterm --html=off start :10
```

## Custom integration

You can build your own clients and user interfaces by using the shipped libraries.

Base application example:

> Assuming a bundler with loader support, i.e. Vite

```bash
npm install xpra-html5-client@^2
```

### `main.ts`

```javascript
import XpraWorker from './worker?worker'
import { XpraClient, XpraWindowManager } from 'xpra-html5-client'

async function createXpraClient() {
  const worker = new XpraWorker()
  const xpra = new XpraClient(worker)

  // Set up internals
  await xpra.init()

  // Set up events
  // Refer to documentation of `XpraClientEventEmitters` for all events
  xpra.on('connect', () => console.log('connected to host'))
  xpra.on('disconnect', () => console.warn('disconnected from host'))
  xpra.on('error', (message) => console.error('connection error', message))
  xpra.on('sessionStarted', () => console.info('session has been started'))

  return xpra
}

async function main() {
  const xpra = await createXpraClient()

  // Window Manager abstraction for custom UIs
  // See included React example for usage
  const wm = new XpraWindowManager(xpra)
  wm.init()

  // Finally establish a connection
  xpra.connect('ws://localhost:10000', {
    username: 'user',
    password: 'pass',
  })
}

document.addEventListener('DOMContentLoaded', () => main())
```

### `worker.ts`

```javascript
import { createXpraWebWorker } from 'xpra-html5-client'
createXpraWebWorker()
```

## TODO

* Xpra library
  * [x] Connectivity
  * [x] Authentication
  * [ ] Encryption (**WIP**)
  * [x] Capability detection
  * [x] Packet decoding and proxying
  * [x] Error handling
  * [x] Window handlers
  * [x] Cursor handlers
  * [x] Sound handlers
  * [x] Keyboard handlers
  * [x] Mouse handlers
  * [x] Notifications
  * [x] Clipboard
  * [x] Download/Upload
  * [x] Print
  * [x] Remote logging
  * [x] Bell
  * [x] Tray
  * [x] Webworker
  * Rendering support
    * [x] Direct rendering
    * [ ] Offscreen canvas
    * Formats
      * [x] PNG/JPEG/WebP
      * [x] RGB32/RGB24
      * [x] AVIF
      * [ ] MPEG1
      * [ ] MPEG4
      * [ ] h264
      * [ ] VP8
      * [x] Void
      * [x] Scroll
* UI
  * [ ] On-screen keyboard
  * [ ] Client-side scaling
  * [ ] Suspend/resume windows
  * [ ] Fullscreen windows
  * [ ] Desktop class back layers
  * [x] Connection options via URL query
  * [x] Connection settings modal
  * [x] Window management
  * [x] Window interaction
  * [x] Cursor support
  * [x] XDG Menu
  * [x] Tray

## License

Mozilla Public License Version 2.0

This repository is based on the official Xpra HTML5 client sources
> Copyright Copyright (C) 2016-2022 Antoine Martin <antoine@devloop.org.uk>
> Licensed under MPL 2.0, see: http://www.mozilla.org/MPL/2.0/
> https://github.com/Xpra-org/xpra-html5/blob/master/LICENSE
