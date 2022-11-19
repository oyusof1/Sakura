//constants and initial vars
const notes = ["C", "D", "E", "F", "G", "A", "B"];
const sharpNotes = ["C#", "D#", "F#", "G#", "A#"];
const shapes = ["sine", "square", "triangle", "sawtooth"];
let synth = new Tone.PolySynth().toDestination();
let sequence, orgSequencer= [], sequencerNotes = [];
let player, analyser, timeoutID;;
let playing = false;
let r, g, b, a;
let html = "";
document.querySelectorAll(".sequencerbox").forEach(x => orgSequencer.push(x.innerHTML))

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

document.querySelectorAll(".sequencerbox").forEach((item) => {
  item.addEventListener("click", (event) => {
    item.classList.add('selected')
  })
})

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
  let selected = document.querySelectorAll(".selected");
  event.stopPropagation();
  if (selected.length > 0) {
    selected[0].innerHTML = elem.id;
    sequencerNotes.push(elem.id);
    selected[0].classList.remove('selected');
  } else {
    elem.style.background = "#777";
    playing = true;
    background(0);
    redraw();
    if (document.getElementById("volume").value === -60) return;
    synth.triggerAttack(elem.id);
  }
};

//sequencer setup
const playSequence = () => {
  if (playing) {
    playing = false;
    if (sequence !== undefined) {
      sequence.stop();
      Tone.Transport.stop();
    }
  } else {
    sequence = new Tone.Sequence(
      (time, note) => {
        synth.triggerAttackRelease(note, 0.1, time);
      },
      sequencerNotes
    ).start(0);
    playing = true;
    sequence.start();
    Tone.Transport.start();
  }
};

 const delayedMessage = () => {
  timeoutID = setTimeout(() => {
    document.getElementById("error").hidden = true;
  }, 4000);
}

document.getElementById("playBtn").addEventListener("click", () => {
  if (sequencerNotes.length < 15) {
    document.getElementById("error").hidden = false;
    delayedMessage();
  } else {
    playing = false;
    playSequence();
  }
});

document.getElementById("stopBtn").addEventListener("click", () => {
  playing = true;
  playSequence();
  
});

document.getElementById("resetBtn").addEventListener("click", () => {
  let currSequencer = document.querySelectorAll('.sequencerbox');
  for (let i = 0; i < currSequencer.length; i++) {
    currSequencer[i].innerHTML = orgSequencer[i];
  }
  sequencerNotes = [];
});

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
