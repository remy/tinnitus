(function () {
"use strict";

if (!window.webkitAudioContext) { return; }

var filter = new window.webkitAudioContext().createBiquadFilter();
var AudioNode = filter.__proto__.__proto__; // "__proto__ is deprecated" - bite me, this works!

function toString(node) {
  return (node || 'null').toString().replace(/\[object (.*)\]/, '$1');
}

AudioNode.__defineGetter__('input', function() {
  return this._input;
});

AudioNode.__defineSetter__('input', function(node) {
  console.log(toString(node), '->', toString(this));
  if (this._input) { this._input.disconnect(); }
  if (node) { node.connect(this); }
  this._input = node;
});

AudioNode.__defineGetter__('output', function() {
  return this._output;
});

AudioNode.__defineSetter__('output', function(node) {
  if (node) { node.input = this; }
  else { this._output.input = null; }
  this._output = node;
});

})();