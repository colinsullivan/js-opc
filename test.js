"use strict";

var assert = require("assert");
var concat = require("concat-stream");
var bufferEqual = require("buffer-equal");

// Strand
var createStrand = require("./strand");
var strand = createStrand(10);
strand.setPixel(0, 5, 10, 15);
assert.deepEqual(strand.getPixel(0), [5, 10, 15]);
assert.equal(strand.buffer.readUInt8(0), 5);
assert.equal(strand.buffer.readUInt8(1), 10);
assert.equal(strand.buffer.readUInt8(2), 15);
strand.slice(2, 6).setPixel(3, 1, 2, 3);
assert.deepEqual(strand.slice(2 + 3, 2 + 3 + 1).getPixel(0), [1, 2, 3]);
assert.equal(strand.buffer.readUInt8((5 * 3) + 0), 1);
assert.equal(strand.buffer.readUInt8((5 * 3) + 1), 2);
assert.equal(strand.buffer.readUInt8((5 * 3) + 2), 3);

// Stream
var createStream = require("./index");
var stream = createStream();
stream.writePixels(0, strand.buffer);
stream.writeMessage(5, 10, new Buffer([0x0, 0x1, 0x2]));
stream.end();
stream.pipe(concat(function(data) {
  // .writePixels(0, strand.buffer);
  assert.equal(data.readUInt8(0), 0);
  assert.equal(data.readUInt8(1), 0);
  assert.equal(data.readUInt16BE(2), strand.buffer.length);
  assert(bufferEqual(data.slice(4, 4 + strand.buffer.length), strand.buffer));

  // .writeMessage(5, 10, new Buffer([0x0, 0x1, 0x2]));
  var offset = strand.buffer.length + 4;
  assert.equal(data.readUInt8(offset + 0), 5);
  assert.equal(data.readUInt8(offset + 1), 10);
  assert.equal(data.readUInt16BE(offset + 2), 3);
  assert(bufferEqual(data.slice(offset + 4), new Buffer([0x0, 0x1, 0x2])));
}));

// @TODO Test stream.writeColorCorrection

// Parser
var parserAsserters = [
  function(message) {
    assert.equal(message.channel, 0);
    assert.equal(message.command, 0);
    assert(bufferEqual(message.data, strand.buffer));
  },
  function(message) {
    assert.equal(message.channel, 1);
    assert.equal(message.command, 0);
    assert(bufferEqual(message.data, strand.buffer));
  },
];
var createParser = require("./parser");
var parserIndex = 0;
var parser = createParser().on("data", function(message) {
  parserAsserters[parserIndex](message);
  parserIndex += 1;
});
var stream2 = createStream();
var stream2ended = false;
stream2.pipe(parser);
stream2.writePixels(0, strand.buffer);
stream2.writePixels(1, strand.buffer);
stream2.end();
parser.on("end", function() {
  stream2ended = true;
  assert.equal(parserIndex, 2);
});
process.on("exit", function() {
  assert(stream2ended);
});
