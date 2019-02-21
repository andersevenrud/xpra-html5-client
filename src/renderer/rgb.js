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

import {lz4decode} from '../util.js';
import zlib from 'zlibjs';

export const rgbImageRenderer = ({x, y, w, h, data, options}) => ({drawContext}, callback) => {
  const img = drawContext.createImageData(w, h);

  if (options.zlib > 0) {
    data = zlib.inflateSync(data);
  } else if (options.lz4 > 0) {
    const {uncompressedSize, inflated} = lz4decode(data);
    data = inflated.slice(0, uncompressedSize);
  }

  if (data.length > img.data.length) {
    callback('Data size mismatch');
  } else {
    img.data.set(data);
    drawContext.putImageData(img, x, y);
    callback();
  }
};
