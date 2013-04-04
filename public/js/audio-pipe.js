var AudioPipe = (function () {
"use strict";

var AudioPipe = function (node) {
  this.node = node;
  this.input = null;
  this.output = null;
};

AudioPipe.__defineGetter__('input', function() { 
  return this.input;
});

AudioPipe.__defineSetter__('input', function(node) { 
  if (this.input) this.input.disconnect();
  if (node) node.connect(this.node);
  this.input = node;
});

AudioPipe.__defineGetter__('output', function() { 
  return this.output;
});

AudioPipe.__defineSetter__('output', function(node) { 
  if (this.output) this.node.disconnect();
  if (node) this.node.connect(node);
  this.output = node;
});

return AudioPipe;

});