//constants and initial vars
const notes = ["C", "D", "E", "F", "G", "A", "B"];
const sharpNotes = ["C#", "D#", "F#", "G#", "A#"];
const shapes = ["sine", "square", "triangle", "sawtooth"];
let synth = new Tone.PolySynth().toDestination();
let sequence;
let player, analyser;
let playing = false;
let r, g, b, a;
let html = "";

//create piano
for (let octave = 4; octave <= 5; octave++) {
  for (let i = 0; i < notes.length; i++) {
    if (notes[i] === "E" || notes[i] === "B") {
      html += `<div class="whitenote" id=${
        notes[i] + octave
      } onmouseup='noteUp(this,false)' onmouseleave='noteUp(this, false)' onmousedown='noteDown(this)'>${
        notes[i]
      }</div>`;
    } else {
      html += `<div class="whitenote" id=${
        notes[i] + octave
      } onmouseleave='noteUp(this, false)' onmouseup='noteUp(this, false)' onmousedown='noteDown(this)'>
                    <div class="blacknote" id="${
                      notes[i]
                    }#${octave}" onmouseleave='noteUp(this, true)' onmouseup='noteUp(this, true)' onmousedown='noteDown(this)'>${
        notes[i]
      }#</div>
                    ${notes[i]}
                    </div>`;
    }
  }
}
document.getElementById("pianocontainer").innerHTML = html;

//setup synth
const setupSound = () => {
  synth.set({
    envelope: {
      attack: document.getElementById("attack").value,
      decay: document.getElementById("decay").value,
      sustain: document.getElementById("sustain").value,
      release: document.getElementById("release").value,
    },
    oscillator: {
      type: shapes[document.getElementById("shape").value],
      width: document.getElementById("width").value,
    },
  });
  Tone.Master.volume.value = document.getElementById("volume").value;
  player = new Tone.Player();
  player.loop = true;
  player.autostart = false;
  player.loopStart = 1.0;
  player.connect(Tone.Master);

  analyser = new Tone.Analyser("waveform", 128);

  synth.connect(analyser);
  synth.connect(Tone.Master);
};
setupSound();

//on change for the sliders
document.querySelectorAll("webaudio-knob, webaudio-slider").forEach((item) => {
  item.addEventListener("input", () => {
    setupSound();
  });
});

//piano events
const noteUp = (elem, isSharp) => {
  if (isSharp) {
    elem.style.background = "black";
  } else {
    elem.style.background = "white";
  }
  synth.triggerRelease(elem.id);
  playing = false;
};

const noteDown = (elem) => {
  elem.style.background = "#777";
  event.stopPropagation();
  playing = true;
  background(0);
  redraw();
  if (document.getElementById("volume").value === -60) return;
  synth.triggerAttack(elem.id);
};

//sequencer setup
const playSequence = () => {
  if (playing) {
    playing = false;
    sequence.stop();
    Tone.Transport.stop();
  } else {
    // We do this by creating an array of indices [ 0, 1, 2 ... 15 ]
    const noteIndices = newArray(numCols);
    // create the sequence, passing onSequenceStep function
    sequence = new Tone.Sequence(onSequenceStep, noteIndices, "16n");

    // Start the sequence and Transport loop
    playing = true;
    sequence.start();
    Tone.Transport.start();
  }
};

// p5 canvas and visualizer
async function setup() {
  let canvas = createCanvas(
    windowWidth - windowWidth / 1.3,
    windowHeight - windowHeight / 1.3
  );
  canvas.parent("visualizer");
  background(255);
}

function draw() {
  if (!player || !analyser) return;

  background(0, 0, 0, 10);

  //   strokeWeight(dim * 0.0025);

  r = random(255);
  g = random(255);
  b = random(255);
  a = random(255);

  stroke(r, g, b, a);
  noFill();

  if (playing) {
    const values = analyser.getValue();

    beginShape();
    for (let i = 0; i < values.length; i++) {
      const amplitude = values[i];
      const x = map(i, 0, values.length - 1, 0, width);
      const y = height / 2 + amplitude * height;
      // Place vertex
      vertex(x, y);
    }
    endShape();
  }
  noStroke();
  fill(255);
}
