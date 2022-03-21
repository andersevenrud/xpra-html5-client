# xpra-html5-client

**This is a [work in progress](https://github.com/andersevenrud/xpra-html5-client/issues/3)**

![xpra-html5-client-react](https://user-images.githubusercontent.com/161548/157789860-dabe3617-52e3-4b8d-9fee-950f018f879b.png)

## About

A monorepo for a Xpra HTML client written in TypeScript.

Focuses on modularity and embedding. Based off the [official](https://github.com/Xpra-org/xpra-html5) client.

**[Live demo](https://andersevenrud.github.io/xpra-html5-client/ts/client/)**

**[Documentation](https://andersevenrud.github.io/xpra-html5-client/ts/docs/modules.html)**

## Setup

This project requires `node` and `yarn` and uses *git submodules*. Clone the repository with `--recursive` options.

To set up a complete development environment:

```bash
# Install dependencies
yarn install

# Build included dependencies
yarn workspace xpra-av build
yarn workspace xpra-jsmpeg build
yarn workspace xpra-broadway build
```

> The following commands runs in the foreground and have to be executed separately.

```bash
# Automatically rebuild the xpra library if changed
yarn workspace xpra-html5-client build --watch

# Start a development server for the UI
yarn workspace xpra-html5-client-react dev

# Start a nested X testing server
Xephyr -br -ac -noreset -screen 800x600 :10

# Start an xpra session on the new X server
xpra --no-daemon --bind-ws=127.0.0.1:10000 --start=xterm --html=off start :10
```

## Usage

> If you want to use a production version of the client, run `preview` instead of `dev`.

You can now use the client with the URL given in the `dev` (or `preview`) server command output.

To automatically connect to a target, use `http://localhost:port/?host=ws://ip:port&connect=true`.

You can also apply any option defined in [`XpraConnectionOptions`](https://andersevenrud.github.io/xpra-html5-client/ts/docs/interfaces/XpraConnectionOptions.html),
like `username` and `password`.

## Deployment

```bash
yarn install
yarn workspaces run build
```

Now copy the artifacts in `packages/ui/dist/` to your destination.

## Custom integration

You can build your own clients and user interfaces by using the shipped libraries.

Base application example:

> Assuming a bundler with loader support, i.e. Vite

```bash
npm install xpra-html5-client@^2
```

### `main.js`

```javascript
import XpraWorker from './worker?worker'
import { XpraClient, XpraWindowManager } from 'xpra-html5-client'

async function createXpraClient() {
  // Off-load data handling to a separate worker to increase performance.
  // This is not a requirement, but is highly recommended.
  const worker = new XpraWorker()
  const xpra = new XpraClient({ worker })

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

### `worker.js`

```javascript
import { XpraWebWorker } from 'xpra-html5-client'

new XpraWebWorker()
```

## License

Mozilla Public License Version 2.0

---

This repository is based on the official Xpra HTML5 client sources

> Copyright Copyright (C) 2016-2022 Antoine Martin <antoine@devloop.org.uk>
>
> Licensed under MPL 2.0, see: http://www.mozilla.org/MPL/2.0/
>
> https://github.com/Xpra-org/xpra-html5/blob/master/LICENSE

---

X11 Logo

> The X Window System is a trademark of The Open Group.
>
> Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
>
> https://creativecommons.org/licenses/by-sa/3.0/
