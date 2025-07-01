function toggleOverlay() {
  const overlay = document.getElementById('overlay');
  const isVisible = overlay.classList.contains('show');

  if (isVisible) {
    overlay.classList.remove('show');

    // nach der Slide-Out-Animation: ausblenden
    setTimeout(() => {
      overlay.classList.add('d_none');
    }, 400); // gleich wie die CSS transition-Dauer
  } else {
    overlay.classList.remove('d_none');

    // kleiner Timeout, um Rendering zu erzwingen
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);
  }
}