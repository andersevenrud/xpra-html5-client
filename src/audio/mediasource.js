/**
 * Xpra HTML Client
 *
 * ---
 *
 * Xpra
 * Copyright (c) 2013-2017 Antoine Martin <antoine@devloop.org.uk>
 * Copyright (c) 2016 David Brushinski <dbrushinski@spikes.com>
 * Copyright (c) 2014 Joshua Higgins <josh@kxes.net>
 * Copyright (c) 2015-2016 Spikes, Inc.
 * Licensed under MPL 2.0, see:
 * http://www.mozilla.org/MPL/2.0/
 *
 * ---
 *
 * This is a refactored (modernized) version of
 * https://xpra.org/trac/browser/xpra/trunk/src/html5/
 *
 * @author Anders Evenrud <andersevenrud@gmail.com>
 */

const MediaSourceClass = window.MediaSource || window.WebKitMediaSource;

export const mediaAudio = (settings, sendStart, sendStop) => {
  let bufferReady = false;
  let audioBuffer = null;

  const audioSource = new MediaSourceClass();
  audioSource.addEventListener('error', ev => {
    console.warn('Media failed', ev);
    sendStop();
  });

  audioSource.addEventListener('sourceopen', () => {
    if (bufferReady) {
      return;
    }

    try {
      audioBuffer = audioSource.addSourceBuffer(settings.codecMedia);
      audioBuffer.mode = 'sequence';
      audioBuffer.addEventListener('error', ev => {
        console.warn('Buffer failed', ev);
        sendStop();
      });
    } catch (e) {
      console.warn('Buffer exception', e);
      sendStop();
    }

    bufferReady = true;

    sendStart();
  });

  const src = window.URL.createObjectURL(audioSource);
  const audioElement = document.createElement('audio');
  audioElement.setAttribute('autoplay', true);
  audioElement.setAttribute('controls', false);
  audioElement.setAttribute('loop', true);
  audioElement.src = src;

  const stop = () => {
    audioElement.pause();

    if (audioBuffer) {
      audioSource.removeSourceBuffer(audioBuffer);
    }

    if (audioSource.readyState === 'open') {
      audioSource.endOfStream();
    }

    audioBuffer = null;
  };

  const push = buffer => {
    if (audioBuffer) {
      audioBuffer.appendBuffer(buffer);

      if (audioElement.paused) {
        audioElement.play();
      }
    }
  };

  const start = () => {};
  const ready = () => audioBuffer && !audioBuffer.updating;

  return {start, stop, push, ready};
};
