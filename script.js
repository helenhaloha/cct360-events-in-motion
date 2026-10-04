const body = document.body;
const stage = document.querySelector("#stage");
const shape = document.querySelector("#shape");
const clickCount = document.querySelector("#click-count");
const coordinates = document.querySelector("#coordinates");
const message = document.querySelector("#message");
const clock = document.querySelector("#clock");
const windowSize = document.querySelector("#window-size");
const pauseButton = document.querySelector("#pause-button");
const moodButtons = [...document.querySelectorAll(".mood-button")];

const moodMessages = {
  calm: "Calm mode selected. The page feels soft and quiet.",
  sunny: "Sunny mode selected. The page feels bright and warm.",
  rainy: "Rainy mode selected. The page feels cool and relaxed.",
  night: "Night mode selected. The page is ready for late-night ideas.",
};

let totalClicks = 0;
let clockPaused = false;

function showMessage(text) {
  message.textContent = text;
}

function selectMood(theme, source) {
  body.dataset.theme = theme;

  moodButtons.forEach((button) => {
    const selected = button.dataset.theme === theme;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  showMessage(`${source}: ${moodMessages[theme]}`);
}

function movePointer(event) {
  const box = stage.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - box.top) / box.height) * 100));

  stage.style.setProperty("--pointer-x", `${x}%`);
  stage.style.setProperty("--pointer-y", `${y}%`);
  coordinates.textContent = `${Math.round(x)}, ${Math.round(y)}`;
  showMessage("Pointer event: the dot followed your movement.");
}

function changeShape() {
  totalClicks += 1;
  clickCount.textContent = totalClicks;

  const sizes = ["size-one", "size-two", "size-three"];
  shape.classList.remove(...sizes);
  shape.classList.add(sizes[totalClicks % sizes.length]);

  showMessage(`Click event: the circle has been clicked ${totalClicks} time${totalClicks === 1 ? "" : "s"}.`);
}

function updateClock() {
  if (clockPaused) return;
  clock.textContent = new Date().toLocaleTimeString("en-CA", { hour12: false });
}

function toggleClock() {
  clockPaused = !clockPaused;
  body.classList.toggle("clock-paused", clockPaused);
  pauseButton.textContent = clockPaused ? "Resume clock (Space)" : "Pause clock (Space)";
  pauseButton.setAttribute("aria-pressed", String(clockPaused));
  showMessage(clockPaused ? "Keyboard event: the clock is paused." : "Keyboard event: the clock is running again.");
  updateClock();
}

function updateWindowSize() {
  windowSize.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  showMessage("Window event: the browser size was updated.");
}

stage.addEventListener("pointermove", movePointer);
shape.addEventListener("click", changeShape);
pauseButton.addEventListener("click", toggleClock);
window.addEventListener("resize", updateWindowSize);

moodButtons.forEach((button) => {
  button.addEventListener("click", () => selectMood(button.dataset.theme, "Button event"));
});

window.addEventListener("keydown", (event) => {
  const moodButton = moodButtons.find((button) => button.dataset.key === event.key);

  if (moodButton) {
    selectMood(moodButton.dataset.theme, `Keyboard key ${event.key}`);
  }

  if (event.code === "Space" && event.target.tagName !== "BUTTON") {
    event.preventDefault();
    toggleClock();
  }
});

updateWindowSize();
updateClock();
window.setInterval(updateClock, 1000);
