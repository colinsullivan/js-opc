"use strict";

var assert = require("assert");
var concat = require("concat-stream");
var bufferEqual = require("buffer-equal");

// Strand
var createStrand = require("./strand");
var strand = createStrand(10);
strand.setPixel(0, 5, 10, 15);
assert.equal(strand.buffer.readUInt8(0), 5);
assert.equal(strand.buffer.readUInt8(1), 10);
assert.equal(strand.buffer.readUInt8(2), 15);
strand.slice(2, 6).setPixel(3, 1, 2, 3);
assert.equal(strand.buffer.readUInt8((5 * 3) + 0), 1);
assert.equal(strand.buffer.readUInt8((5 * 3) + 1), 2);
assert.equal(strand.buffer.readUInt8((5 * 3) + 2), 3);

// Stream
var createStream = require("./index");
var stream = createStream();
stream.writePixels(0, strand.buffer);
stream.end();
stream.pipe(concat(function(data) {
  assert.equal(data.readUInt8(0), 0);
  assert.equal(data.readUInt8(1), 0);
  assert.equal(data.readUInt16BE(2), strand.buffer.length);
  assert(bufferEqual(data.slice(4), strand.buffer));
}));

// @TODO Test stream.writeColorCorrection