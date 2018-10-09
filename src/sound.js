/**
 * Xpra HTML Client
 *
 * This is a refactored (modernized) version of
 * https://xpra.org/trac/browser/xpra/trunk/src/html5/
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 */

import AV from '../lib/aurora.js/build/aurora.js';
import {streamAudio} from './audio/stream.js';
import {mediaAudio} from './audio/mediasource.js';
import {auroraAudio} from './audio/aurora.js';
import {strToUint8} from './util.js';
import {
  CODEC_STRING,
  AURORA_CODECS,
  PREFERRED_CODEC_ORDER,
  MIN_START_BUFFERS,
  MAX_BUFFERS,
  IS_IE,
  IS_FIREFOX,
  IS_SAFARI,
  IS_CHROME,
  IS_OSX
} from './constants.js';

const MediaSourceClass = window.MediaSource || window.WebKitMediaSource;

const frameworks = {
  stream: streamAudio,
  mediasource: mediaAudio,
  aurora: auroraAudio
};

const getPreferedCodec = (codecs, serverCodecs) => {
  if (!codecs.length) {
    return null;
  }

  const found = PREFERRED_CODEC_ORDER
    .filter(name => serverCodecs.indexOf(name) !== -1)
    .find(name => codecs.includes(name));

  const foundDefault = codecs.find(name => serverCodecs.indexOf(name) !== -1);

  return found ? found : foundDefault;
};

const getBlacklistMediaCodecs = () => {
  let blacklist = [];

  if (IS_FIREFOX || IS_SAFARI) {
    blacklist += ['opus+mka', 'vorbis+mka'];

    if (IS_SAFARI) { // this crashes Safari!
      blacklist += ['wav'];
    }
  } else if (IS_CHROME) {
    blacklist = ['aac+mpeg4'];

    if (IS_OSX) {
      blacklist += ['opus+mka'];
    }
  }

  return blacklist;
};

const getStreamCodecs = (blacklist = []) => ['mp3']
  .filter(str => blacklist.indexOf(str) === -1)
  .reduce((result, str) => Object.assign({[str]: CODEC_STRING[str]}, result), {});

const getMediaSourceCodecs = (blacklist = []) => IS_IE || !MediaSourceClass
  ? {}
  : Object.keys(CODEC_STRING)
    .filter(str => blacklist.indexOf(str) === -1)
    .filter(str => MediaSourceClass.isTypeSupported(CODEC_STRING[str]))
    .reduce((result, str) => Object.assign({[str]: CODEC_STRING[str]}, result), {});

const getAuroraCodecs = (blacklist = []) => IS_IE
  ? {}
  : Object.keys(AURORA_CODECS)
    .filter(str => blacklist.indexOf(str) === -1)
    .filter(str => AV.Decoder.find(AURORA_CODECS[str]))
    .reduce((result, str) => Object.assign({[str]: AURORA_CODECS[str]}, result), {});

const getCodecs = (blacklist = []) => {
  const browserBlacklist = getBlacklistMediaCodecs();

  const mediasource = getMediaSourceCodecs([
    ...blacklist,
    ...browserBlacklist
  ]);

  const aurora = getAuroraCodecs([
    ...blacklist,
  ]);

  const stream = getStreamCodecs([
    ...blacklist,
  ]);

  return {mediasource, aurora, stream};
};

const createSettings = (audioFramework, audioCodecs, serverCapabilities) => {
  const serverCodecs = serverCapabilities['sound.encoders'];

  let framework = audioFramework;
  if (!framework) {
    if (!IS_IE) {
      framework = 'aurora';
    } else if (audioCodecs.frameworks.mediasource.indexOf(codec) !== -1) {
      framework = 'mediasource';
    } else {
      framework = 'stream';
    }
  }

  const codecs = audioCodecs.force.length > 0
    ? audioCodecs.force
    : Object.keys(audioCodecs.frameworks[framework]);

  const codec = getPreferedCodec(codecs, serverCodecs);
  const codecMedia = CODEC_STRING[codec];

  return {
    codec,
    codecMedia,
    codecs,
    framework
  };
};

// concatenate all pending buffers into one:
const concatBuffers = (ab) => {
  let size = 0;
  for (let i = 0, j = ab.length; i < j; ++i) {
    size += ab[i].length;
  }

  const buf = new Uint8Array(size);
  size = 0;

  for (let i = 0, j = ab.length; i < j; ++i) {
    let v = ab[i];
    if (v.length > 0) {
      buf.set(v, size);
      size += v.length;
    }
  }

  return buf;
};

export const enumSoundCodecs = (config) => {
  const force = config.audio_codecs || [];
  const frameworks = getCodecs(config.audio_codec_blacklist);
  const codecs = Object.values(frameworks)
    .reduce((arr, obj) => [...arr, ...Object.keys(obj)], []);

  return {frameworks, codecs, force};
};

/**
 * Creates sound output
 */
export const createSound = (send) => {
  let framework;
  let aborted = false;
  let buffers = [];
  let bufferCount = 0;
  let bufferStart = MIN_START_BUFFERS;

  const stopStream = (abort) => {
    console.debug('---', 'Stopping audio stream', abort);

    if (framework) {
      try {
        framework.stop();
      } catch (e) {
        console.warn(e);
        abort = true;
      }
    }

    aborted = abort === true;
  };

  const startStream = () => {
    console.debug('---', 'Starting audio stream');

    buffers = [];
    bufferCount = 0;

    if (framework) {
      framework.start();
    }
  };

  const appendStream = (codec, buffer, metadata) => {
    if (!framework) {
      return;
    }

    if (buffers.legngth >= MAX_BUFFERS) {
      console.warn('Audio overflow');
      stopStream();
      return;
    }

    if (metadata) {
      for (let i = 0; i < metadata.length; i++) {
        buffers.push(strToUint8(metadata[i]));
      }

      bufferStart = 1;
    }

    if (buffer) {
      buffers.push(buffer);
    }

    const ready = framework.ready();
    if (ready && (bufferCount > 0 || buffers.length >= bufferStart)) {
      if (buffers.length === 1) {
        buffer = buffers[0];
      } else {
        buffer = concatBuffers(buffers);
      }

      bufferCount += 1;
      buffers = [];
      framework.push(buffer);
    }
  };

  const process = (codec, buffer, options, metadata) => {
    if (aborted) {
      return;
    }

    // TODO: Check codec

    if (options['start-of-stream']) {
      startStream();
      return;
    }

    /* FIXME: This is emitted even though data comes in
    if (options['end-of-stream']) {
      stopStream();
    }
    */

    if (buffer) {
      try {
        appendStream(codec, buffer, metadata);
      } catch (e) {
        console.warn('Audio stream aborted', e);

        stopStream(true);
      }
    }
  };

  const destroy = () => stopStream();

  const start = (audioFramework, audioCodecs, clientCapabilities, serverCapabilities) => {
    const settings = createSettings(audioFramework, audioCodecs, serverCapabilities);

    console.info('init audio', settings);

    if (settings.framework) {
      framework = frameworks[settings.framework](
        settings,
        () => send('sound-control', 'start', settings.codec),
        () => send('sound-control', 'stop')
      );
    }

    startStream();
  };

  return Object.freeze({process, start, destroy});
};
