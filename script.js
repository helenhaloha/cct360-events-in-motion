const root = document.documentElement;
const body = document.body;
const orb = document.querySelector("#orb");
const clock = document.querySelector("#clock");
const viewport = document.querySelector("#viewport");
const xValue = document.querySelector("#x-value");
const yValue = document.querySelector("#y-value");
const moodName = document.querySelector("#mood-name");
const moodLine = document.querySelector("#mood-line");
const lightReading = document.querySelector("#light-reading");
const motionReading = document.querySelector("#motion-reading");
const signalCount = document.querySelector("#signal-count");
const eventMessage = document.querySelector("#event-message");
const pauseButton = document.querySelector("#pause-button");
const moodKeys = [...document.querySelectorAll(".mood-key")];

const moods = {
  calm: {
    name: "Calm",
    line: "Move slowly. The room is paying attention.",
    light: "Soft",
    motion: "Drifting",
  },
  warm: {
    name: "Warm",
    line: "A little heat changes the shape of everything.",
    light: "Golden",
    motion: "Rising",
  },
  storm: {
    name: "Storm",
    line: "Pressure gathers. The room leans closer.",
    light: "Electric",
    motion: "Restless",
  },
  night: {
    name: "Night",
    line: "Darkness makes the smallest signals brighter.",
    light: "Low",
    motion: "Orbiting",
  },
};

let signals = 0;
let paused = false;
let lastPointerUpdate = 0;

function announce(message) {
  eventMessage.textContent = message;
}

function updateViewport() {
  viewport.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  announce(`Window measured at ${window.innerWidth} by ${window.innerHeight} pixels.`);
}

function updateClock() {
  if (paused) return;
  clock.textContent = new Date().toLocaleTimeString("en-CA", { hour12: false });
}

function setMood(mood, source = "keyboard") {
  const selected = moods[mood];
  if (!selected) return;

  body.dataset.mood = mood;
  moodName.textContent = selected.name;
  moodLine.textContent = selected.line;
  lightReading.textContent = selected.light;
  motionReading.textContent = selected.motion;

  moodKeys.forEach((button) => {
    const isActive = button.dataset.mood === mood;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  announce(`${source === "keyboard" ? "Key" : "Control"} changed the atmosphere to ${selected.name}.`);
}

function moveLight(clientX, clientY) {
  const x = Math.round((clientX / window.innerWidth) * 100);
  const y = Math.round((clientY / window.innerHeight) * 100);
  root.style.setProperty("--pointer-x", `${x}%`);
  root.style.setProperty("--pointer-y", `${y}%`);
  root.style.setProperty("--wind-x", `${(x - 50) * 0.09}deg`);
  xValue.textContent = String(x).padStart(2, "0");
  yValue.textContent = String(y).padStart(2, "0");

  const now = Date.now();
  if (now - lastPointerUpdate > 900) {
    announce(`Pointer moved the light to ${x}, ${y}.`);
    lastPointerUpdate = now;
  }
}

function sendSignal(event) {
  signals += 1;
  signalCount.textContent = String(signals).padStart(2, "0");
  orb.classList.remove("pulsing");
  void orb.offsetWidth;
  orb.classList.add("pulsing");

  for (let index = 0; index < 8; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 8;
    const distance = 105 + Math.random() * 75;
    particle.className = "signal";
    orb.appendChild(particle);
    particle.animate(
      [
        { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
        { opacity: 0, transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(.2)` },
      ],
      { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)" }
    ).onfinish = () => particle.remove();
  }

  if (navigator.vibrate) navigator.vibrate(35);
  announce(`${event.type === "click" ? "Click" : "Touch"} sent signal ${String(signals).padStart(2, "0")} into the room.`);
}

function toggleTime() {
  paused = !paused;
  body.classList.toggle("time-paused", paused);
  pauseButton.textContent = paused ? "Resume" : "Space";
  pauseButton.setAttribute("aria-pressed", String(paused));
  announce(paused ? "Time paused. The room is holding still." : "Time resumed. The room is listening again.");
  if (!paused) updateClock();
}

window.addEventListener("pointermove", (event) => moveLight(event.clientX, event.clientY), { passive: true });
window.addEventListener("resize", updateViewport);

window.addEventListener("keydown", (event) => {
  if (["1", "2", "3", "4"].includes(event.key)) {
    const target = moodKeys.find((button) => button.dataset.key === event.key);
    setMood(target.dataset.mood, "keyboard");
  }

  if (event.code === "Space" && event.target.tagName !== "BUTTON") {
    event.preventDefault();
    toggleTime();
  }
});

orb.addEventListener("click", sendSignal);
pauseButton.addEventListener("click", toggleTime);
moodKeys.forEach((button) => button.addEventListener("click", () => setMood(button.dataset.mood, "control")));

updateViewport();
updateClock();
window.setInterval(updateClock, 1000);
