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

const getStreamUrl = (config) => config.uri
  .replace(/^ws/, 'http')
  .replace(/\/?$/, '/')
  + `audio.mp3?uuid=${config.uuid}`;

export const streamAudio = (settings) => {
  const audioElement = document.createElement('audio');
  audioElement.setAttribute('autoplay', true);
  audioElement.setAttribute('controls', false);
  audioElement.setAttribute('loop', true);

  const start = (config) => {
    const src = getStreamUrl(config);

    audioElement.src = src;
    audioElement.play();
  };

  const stop = () => {
    audioElement.pause();
  };

  const ready = () => true;

  return {start, stop, ready};
};
