const moleScoreEl = document.getElementById("mole-score");
const moleTimeEl = document.getElementById("mole-time");
const moleStartBtn = document.getElementById("mole-start");
const moleHoles = Array.from(document.querySelectorAll(".mole-hole"));

const reactionStartBtn = document.getElementById("reaction-start");
const reactionBox = document.getElementById("reaction-box");
const reactionResultEl = document.getElementById("reaction-result");

const balloonScoreEl = document.getElementById("balloon-score");
const balloonTimeEl = document.getElementById("balloon-time");
const balloonStartBtn = document.getElementById("balloon-start");
const balloonZone = document.getElementById("balloon-zone");

const moleGame = {
  running: false,
  score: 0,
  timeLeft: 20,
  activeHole: null,
  tickTimer: null,
  moveTimer: null,
};

function setMoleActiveHole(nextHole) {
  if (moleGame.activeHole) {
    moleGame.activeHole.classList.remove("active");
    moleGame.activeHole.textContent = "빈 구멍";
  }
  moleGame.activeHole = nextHole;
  moleGame.activeHole.classList.add("active");
  moleGame.activeHole.textContent = "두더지!";
}

function randomMoleHole() {
  const randomIndex = Math.floor(Math.random() * moleHoles.length);
  return moleHoles[randomIndex];
}

function endMoleGame() {
  clearInterval(moleGame.tickTimer);
  clearInterval(moleGame.moveTimer);
  moleGame.running = false;
  if (moleGame.activeHole) {
    moleGame.activeHole.classList.remove("active");
    moleGame.activeHole.textContent = "빈 구멍";
    moleGame.activeHole = null;
  }
  moleStartBtn.disabled = false;
  moleStartBtn.textContent = "다시 시작";
}

function startMoleGame() {
  if (moleGame.running) {
    return;
  }

  moleGame.running = true;
  moleGame.score = 0;
  moleGame.timeLeft = 20;
  moleScoreEl.textContent = "점수: 0";
  moleTimeEl.textContent = "남은 시간: 20초";

  moleStartBtn.disabled = true;
  moleStartBtn.textContent = "진행중...";

  setMoleActiveHole(randomMoleHole());

  moleGame.moveTimer = setInterval(() => {
    setMoleActiveHole(randomMoleHole());
  }, 650);

  moleGame.tickTimer = setInterval(() => {
    moleGame.timeLeft -= 1;
    moleTimeEl.textContent = `남은 시간: ${moleGame.timeLeft}초`;

    if (moleGame.timeLeft <= 0) {
      endMoleGame();
    }
  }, 1000);
}

moleStartBtn.addEventListener("click", startMoleGame);

moleHoles.forEach((hole) => {
  hole.addEventListener("click", () => {
    if (!moleGame.running || hole !== moleGame.activeHole) {
      return;
    }

    moleGame.score += 1;
    moleScoreEl.textContent = `점수: ${moleGame.score}`;
    hole.classList.remove("active");
    hole.textContent = "잡았다!";
    moleGame.activeHole = null;
  });
});

let reactionWaitTimer = null;
let reactionReadyAt = 0;
let reactionCanClick = false;

function setReactionWaitingText(text) {
  reactionBox.classList.remove("ready", "too-soon");
  reactionBox.classList.add("waiting");
  reactionBox.textContent = text;
}

function startReactionGame() {
  clearTimeout(reactionWaitTimer);
  reactionCanClick = false;
  reactionReadyAt = 0;

  reactionStartBtn.disabled = true;
  setReactionWaitingText("초록색으로 바뀌면 클릭!");
  reactionResultEl.textContent = "기록: 준비 중...";

  const waitMs = 1000 + Math.floor(Math.random() * 2500);
  reactionWaitTimer = setTimeout(() => {
    reactionCanClick = true;
    reactionReadyAt = performance.now();
    reactionBox.classList.remove("waiting", "too-soon");
    reactionBox.classList.add("ready");
    reactionBox.textContent = "지금 클릭!";
    reactionStartBtn.disabled = false;
  }, waitMs);
}

function clickReactionBox() {
  if (reactionCanClick) {
    const reactionMs = Math.round(performance.now() - reactionReadyAt);
    reactionCanClick = false;
    setReactionWaitingText("다시 시작 버튼을 눌러줘");
    reactionResultEl.textContent = `기록: ${reactionMs}ms`;
    return;
  }

  if (reactionStartBtn.disabled) {
    clearTimeout(reactionWaitTimer);
    reactionStartBtn.disabled = false;
    reactionBox.classList.remove("waiting", "ready");
    reactionBox.classList.add("too-soon");
    reactionBox.textContent = "너무 빨라!";
    reactionResultEl.textContent = "초록색 된 다음에 눌러야 해.";
    return;
  }

  reactionResultEl.textContent = "시작 버튼을 누르고 도전해봐!";
}

reactionStartBtn.addEventListener("click", startReactionGame);
reactionBox.addEventListener("click", clickReactionBox);

const balloonGame = {
  running: false,
  score: 0,
  timeLeft: 20,
  spawnTimer: null,
  tickTimer: null,
};

function createBalloon() {
  if (!balloonGame.running) {
    return;
  }

  const balloon = document.createElement("button");
  balloon.type = "button";
  balloon.className = "balloon";

  const size = 36 + Math.floor(Math.random() * 20);
  const left = 5 + Math.random() * 85;
  const duration = 2.6 + Math.random() * 1.6;
  const colors = ["#ff9f8a", "#ffd56a", "#90f1d0", "#8bd7ff", "#ffb7df"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  balloon.style.width = `${size}px`;
  balloon.style.height = `${size + 10}px`;
  balloon.style.left = `${left}%`;
  balloon.style.backgroundColor = color;
  balloon.style.animationDuration = `${duration}s`;

  balloon.addEventListener("click", () => {
    if (!balloonGame.running) {
      return;
    }

    balloonGame.score += 1;
    balloonScoreEl.textContent = `점수: ${balloonGame.score}`;
    balloon.remove();
  });

  balloon.addEventListener("animationend", () => {
    balloon.remove();
  });

  balloonZone.appendChild(balloon);
}

function endBalloonGame() {
  clearInterval(balloonGame.spawnTimer);
  clearInterval(balloonGame.tickTimer);
  balloonGame.running = false;
  balloonStartBtn.disabled = false;
  balloonStartBtn.textContent = "다시 시작";
}

function startBalloonGame() {
  if (balloonGame.running) {
    return;
  }

  balloonGame.running = true;
  balloonGame.score = 0;
  balloonGame.timeLeft = 20;
  balloonScoreEl.textContent = "점수: 0";
  balloonTimeEl.textContent = "남은 시간: 20초";
  balloonZone.innerHTML = "";

  balloonStartBtn.disabled = true;
  balloonStartBtn.textContent = "진행중...";

  createBalloon();
  balloonGame.spawnTimer = setInterval(createBalloon, 550);

  balloonGame.tickTimer = setInterval(() => {
    balloonGame.timeLeft -= 1;
    balloonTimeEl.textContent = `남은 시간: ${balloonGame.timeLeft}초`;

    if (balloonGame.timeLeft <= 0) {
      endBalloonGame();
    }
  }, 1000);
}

balloonStartBtn.addEventListener("click", startBalloonGame);
