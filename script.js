const button = document.querySelector("#change-button");
const circle = document.querySelector("#circle");
const message = document.querySelector("#message");

button.addEventListener("click", () => {
  circle.classList.toggle("changed");

  if (circle.classList.contains("changed")) {
    message.textContent = "The click event changed the page!";
  } else {
    message.textContent = "Click the button to begin.";
  }
});

// TODO: Add a mousemove event.
// TODO: Add a keyboard event.
// TODO: Add a window or time event.
