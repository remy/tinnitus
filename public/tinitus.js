/*jshint browser:true, devel:true */
/* global webkitAudioContext:true */
"use strict";

var el = {
  freqSlider: document.getElementById('freqSlider'),
  stop: document.getElementById('stop'),
  oscillator: document.getElementById('oscillator'),
  type: document.getElementById('type'),
  notch: document.getElementById('notch'),
  noise: document.getElementById('noise'),
  canvas: document.getElementById('canvas'),
  echo: document.getElementById('echo'),
  root: document.documentElement
};

var context; // audio context
var gfx = el.canvas.getContext('2d');
var osc; // used to find the tinitus frequency
var analyser; // visualise the frequency
var music; // imported music
var rawanalyser; // show the original frequency before the notch
var notch; // the notched range
var noise; // white noise generator
var mix; // try to capture the mix
var width = window.innerWidth * 0.9;
var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var running = false;

// pitch functions taken form @cwilso's audio sandbox work
function noteFromPitch(frequency) {
  var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
  return Math.round( noteNum ) + 69;
}

function frequencyFromNoteNumber( note ) {
  return 440 * Math.pow(2,(note-69)/12);
}

function centsOffFromPitch( frequency, note ) {
  return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
}

// this is supposed to take our frequency, and get one octave of width (though I need to be sure the freq is an actual octave - which I doubt)
function centreFreq(f) {
  var lower = f / 1.41;
  var upper = lower * 2;
  return lower + (upper - lower) / 2;
}

function startOscillator() {
  if (osc) {
    osc.noteOff(0);
    osc.disconnect();
  }
  osc = context.createOscillator();
  osc.connect(analyser);

  osc.type = 0;
  el.freqSlider.value = osc.frequency.value = 440;
  osc.noteOn(0);
}

// taken from https://github.com/mattdiamond/synthjs
function whiteNoise(stereo, bufSize){
  bufSize = bufSize || 2048;
  var node = context.createJavaScriptNode(bufSize, 1, 2);
  node.onaudioprocess = function(e){
    var outBufferL = e.outputBuffer.getChannelData(0);
    var outBufferR = e.outputBuffer.getChannelData(1);
    for (var i = 0; i < bufSize; i++){
      outBufferL[i] = Math.random() * 2 - 1;
      outBufferR[i] = stereo ? Math.random() * 2 - 1 : outBufferL[i];
    }
  };
  return node;
}

function setupEventHandlers() {
  // mix.onaudioprocess = function (e) {
    // console.log('got data');
    // debugger;
  // };

  // if a bubbled click event comes up that's on a button,
  // then kick off the rendering again
  el.root.addEventListener('click', function (event) {
    if (event.target.nodeName === 'BUTTON' && event.target.id !== 'stop') {
      running = true;
    }
  });

  el.stop.onclick = function () {
    if (osc) { osc.disconnect(); }
    if (music) { music.disconnect(); }
    if (noise) { noise.disconnect(); }
    if (mix) { mix.disconnect(); }
    // stop rendering
    running = false;
  };

  el.notch.onclick = function () {
    notch = context.createBiquadFilter();
    notch.type = notch.NOTCH;
    notch.frequency.value = centreFreq(el.freqSlider.value);
    notch.Q.value = 0.5;
    notch.gain.value = 0;

    notch.connect(analyser);
    if (osc) { osc.disconnect(); } // stop the oscillator

    // if there's music, disconnect the music from the analyser
    // and connect it to the notch filter
    if (music) {
      music.disconnect();
      music.connect(notch);
      music.connect(rawanalyser);
      music.noteOn(0);
    }

    if (noise) {
      noise.disconnect();
      noise.connect(notch);
      noise.connect(rawanalyser);
    }
  };
  
  el.oscillator.onclick = startOscillator;
  
  el.type.onchange = function () {
    osc.type = this.value;
  };

  el.noise.onclick = function () {
    if (noise) {
      noise.disconnect();
    }
    noise = whiteNoise();
    noise.connect(analyser);
    noise.connect(rawanalyser);

    if (music) {
      music.disconnect();
    }
  };
  
  var read = false;
  el.canvas.ontouchstart = el.canvas.onmousedown = function (e) {
    e.preventDefault();
    el.freqSlider.value = e.pageX * 10;
    el.freqSlider.onchange.call(el.freqSlider);
    read = true;
  };
  
  el.canvas.ontouchmove = el.canvas.onmousemove = function (e) {
    if (read) {
      el.freqSlider.value = e.pageX * 10;
      el.freqSlider.onchange.call(el.freqSlider);
      e.preventDefault();
    }
  };
  
  el.canvas.ontouchend = el.canvas.onmouseup = function () {
    read = false;
  };

  el.freqSlider.onchange = function () {
    var f = centreFreq(this.value);
    var note = noteFromPitch(f);
    var cent = centsOffFromPitch( f, note );
    if (osc) { osc.frequency.value = this.value; }
    if (notch) {
      notch.frequency.value = f;
    }
    el.echo.innerHTML = this.value + 'hz (mid: ' + f.toFixed(2) + ') ' + noteStrings[note%12] + ' cent: ' + cent;
  };

  el.root.ondragover = function () { this.className = 'hover'; return false; };
  el.root.ondragend = function () { this.className = ''; return false; };
  el.root.ondrop = function (e) {
    this.className = '';
    e.preventDefault();
  
    var file = e.dataTransfer.files[0],
        reader = new FileReader();

    reader.onload = function (event) {
      context.decodeAudioData(event.target.result, function(buffer) {
        music = context.createBufferSource();
        music.buffer = buffer;
        
        // disconnect noise & osc
        if (osc) { osc.disconnect(); }
        if (noise) { noise.disconnect(); }

        music.connect(rawanalyser);

        if (notch) { music.connect(notch); }

        music.noteOn(0);
      }, function () {
        console.error('failed to decodeAudioData');
      });
    };
    reader.readAsArrayBuffer(file);
  
    return false;
  };
}

