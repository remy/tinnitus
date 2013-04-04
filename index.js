var connect = require('connect'),
    lame = require('lame');

var server = connect();

server.use(connect.logger('dev'));
server.use(connect.static('./public'));
server.listen(process.env.PORT || 8000);

// create the Encoder instance
var encoder = new lame.Encoder({
  channels: 2,        // 2 channels (left and right)
  bitDepth: 16,       // 16-bit samples
  sampleRate: 44100   // 44,100 Hz sample rate
});

// raw PCM data from stdin gets piped into the encoder
// process.stdin.pipe(encoder);