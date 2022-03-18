# Aurora (AV)

Brief instructions on how to build a custom Aurora library.

## Setup

1. Create a new project directory somewhere
2. Do the bootstrap
3. Create required files
4. Apply patches
5. `npx rullup --config`

You now have ESM modules in `dist/`.

## Bootstrap

```bash
mkdir src
npm init
npm install -D
  @babel/core \
  @babel/preset-env \
  @rollup/plugin-babel \
  @rollup/plugin-commonjs \
  @rollup/plugin-node-resolve \
  @rollup/plugin-alias \
  rollup-plugin-coffee-script \
  rollup-plugin-node-polyfills \
  rollup-plugin-terser \
  rollup

git clone https://github.com/audiocogs/aurora.js.git src/aurora.js
git clone https://github.com/audiocogs/mp3.js.git src/mp3.js
git clone https://github.com/audiocogs/aac.js.git src/aac.js
git clone https://github.com/audiocogs/flac.js.git src/flac.js
```

## Files

### `rollup.config.js`

```javascript
import coffeescript from "rollup-plugin-coffee-script";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-node-polyfills";
import alias from "@rollup/plugin-alias";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/av.esm.js',
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    coffeescript(),
    alias({
      entries: [
        {
          find: "av",
          replacement: "./src/av.js",
        },
      ],
    }),
    nodePolyfills(),
    nodeResolve({
      extensions: [".js", ".coffee"],
      preferBuiltins: false,
    }),
    commonjs({
      extensions: [".js", ".coffee"],
      requireReturnsDefault: "auto",
    }),
    babel({
      babelHelpers: "bundled",
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              esmodules: true,
            },
          },
        ],
      ],
    }),
    terser(),
  ],
}
```

### `src/index.js`

```javascript
import AV from './av'

import './mp3.js/src/decoder.js'
import './aac.js/src/decoder.js'
import './flac.js/src/decoder.js'
import './xpra'

export default AV
```

### `src/av.js`

```javascript
import av from './aurora.js/browser.coffee'

export default av
```

### `src/xpra.js`

```javascript
// based on aurora-websocket.js https://github.com/fsbdev/aurora-websocket
// MIT licensed
import AV from './av'

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AV.XpraSource = (function(_super) {
    __extends(XpraSource, _super);

    function XpraSource() {
      // constructor
    }

    XpraSource.prototype.start = function() {
      return true;
    };

    XpraSource.prototype.pause = function() {
      return true;
    };

    XpraSource.prototype.reset = function() {
      return true;
    };

    XpraSource.prototype._on_data = function(data) {
      var buf = new AV.Buffer(data);
      return this.emit('data', buf);
    };

    return XpraSource;

  })(AV.EventEmitter);

  AV.Asset.fromXpraSource = function() {
    var source;
    source = new AV.XpraSource();
    return new AV.Asset(source);
  };

  AV.Player.fromXpraSource = function() {
    var asset;
    asset = AV.Asset.fromXpraSource();
    return new AV.Player(asset);
  };

}).call(this);
```

## Patches

### `src/aurora.js`

