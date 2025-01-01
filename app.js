<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html><head><meta content="text/html; charset=ISO-8859-1" http-equiv="content-type"><title>app</title></head><body>
  // AudioContext initialisieren<br>
const audioContext = new (window.AudioContext || window.webkitAudioContext)();<br>
let isPlaying = false;<br>
let masterBPM = 120;<br>
<br>
// Spuren verwalten<br>
const tracks = [];<br>
<br>
// Globale Steuerung<br>
document.getElementById('start-stop').addEventListener('click', () =&gt; {<br>
&nbsp; isPlaying = !isPlaying;<br>
&nbsp; if (isPlaying) {<br>
&nbsp;&nbsp;&nbsp; tracks.forEach(track =&gt; track.start());<br>
&nbsp; } else {<br>
&nbsp;&nbsp;&nbsp; tracks.forEach(track =&gt; track.stop());<br>
&nbsp; }<br>
});<br>
<br>
document.getElementById('tempo').addEventListener('input', (event) =&gt; {<br>
&nbsp; masterBPM = parseInt(event.target.value);<br>
&nbsp; tracks.forEach(track =&gt; track.updateBPM(masterBPM));<br>
});<br>
<br>
// Neue Audiospur hinzufügen<br>
document.getElementById('add-audio-track').addEventListener('click', () =&gt; {<br>
&nbsp; const track = new AudioTrack();<br>
&nbsp; tracks.push(track);<br>
&nbsp; renderTracks();<br>
});<br>
<br>
// Spuren rendern<br>
function renderTracks() {<br>
&nbsp; const tracksContainer = document.getElementById('tracks');<br>
&nbsp; tracksContainer.innerHTML = '';<br>
&nbsp; tracks.forEach((track, index) =&gt; {<br>
&nbsp;&nbsp;&nbsp; const trackElement = document.createElement('div');<br>
&nbsp;&nbsp;&nbsp; trackElement.className = 'track';<br>
&nbsp;&nbsp;&nbsp; trackElement.innerHTML = `<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div class="track-controls"&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;input type="file" class="sample-upload" accept=".mp3,.wav"&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;input type="range" class="volume" min="0" max="1" step="0.01" value="0.5"&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;button class="sync"&gt;Sync&lt;/button&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;button class="play"&gt;Play&lt;/button&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/div&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div class="waveform"&gt;&lt;/div&gt;<br>
&nbsp;&nbsp;&nbsp; `;<br>
&nbsp;&nbsp;&nbsp; trackElement.querySelector('.sample-upload').addEventListener('change', (event) =&gt; {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; const file = event.target.files[0];<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (file) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; track.loadSample(file, () =&gt; {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; track.renderWaveform(trackElement.querySelector('.waveform'));<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br>
&nbsp;&nbsp;&nbsp; });<br>
&nbsp;&nbsp;&nbsp; trackElement.querySelector('.volume').addEventListener('input', (event) =&gt; {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; track.setVolume(event.target.value);<br>
&nbsp;&nbsp;&nbsp; });<br>
&nbsp;&nbsp;&nbsp; trackElement.querySelector('.sync').addEventListener('click', () =&gt; {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; track.syncToBPM(masterBPM);<br>
&nbsp;&nbsp;&nbsp; });<br>
&nbsp;&nbsp;&nbsp; tracksContainer.appendChild(trackElement);<br>
&nbsp; });<br>
}<br>
<br>
// AudioTrack-Klasse<br>
class AudioTrack {<br>
&nbsp; constructor() {<br>
&nbsp;&nbsp;&nbsp; this.audioBuffer = null;<br>
&nbsp;&nbsp;&nbsp; this.source = null;<br>
&nbsp;&nbsp;&nbsp; this.gainNode = audioContext.createGain();<br>
&nbsp;&nbsp;&nbsp; this.gainNode.connect(audioContext.destination);<br>
&nbsp;&nbsp;&nbsp; this.loopStart = 0;<br>
&nbsp;&nbsp;&nbsp; this.loopEnd = 0;<br>
&nbsp;&nbsp;&nbsp; this.bpm = masterBPM;<br>
&nbsp; }<br>
<br>
&nbsp; loadSample(file, callback) {<br>
&nbsp;&nbsp;&nbsp; const reader = new FileReader();<br>
&nbsp;&nbsp;&nbsp; reader.onload = (event) =&gt; {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; audioContext.decodeAudioData(event.target.result, (buffer) =&gt; {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.audioBuffer = buffer;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.loopEnd = buffer.duration;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (callback) callback();<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });<br>
&nbsp;&nbsp;&nbsp; };<br>
&nbsp;&nbsp;&nbsp; reader.readAsArrayBuffer(file);<br>
&nbsp; }<br>
<br>
&nbsp; renderWaveform(container) {<br>
&nbsp;&nbsp;&nbsp; const canvas = document.createElement('canvas');<br>
&nbsp;&nbsp;&nbsp; container.innerHTML = '';<br>
&nbsp;&nbsp;&nbsp; container.appendChild(canvas);<br>
&nbsp;&nbsp;&nbsp; const width = container.clientWidth;<br>
&nbsp;&nbsp;&nbsp; const height = container.clientHeight;<br>
&nbsp;&nbsp;&nbsp; canvas.width = width;<br>
&nbsp;&nbsp;&nbsp; canvas.height = height;<br>
&nbsp;&nbsp;&nbsp; const context = canvas.getContext('2d');<br>
&nbsp;&nbsp;&nbsp; const data = this.audioBuffer.getChannelData(0);<br>
&nbsp;&nbsp;&nbsp; const step = Math.ceil(data.length / width);<br>
&nbsp;&nbsp;&nbsp; const amp = height / 2;<br>
&nbsp;&nbsp;&nbsp; context.beginPath();<br>
&nbsp;&nbsp;&nbsp; for (let i = 0; i &lt; width; i++) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; let min = 1.0;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; let max = -1.0;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; for (let j = 0; j &lt; step; j++) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; const datum = data[i * step + j];<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (datum &lt; min) min = datum;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (datum &gt; max) max = datum;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; context.lineTo(i, (1 + min) * amp);<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; context.lineTo(i, (1 + max) * amp);<br>
&nbsp;&nbsp;&nbsp; }<br>
&nbsp;&nbsp;&nbsp; context.strokeStyle = '#00FF00';<br>
&nbsp;&nbsp;&nbsp; context.stroke();<br>
&nbsp; }<br>
<br>
&nbsp; start() {<br>
&nbsp;&nbsp;&nbsp; if (this.audioBuffer) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source = audioContext.createBufferSource();<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source.buffer = this.audioBuffer;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source.loop = true;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source.loopStart = this.loopStart;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source.loopEnd = this.loopEnd;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source.connect(this.gainNode);<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source.start();<br>
&nbsp;&nbsp;&nbsp; }<br>
&nbsp; }<br>
<br>
&nbsp; stop() {<br>
&nbsp;&nbsp;&nbsp; if (this.source) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source.stop();<br>
&nbsp;&nbsp;&nbsp; }<br>
&nbsp; }<br>
<br>
&nbsp; setVolume(volume) {<br>
&nbsp;&nbsp;&nbsp; this.gainNode.gain.value = volume;<br>
&nbsp; }<br>
<br>
&nbsp; syncToBPM(bpm) {<br>
&nbsp;&nbsp;&nbsp; const loopLength = (60 / bpm) * 4; // 4 Takte<br>
&nbsp;&nbsp;&nbsp; this.loopEnd = this.loopStart + loopLength;<br>
&nbsp;&nbsp;&nbsp; if (this.source) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.source.loopEnd = this.loopEnd;<br>
&nbsp;&nbsp;&nbsp; }<br>
&nbsp; }<br>
<br>
&nbsp; updateBPM(bpm) {<br>
&nbsp;&nbsp;&nbsp; this.bpm = bpm;<br>
&nbsp;&nbsp;&nbsp; this.syncToBPM(bpm);<br>
&nbsp; }<br>
}<br>

</body></html>