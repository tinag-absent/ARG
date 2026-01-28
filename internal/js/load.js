document.addEventListener("DOMContentLoaded", () => {

  const lines = [
    "> SYSTEM BOOT SEQUENCE INITIATED",
    "> MEMORY CHECK ............... OK",
    "> AUTHENTICATION CHECK ....... OK",
    "> USER CLEARANCE VERIFIED",
    "> SEA-EROSION MONITOR : ONLINE",
    "> SENSOR ARRAY SYNC .......... OK",
    "> ARCHIVE INTEGRITY CHECK",
    "> DATA FRAGMENT RECOVERY",
    "> DATA SYNC ................. OK",
    "> CROSS-REFERENCE ANALYSIS",
    "> ACCESS LEVEL : INTERNAL",
    "> SESSION LOGGING ENABLED",
    "> ACCESS GRANTED"
  ];

  const textTarget = document.getElementById("loading-text");
  const percentTarget = document.getElementById("loading-percent");
  const screen = document.getElementById("loading-screen");

  let index = 0;
  let percent = 0;
  let glitchTriggered = false;

  function triggerGlitch() {
    if (glitchTriggered) return;
    glitchTriggered = true;

    const shift =
      (Math.random() > 0.5 ? 1 : -1) *
      (Math.floor(Math.random() * 8) + 5);

    screen.style.setProperty("--shift-x", shift + "px");
    screen.classList.add("glitch-shift");

    requestAnimationFrame(() => {
      screen.classList.remove("glitch-shift");
    });
  }

  function updatePercent(target) {
    const interval = setInterval(() => {
      let step;

      if (percent < 60) {
        step = Math.floor(Math.random() * 6) + 4;
      } else if (percent < 85) {
        step = Math.floor(Math.random() * 3) + 2;
      } else {
        step = 1;
      }

      percent += step;

      if (percent >= target) {
        percent = target;
        clearInterval(interval);
      }

      percentTarget.textContent = percent + "%";

      if (percent >= 98 && percent < 100) {
        triggerGlitch();
      }
    }, 120);
  }

  function printLine() {
    if (index < lines.length) {
      textTarget.textContent += lines[index] + "\n";
      updatePercent(Math.floor(((index + 1) / lines.length) * 100));
      index++;
      setTimeout(printLine, 600);
    } else {
      percentTarget.textContent = "99%";

      setTimeout(() => {
        percentTarget.textContent = "100%";
        setTimeout(() => {
          screen.classList.add("fade-out");
        }, 600);
      }, 1200);
    }
  }

  printLine();
});