function sampled(arr, size) {
  var data = [], i, n, idx, scale;
  if (arr.length <= size){
    return arr;
  } else {
    scale = (arr.length / size);
    for (i = 0; i < size; i++) {
      n = i * scale;
      // faster Math.ceil
      idx = (n << 0);
      idx = (idx === n) ? idx: idx + 1;
      data[i] = arr[idx];
    }
    return data;
  }
}


function update() {
  window.webkitRequestAnimationFrame(update);
  
  if (!running) { return; }

  gfx.clearRect(0,0,width,gfx.canvas.height);
  gfx.fillStyle = 'rgba(255, 255, 255, 1)';
  gfx.fillRect(0,0,width,gfx.canvas.height);
   
  var data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  var data2 = new Uint8Array(analyser.frequencyBinCount);
  rawanalyser.getByteFrequencyData(data2);
  
  var last = {}, start = {}, x, y;
  
  gfx.beginPath();
  gfx.lineCap = 'round';
  gfx.fillStyle = 'red'; //'hsl(180, 89%, 41%)';
  gfx.fillStyle = 'hsla(180, 75%, 25%, 0.5)';
  gfx.strokeStyle = '#900';// 'cyan';
  gfx.lineWidth = 2;
  
  var displayData = sampled(data, width);
  var displayData2 = sampled(data2, width);
  for(var i=0; i<displayData.length; i++) {
    x = i;
    y = gfx.canvas.height-10-(displayData[i]/2)*1.75;
    
    gfx.fillRect(x-1, gfx.canvas.height-10-(displayData2[i]/2)*1.75 -1, 2, 2);
    
    //y = (displayData[i]/2) + gfx.canvas.height/4;
    if  (i === 0) {
      start.x = x;
      start.y = y;
    }
    if (last.x !== null) {
      //gfx.moveTo(last.x, last.y);
      gfx.lineTo(x, y);
    }
    last.x = x;
    last.y = y;
  }

  gfx.stroke();
  gfx.lineTo(last.x, gfx.canvas.height);
  gfx.lineTo(0, gfx.canvas.height);
  gfx.lineTo(start.x, start.y);


  gfx.fillStyle = 'red';
  gfx.closePath();
  gfx.fill();
}

function setup() {
  el.canvas.width = width;
  el.canvas.height = 250;
  
  // el.freqSlider.min = 0;
  // el.freqSlider.max = 20000;
  // el.freqSlider.step = 10;
  el.freqSlider.style.width = width + 'px';
  el.freqSlider.onclick = function () {
    this.focus();
  };

  window.webkitRequestAnimationFrame(update);
}

function init() {
  setup();
  try {
    context = new window.webkitAudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
  analyser = context.createAnalyser();
  analyser.connect(context.destination);
  rawanalyser = context.createAnalyser();
  // mix = context.createJavaScriptNode(2048, 1, 1);
  setupEventHandlers();
  running = true;
  setTimeout(function () {
    window.scrollTo(0, 1);
  }, 1000);
}

window.addEventListener('load', init, false);

