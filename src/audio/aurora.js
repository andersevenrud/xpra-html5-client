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
import AV from '../../lib/aurora.js/build/aurora.js';
import xpraSource from '../../lib/aurora-xpra.js';

export const auroraAudio = (settings, sendStart, sendStop) => {
  const auroraContext = xpraSource(AV);

  const start = () => {
    sendStart();

    auroraContext.play();
  };

  const stop = () => {
    auroraContext.stop();
  };

  const push = buffer => auroraContext.asset.source._on_data(buffer);

  const ready = () => !!auroraContext;

  return {start, stop, push, ready};
};
