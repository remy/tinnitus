/*global find:true, $:true, Notch:true, generateWhiteNoise:true*/
"use strict";

var audio,
    notch;

function init() {
  var playing = false,
      touch = 'createTouch' in document;

  try {
    audio = new window.webkitAudioContext();
  } catch(e) {
    alert('Web Audio API is not supported in this browser');
  }

  $(function () {
    $('#nav a:first').tab('show');
  });

  $(document).on('audioready', function () {
    $('#mute').on('click', function () {
      if (playing) {
        find.analyser.output = null;
      } else {
        find.analyser.output = audio.destination;
      }
      playing = !playing;
    });
  });


  $('a[data-toggle="tab"]').on('shown', function (e) {
    //e.target // activated tab
    //e.relatedTarget // previous tab
    var show = e.target.hash.substr(1),
        hidden = (e.relatedTarget || { hash: "" }).hash.substr(1);
    if (show === 'find') {
      find.start();
    } else {
      // generate
      var wn = generateWhiteNoise();
      notch = new Notch(document.querySelector('input').value, 3);
      // var n1 = singleNotch(440);
      // var n2 = singleNotch(440);
      // notch.allpass();
      // n1.input = wn;
      // n2.input = n1;
      // find.analyser.input = n2;
      notch.input = wn;
      // find.analyser.input = notch.notches[notch.notches.length - 1];
      find.analyser.input = null;
      notch.output = find.analyser;
      // find.analyser.input = wn;
    }
  });

  setTimeout(function () {
    window.scrollTo(0, 1);
  }, 1000);

  if (touch) {
    $(document).one('touchstart', function () {
      find.setup(true);
    });
  } else {
    find.setup(true);
  }

}

window.addEventListener('load', init, false);