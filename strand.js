"use strict";

// # Strand
//
// A strand provides a virtual address space for a series of pixels in an Open
// Pixel Control [1] strand.
//
// [1] http://openpixelcontrol.org/
//

var isInteger = require("is-integer");

function hsv(h, s, v)
{
    /*
     * Converts an HSV color value to RGB.
     *
     * Normal hsv range is in [0, 1], RGB range is [0, 255].
     * Colors may extend outside these bounds. Hue values will wrap.
     *
     * Based on tinycolor:
     * https://github.com/bgrins/TinyColor/blob/master/tinycolor.js
     * 2013-08-10, Brian Grinstead, MIT License
     */

    h = (h % 1) * 6;
    if (h < 0) h += 6;

    var i = h | 0,
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        r = [v, q, p, p, t, v][i],
        g = [t, v, v, q, p, p][i],
        b = [p, p, t, v, v, q][i];

    return [ r * 255, g * 255, b * 255 ];
}

function getBuffer(input) {
  if (Buffer.isBuffer(input)) {
    if (input.length % 3 !== 0) {
      throw new Error("Buffer length must be a multiple of 3");
    }
    return input;
  }
  else if (isInteger(input)) {
    return Buffer.alloc(input * 3);
  }
  else {
    throw new Error("Input must be a buffer or an integer length");
  }
}

module.exports = function(lengthOrBuffer) {
  function setPixel(index, r, g, b) {
    var offset = index * 3;
    this.buffer.writeUInt8(r, offset);
    this.buffer.writeUInt8(g, offset + 1);
    this.buffer.writeUInt8(b, offset + 2);
  }

  function setPixelHSV(index, h, s, v) {
    this.setPixel.apply(this, [index].concat(hsv(h, s, v)));
  }

  function getPixel(index) {
    var offset = index * 3;
    return [
      this.buffer.readUInt8(offset),
      this.buffer.readUInt8(offset + 1),
      this.buffer.readUInt8(offset + 2),
    ];
  }

  function slice(start, end) {
    return module.exports(this.buffer.slice(start * 3, end * 3));
  }

  // Get a buffer to use for the pixel data. The input can be either the
  // length of the strand or an existing buffer to use.
  var buffer = getBuffer(lengthOrBuffer);

  // Create an object where the properties are not configurable or
  // writable - e.g., strand.length cannot be assigned a new value.
  return Object.create(null, {
    buffer: {
      value: buffer,
      enumerable: true,
    },
    length: {
      value: buffer.length / 3,
      enumerable: true,
    },
    setPixel: {
      value: setPixel,
      enumerable: true,
    },
    setPixelHSV: {
      value: setPixelHSV,
      enumerable: true
    },
    getPixel: {
      value: getPixel,
      enumerable: true,
    },
    slice: {
      value: slice,
      enumerable: true,
    },
  });
};
