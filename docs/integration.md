# Custom integration

You can build your own clients and user interfaces by using the shipped libraries.

## Installation

> Assuming a bundler with loader support, i.e. Vite

```bash
npm install xpra-html5-client@latest
```

## Example

Basic starter example:

### `main.js`

```javascript
import XpraPacketWorker from './worker?worker'
import XpraDecodeWorker from './decoder?worker'
import { XpraClient, XpraWindowManager } from 'xpra-html5-client'

async function createXpraClient() {
  // Off-load data handling to a separate worker to increase performance.
  // This is not a requirement, but is highly recommended.
  const worker = new XpraPacketWorker()
  const decoder = new XpraDecodeWorker()

  const xpra = new XpraClient({ worker, decoder })

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
import { XpraPacketWebWorker } from 'xpra-html5-client'

new XpraPacketWebWorker()
```

### `decoder.js`

```javascript
import { XpraDecodeWebWorker } from 'xpra-html5-client'

new XpraDecodeWebWorker()
```
