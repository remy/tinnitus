var music;

(function () {

var root = document.documentElement;

root.ondragover = function () { this.className = 'hover'; return false; };
root.ondragend = function () { this.className = ''; return false; };
root.ondrop = function (e) {
  this.className = '';
  e.preventDefault();

  var file = e.dataTransfer.files[0],
      reader = new FileReader();

  reader.onload = function (event) {
    audio.decodeAudioData(event.target.result, function(buffer) {
      music = audio.createBufferSource();
      music.buffer = buffer;

      if (notch) { 
        notch.input = music;
      }

      music.noteOn(0);
    }, function () {
      console.error('failed to decodeAudioData');
    });
  };
  reader.readAsArrayBuffer(file);

  return false;
};

})();