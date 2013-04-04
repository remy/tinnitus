/*global $:true, render:true*/
var find = (function () {
"use strict";

var find = {};
var ctx = document.querySelector('canvas').getContext('2d');
var osc; // used to find the tinitus frequency
var analyser;
var freqDisplay = $('#freq');
var running = null;
var slider = document.querySelector('input');
var touch = 'createTouch' in document;
var ready = false;

function start() {
  if (!ready) {
    return;
  }

  if (analyser) {
    analyser.input = osc;
  } else {
    stop();

    find.analyser = analyser = audio.createAnalyser();

    if (osc) {
      osc.noteOff(0);
      osc.output = null;
    }

    find.osc = osc = audio.createOscillator();
    // osc.connect(analyser);
    analyser.input = osc;

    osc.type = 0;
    slider.value = 440;
    slider.onchange.call(slider);
    osc.noteOn(0);

    update();
  }
}

function stop() {
  window.cancelAnimationFrame(running);
  if (osc) {
    osc.noteOff(0);
  }
  if (analyser) {
    analyser.input = null;
  }
}

function setup(touch) {
  slider.max = 22000;
  slider.value = 440;
  slider.onchange = function () {
    if (osc) {
      freqDisplay.html(osc.frequency.value = this.value);
    }
    if (window.notch) {
      window.notch.value = this.value;
    }
  };

  ready = true;
  $(document).trigger('audioready');

  if (touch) {
    start();
  }
}

function update() {
  running = window.requestAnimationFrame(update);
  var data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  window.render.buffer = data;
}

find.start = start;
find.stop = stop;
find.setup = setup;
find.audiocanvas = ctx;

return find;

})();