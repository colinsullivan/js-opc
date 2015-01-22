# Open Pixel Control

Control lights using the [Open Pixel Control][opc] protocol.

This module was created to control [Fadecandy][] devices, but it should
work as a generic tool to create Open Pixel Control messages.

[fadecandy]: https://github.com/scanlime/fadecandy
[opc]: http://openpixelcontrol.org/

## Usage

```js
// Create TCP connection to Open Pixel Control server
var Socket = require("net").Socket;
var socket = new Socket();
socket.setNoDelay();
socket.connect(7890);

// Create an Open Pixel Control stream and pipe it to the server
var createOPCStream = require("opc");
var stream = createOPCStream();
stream.pipe(socket);

// Create a strand representing connected lights
var createStrand = require("opc/strand");
var strand = createStrand(512); // Fadecandy has 512 addresses
var left = strand.slice(0, 64); // Fadecandy pin 0
var right = strand.slice(64, 128); // Fadecand pin 1
// Set all left pixels to red and right to blue
for (var i = 0; i < 64; i++) {
  left.setPixel(i, 255, 0, 0);
  right.setPixel(i, 0, 0, 255);
}

// Write the pixel colors to the device on channel 0
stream.writePixels(0, strand.buffer);
```

## Stream

```
var createStream = require("opc");
```

### `var stream = createStream()`

Creates a stream that emits Open Pixel Control protocol messages.

### `stream.writePixels(channel, pixels)`

Emits a *[set pixel colors][opc set]* command message with the color
data in the *pixels* buffer.

[opc set]: https://github.com/scanlime/fadecandy/blob/master/doc/fc_protocol_opc.md#set-pixel-colors

### `stream.writeColorCorrection(config)`

Emits a [Fadecandy *set global color correction*][fc color] command
message with the given *config* object.

[fc color]: https://github.com/scanlime/fadecandy/blob/master/doc/fc_protocol_opc.md#set-global-color-correction

## Strand

```
var createStrand = require("opc/strand");
```

### `var strand = createStrand(length)`

Create a *strand* object representing a series of *length* pixels. The
strand provides a `strand.setPixel()` function  to set the color of each
pixel.

Pixel state is stored in *buffer* (`strand.buffer)` in Open Pixel
Control format (i.e., used in the data block of a *set pixel color*
command).

### `strand.setPixel(index, r, g, b)`

Set color at *index* to the given *rgb* value.

### `strand.slice(start, end)`

Returns a new strand which references the same state as the old, but
offset and cropped by the *start* and *end* indexes.

**Modifying the new strand slice will modify the original strand!**

### `strand.buffer`

Binary data representing the strand's pixel colors. The size of the
buffer will be `strand.length * 3` bytes.

### `strand.length`

The number of pixels in the strand.

## Installation

```
npm install opc
```