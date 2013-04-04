/*global $:true, alert:true*/
var render = (function () {
"use strict";

var render = {
  buffer: null
};

var ctx = document.querySelector('canvas').getContext('2d');
var slider = document.querySelector('input[type=range]');
var body = $('.container:first');
var width = body.width();
var height = width * 0.5;
var running = false;

function start() {
  stop(); // cancel any running or queued up animation
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  running = true;

  update();
}

function stop() {
  window.cancelAnimationFrame(running);
  running = false; // stops animation
}

function setup() {
  $(window).on('resize', function () {
    width = body.width();
    height = width * 0.5;
    slider.style.width = width + 'px';
    if (running) {
      start();
    }
  });

  slider.style.width = width + 'px';

  start();
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
  if (running === false) {
    return;
  }

  running = window.requestAnimationFrame(update);

  if (!render.buffer) {
    return;
  }

  ctx.clearRect(0,0,width,ctx.canvas.height);
  //ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  //ctx.fillRect(0,0,width,ctx.canvas.height);

  var last = {}, start = {}, x, y;

  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.fillStyle = 'red'; //'hsl(180, 89%, 41%)';
  ctx.fillStyle = 'hsla(180, 75%, 25%, 0.5)';
  ctx.strokeStyle = '#900';// 'cyan';
  ctx.lineWidth = 2;

  var displayData = sampled(render.buffer, width);

  for(var i=0; i<displayData.length; i++) {
    x = i;
    // make the y value always smaller than the height of the canvas
    y = ctx.canvas.height - ( (displayData[i] / 255) * (ctx.canvas.height - 50)) - 10; // note: 255 is the max value

    if  (i === 0) {
      start.x = x;
      start.y = y;
    }
    if (last.x !== null) {
      ctx.lineTo(x, y);
    }
    last.x = x;
    last.y = y;
  }

  ctx.stroke();
  ctx.lineTo(last.x, ctx.canvas.height);
  ctx.lineTo(0, ctx.canvas.height);
  ctx.lineTo(start.x, start.y);

  ctx.fillStyle = 'red';
  ctx.closePath();
  ctx.fill();
}

setup();

return render;

})();