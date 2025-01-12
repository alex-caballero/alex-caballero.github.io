// Text Animation on Load
document.addEventListener("DOMContentLoaded", () => {
  const headline = document.getElementById("headline");
  headline.style.opacity = "0";
  headline.style.transform = "translateY(20px)";
  setTimeout(() => {
    headline.style.transition = "opacity 1.5s, transform 1.5s";
    headline.style.opacity = "1";
    headline.style.transform = "translateY(0)";
  }, 500);
});
