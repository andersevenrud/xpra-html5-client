/* !
 * Xpra HTML Client
 *
 * This is a refactored (modernized) version of
 * https://xpra.org/trac/browser/xpra/trunk/src/html5/
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @preserve
 */

import './index.css';
import {createClient} from '../index.js';
import {h, app} from 'hyperapp';

const LOCALSTRAGE_KEY = 'XpraClient';

/*
 * Attaches all required event listeners
 */
const addEventListeners = client => {
  const names = [
    'keydown', 'keyup', 'keypress',
    'mousemove', 'mousedown', 'mouseup',
    'wheel', 'mousewheel', 'DOMMouseScroll'
  ];

  names.forEach(name => window.addEventListener(name, client.inject));

  window.addEventListener('resize', () => client.screen.resize(window.innerWidth, window.innerHeight));
};

const loadLocalSettings = () => JSON.parse(localStorage.getItem(LOCALSTRAGE_KEY));
const saveLocalSettings = settings => settings === null
  ? localStorage.removeItem(LOCALSTRAGE_KEY)
  : localStorage.setItem(LOCALSTRAGE_KEY, JSON.stringify(settings));

const createConnectionView = client => (state, actions) => {
  const setOption = (name, value) => actions.setOption({name, value});

  const createInput = (type, name, placeholder) => h('input', {
    type,
    placeholder,
    value: state.options[name] || '',
    oninput: ev => setOption(name, ev.target.value)
  });

  const createCheckbox =  (name, label) => h('label', {}, [
    h('input', {
      type: 'checkbox',
      checked: state.options[name],
      onchange: ev => setOption(name, !state.options[name])
    }),
    h('span', {}, label)
  ]);

  return h('div', {class: ''}, [
    h('div', {class: 'dialog'}, [
      h('div', {class: 'dialog--header'}, [
        h('h1', {}, 'Xpra HTML5 Client')
      ]),
      h('div', {class: 'dialog--content'}, [
        h('div', {class: 'dialog--row'}, [
          createInput('text', 'hostname', 'Hostname'),
          createInput('number', 'port', 'Port')
        ]),
        h('div', {class: 'dialog--row'}, [
          createInput('text', 'username', 'Username'),
          createInput('password', 'password', 'Password')
        ]),
        h('div', {class: 'dialog--row'}, [
          createCheckbox('sound', 'Enable sound')
        ]),
        h('div', {class: 'dialog--row'}, [
          createCheckbox('ssl', 'Enable SSL')
        ])
      ]),
      h('div', {class: 'dialog--footer'}, [
        h('button', {
          type: 'button', onclick: () => actions.connect()
        }, 'Connect')
      ])
    ])
  ]);
};

const createDesktopView = client => (state, actions) => {
  const windows = state.windows.map(surface => {
    const props = {
      key: surface.wid,
      class: 'window',
      style: {
        top: `${surface.y}px`,
        left: `${surface.x}px`
      },
      onmousedown: () => client.surface.focus(surface.wid),
      onmousemove: () => client.surface.focus(surface.wid),
    };

    const overlays = surface.overlays.map(overlay => h('div', {
      class: 'window--overlay',
      style: {
        top: `${overlay.y - surface.y}px`,
        left: `${overlay.x - surface.x}px`
      },
      oncreate: el => el.appendChild(overlay.canvas)
    }));

    return h('div', props, [
      h('div', {class: 'window--top'}, [
        h('div', {class: 'window--top--icon'}, [
          h('img', {src: surface.icon || 'logo.png'})
        ]),
        h('div', {class: 'window--top--title'}, [
          surface.metadata.title || '(window)'
        ]),
        h('div', {class: 'window--top--buttons'}, [
          h('div', {
            class: 'window--top--buttons__close',
            onclick: () => client.surface.kill(surface.wid)
          }, h('i', {class: 'fa fa-times-circle'}))
        ])
      ]),
      h('div', {
        class: 'window--content',
        style: {
          width: `${surface.w}px`,
          height: `${surface.h}px`
        }
      }, [
        h('div', {
          class:  'window--canvas',
          oncreate: el => el.appendChild(surface.canvas)
        }),
        ...overlays
      ])
    ]);
  });

  return h('div', {class: 'screen'}, [
    h('div', {class: 'status'}, [
      h('span', {class: 'status--text'}, [
        h('i', {class: 'fa fa-' + (state.status === 'connected' ? 'link' : 'unlink')}),
        state.status
      ]),
      h('span', {class: 'status--button', onclick: () => actions.disconnect(true)}, [
        h('i', {class: 'fa fa-unlink'}),
        'Disconnect'
      ])
    ]),
    ...windows
  ]);
};

