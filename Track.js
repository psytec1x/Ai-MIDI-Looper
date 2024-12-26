import React, { useState } from 'react';
import { Howl } from 'howler';


const Track = ({ trackIndex, track, addSampleToTrack, midiDevices, audioContext }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentSample, setCurrentSample] = useState(null);


  // Beispiel: Aufnahme-Funktion
  const startRecording = () => {
    // Hier könntest du Audio-Aufnahme mit der Web Audio API starten
    setIsRecording(true);
  };


  const stopRecording = () => {
    // Hier beendest du die Aufnahme
    setIsRecording(false);
  };


  const handleSampleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addSampleToTrack(trackIndex, url);
      setCurrentSample(url);
    }
  };


  const playSample = () => {
    if (currentSample) {
      const sound = new Howl({ src: [currentSample] });
      sound.play();
    }
  };


  return (
    <div className="track">
      <h2>Track {trackIndex + 1}</h2>
      <div className="controls">
        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
        <button onClick={playSample}>Play Sample</button>
        <input type="file" onChange={handleSampleUpload} />
      </div>
      {track && track.sampleUrl && (
        <div>
          <h3>Sample Loaded:</h3>
          <p>{track.sampleUrl}</p>
        </div>
      )}
    </div>
  );
};


export default Track;