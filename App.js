import React, { useState, useEffect } from 'react';
import './App.css';
import Track from './components/Track';
import { WebMidi } from 'webmidi';


const App = () => {
  const [tracks, setTracks] = useState(Array(8).fill(null));  // 8 Spuren
  const [midiDevices, setMidiDevices] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  
  useEffect(() => {
    // MIDI-Geräte beim Start erkennen
    WebMidi.enable((err) => {
      if (err) {
        console.error("WebMidi Error:", err);
        return;
      }
      const availableDevices = WebMidi.inputs;
      setMidiDevices(availableDevices);
    });


    // Initialisiere AudioContext
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);
  }, []);


  // Funktion zum Hinzufügen eines Samples zu einer Spur
  const addSampleToTrack = (trackIndex, sampleUrl) => {
    const updatedTracks = [...tracks];
    updatedTracks[trackIndex] = { sampleUrl };
    setTracks(updatedTracks);
  };


  return (
    <div className="app">
      <h1>Audio/MIDI Looper</h1>
      <div className="track-container">
        {tracks.map((track, index) => (
          <Track 
            key={index} 
            trackIndex={index} 
            track={track} 
            addSampleToTrack={addSampleToTrack}
            midiDevices={midiDevices}
            audioContext={audioContext}
          />
        ))}
      </div>
    </div>
  );
};


export default App;