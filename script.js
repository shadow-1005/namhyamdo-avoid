document.addEventListener("DOMContentLoaded", () => {
  const lobby = document.getElementById("lobby");
  const creator = document.getElementById("creator");
  const gameScreen = document.getElementById("gameScreen");
  
  const startBtn = document.getElementById("startBtn");
  const creatorBtn = document.getElementById("creatorBtn");
  const backBtn = document.getElementById("backBtn");

  startBtn.addEventListener("click", () => {
    lobby.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    GameModule.init("gameCanvas", "scoreUI");
  });

  creatorBtn.addEventListener("click", () => {
    lobby.classList.add("hidden");
    creator.classList.remove("hidden");
  });

  backBtn.addEventListener("click", () => {
    creator.classList.add("hidden");
    lobby.classList.remove("hidden");
  });
});