/*
 * Renders our content
 */
const createView = client => (state, actions) => state.status === 'disconnected'
  ? createConnectionView(client)(state, actions)
  : createDesktopView(client)(state, actions);

/*
 * Craetes a reactive application
 */
const createApplication = client => app({
  status: 'disconnected',
  options: {
    hostname: 'localhost',
    port: 10000,
    ssl: window.location.protocol === 'https:',
    sound: true,
    username: '',
    password: '',
  },
  windows: []
}, {
  _updateWindow: ([wid, cb]) => state => {
    const found = state.windows.find(win => win.wid === wid);
    if (found) {
      cb(found);
    }

    return {windows: state.windows};
  },

  connect: () => state => {
    const uri = [
      state.options.ssl ? 'wss' : 'ws',
      '://',
      state.options.hostname,
      ':',
      state.options.port
    ].join('');

    const options = {
      uri,
      sound: state.options.sound,
      username: state.options.username,
      password: state.options.password
    };

    saveLocalSettings(options);

    client.connect(options);
  },

  disconnect: (clear) => () => {
    client.disconnect();

    if (clear === true) {
      saveLocalSettings(null);
    }
  },

  setOption: ({name, value}) => state => ({
    options: Object.assign({}, state.options, {[name]: value})
  }),

  setOptions: options => state => ({
    options: Object.assign({}, state.options, options)
  }),

  setStatus: status => () => ({status}),

  addWindow: win => state => ({
    windows: [...state.windows, Object.assign({
      icon: null,
      overlays: []
    }, win)]
  }),

  removeWindow: ({wid}) => state => {
    const windows = state.windows;
    const foundIndex = windows.findIndex(win => win.wid === wid);
    if (foundIndex !== -1) {
      windows.splice(foundIndex, 1);
    }

    return {windows};
  },

  updateWindowIcon: ({wid, src}) => (state, actions) =>
    actions._updateWindow([wid, found => {
      found.icon = src;
    }]),

  updateWindowMetadata: ({wid, metadata}) => (state, actions) =>
    actions._updateWindow([wid, found => {
      found.metadata = Object.assign({}, found.metadata, metadata);
    }]),

  addWindowOverlay: ({wid, parent, canvas, x, y}) => (state, actions) =>
    actions._updateWindow([parent.wid, found => {
      found.overlays.push({wid, canvas, x, y});
    }]),

  removeWindowOverlay: ({wid, parent}) => (state, actions) =>
    actions._updateWindow([parent.wid, found => {
      const foundIndex = found.overlays.findIndex(surface => surface.wid === wid);
      if (foundIndex !== -1) {
        found.overlays.splice(foundIndex, 1);
      }
    }])
}, createView(client), document.body);

/*
 * Launch Xpra Client
 */
document.addEventListener('DOMContentLoaded', () => {
  const client = createClient({
    uri: 'ws://localhost:10000'
  });

  addEventListeners(client);

  const hyperapp = createApplication(client);
  client.on('window:create', hyperapp.addWindow);
  client.on('window:destroy', hyperapp.removeWindow);
  client.on('window:icon', hyperapp.updateWindowIcon);
  client.on('window:metadata', hyperapp.updateWindowMetadata);
  client.on('overlay:create', hyperapp.addWindowOverlay);
  client.on('overlay:destroy', hyperapp.removeWindowOverlay);
  client.on('ws:status', hyperapp.setStatus);

  const restored = loadLocalSettings();
  if (restored) {
    hyperapp.setOptions(restored);
    hyperapp.connect();
  }
});