```patch
diff --git a/src/asset.coffee b/src/asset.coffee
index 2c14090..485ecd2 100644
--- a/src/asset.coffee
+++ b/src/asset.coffee
@@ -15,6 +15,7 @@ Decoder      = require './decoder'
 
 class Asset extends EventEmitter
     constructor: (@source) ->
+        super()
         @buffered = 0
         @duration = null
         @format = null
diff --git a/src/core/underflow.coffee b/src/core/underflow.coffee
index dd99c10..54e5305 100644
--- a/src/core/underflow.coffee
+++ b/src/core/underflow.coffee
@@ -1,7 +1,7 @@
 # define an error class to be thrown if an underflow occurs
 class UnderflowError extends Error
     constructor: ->
-        super
+        super()
         @name = 'UnderflowError'
         @stack = new Error().stack
 
diff --git a/src/decoder.coffee b/src/decoder.coffee
index df63ccb..16479d4 100644
--- a/src/decoder.coffee
+++ b/src/decoder.coffee
@@ -6,6 +6,7 @@ UnderflowError = require './core/underflow'
 
 class Decoder extends EventEmitter
     constructor: (@demuxer, @format) ->
+        super()
         list = new BufferList
         @stream = new Stream(list)
         @bitstream = new Bitstream(@stream)
diff --git a/src/demuxer.coffee b/src/demuxer.coffee
index afc6ac6..2e49207 100644
--- a/src/demuxer.coffee
+++ b/src/demuxer.coffee
@@ -7,6 +7,7 @@ class Demuxer extends EventEmitter
         return false
     
     constructor: (source, chunk) ->
+        super()
         list = new BufferList
         list.append chunk
         @stream = new Stream(list)
diff --git a/src/device.coffee b/src/device.coffee
index e1b159e..c5b83ea 100644
--- a/src/device.coffee
+++ b/src/device.coffee
@@ -8,6 +8,7 @@ EventEmitter = require './core/events'
 
 class AudioDevice extends EventEmitter
     constructor: (@sampleRate, @channels) ->
+        super()
         @playing = false
         @currentTime = 0
         @_lastTime = 0
diff --git a/src/devices/mozilla.coffee b/src/devices/mozilla.coffee
index 98aca1e..da086bd 100644
--- a/src/devices/mozilla.coffee
+++ b/src/devices/mozilla.coffee
@@ -9,6 +9,7 @@ class MozillaAudioDevice extends EventEmitter
     @supported: Audio? and 'mozWriteAudio' of new Audio
     
     constructor: (@sampleRate, @channels) ->        
+        super()
         @audio = new Audio
         @audio.mozSetup(@channels, @sampleRate)
         
@@ -65,4 +66,4 @@ class MozillaAudioDevice extends EventEmitter
             timer.terminate()
             URL.revokeObjectURL(timer.url)
         else
-            clearInterval timer
\ No newline at end of file
+            clearInterval timer
diff --git a/src/devices/webaudio.coffee b/src/devices/webaudio.coffee
index 2b7e4ea..b3c4fb2 100644
--- a/src/devices/webaudio.coffee
+++ b/src/devices/webaudio.coffee
@@ -16,6 +16,7 @@ class WebAudioDevice extends EventEmitter
     sharedContext = null
     
     constructor: (@sampleRate, @channels) ->
+        super()
         @context = sharedContext ?= new AudioContext
         @deviceSampleRate = @context.sampleRate
         
@@ -59,4 +60,4 @@ class WebAudioDevice extends EventEmitter
         @node.disconnect(0)
         
     getDeviceTime: ->
-        return @context.currentTime * @sampleRate
\ No newline at end of file
+        return @context.currentTime * @sampleRate
diff --git a/src/player.coffee b/src/player.coffee
index 0393591..845c1ac 100644
--- a/src/player.coffee
+++ b/src/player.coffee
@@ -15,6 +15,7 @@ AudioDevice = require './device'
 
 class Player extends EventEmitter
     constructor: (@asset) ->
+        super()
         @playing = false
         @buffered = 0
         @currentTime = 0
diff --git a/src/queue.coffee b/src/queue.coffee
index 5d371af..e91bfc3 100644
--- a/src/queue.coffee
+++ b/src/queue.coffee
@@ -2,6 +2,7 @@ EventEmitter = require './core/events'
 
 class Queue extends EventEmitter
     constructor: (@asset) ->
+        super()
         @readyMark = 64
         @finished = false
         @buffering = true
diff --git a/src/sources/buffer.coffee b/src/sources/buffer.coffee
index ce3fb28..f2810e4 100644
--- a/src/sources/buffer.coffee
+++ b/src/sources/buffer.coffee
@@ -4,6 +4,7 @@ AVBuffer = require '../core/buffer'
 
 class BufferSource extends EventEmitter    
     constructor: (input) ->
+        super()
         # Now make an AV.BufferList
         if input instanceof BufferList
             @list = input
diff --git a/src/sources/node/file.coffee b/src/sources/node/file.coffee
index 5cb0a93..7a75f39 100644
--- a/src/sources/node/file.coffee
+++ b/src/sources/node/file.coffee
@@ -4,6 +4,7 @@ fs = require 'fs'
 
 class FileSource extends EventEmitter
     constructor: (@filename) ->
+        super()
         @stream = null
         @loaded = 0
         @size = null
diff --git a/src/sources/node/http.coffee b/src/sources/node/http.coffee
index b230344..d5217bb 100644
--- a/src/sources/node/http.coffee
+++ b/src/sources/node/http.coffee
@@ -4,6 +4,7 @@ http = require 'http'
 
 class HTTPSource extends EventEmitter
     constructor: (@url) ->
+        super()
         @request = null
         @response = null
         
```
