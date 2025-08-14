const GameModule = (function () {
  let canvas, ctx;
  let scoreUI, lifeUI;
  let gameRunning = false;
  let score = 0;
  let player, ground;
  let keys = {};
  let jumpForce = -15;
  let gravity = 0.8;

  let lives = 3;

  // 보스 관련
  let boss = null;
  let bossImage = new Image();
  bossImage.src = "boss image.jpg";
  let bossStartTime = 0;

  // 공격 패턴 배열
  let bossAttack1 = [];
  let bossAttack2 = [];
  let bossAttack3 = [];
  let attack1Timer = 0;
  let attack2Timer = 0;
  let attack3Timer = 0;

  function init(canvasId, scoreId, lifeId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext("2d");
    scoreUI = document.getElementById(scoreId);
    lifeUI = document.getElementById(lifeId);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player = {
      x: canvas.width / 2,
      y: canvas.height - 150,
      width: 50,
      height: 50,
      color: "red",
      vx: 0,
      vy: 0,
      onGround: false
    };

    ground = {
      x: 0,
      y: canvas.height - 100,
      width: canvas.width,
      height: 20,
      color: "purple"
    };

    gameRunning = true;
    lives = 3;
    score = 0;
    updateLifeUI();

    gameLoop();
  }

  function updateLifeUI() {
    lifeUI.innerHTML = "❤️".repeat(lives);
  }

  function spawnBoss() {
    boss = { x: canvas.width / 2 - 150, y: 100, width: 300, height: 300 };
    bossStartTime = Date.now();
  }

  function removeBoss() {
    boss = null;
    bossAttack1 = [];
    bossAttack2 = [];
    bossAttack3 = [];
  }

  function updateBossAttacks() {
    const currentTime = Date.now();

    // 공격1
    if (score >= 200 && score <= 2000) {
      if (currentTime - attack1Timer > 2000) {
        for (let i = 0; i < 4; i++) {
          bossAttack1.push({
            x: Math.random() * canvas.width,
            y: 0,
            width: 20,
            height: canvas.height,
            vx: Math.random() < 0.5 ? -2 : 2
          });
        }
        attack1Timer = currentTime;
      }
    }
    bossAttack1.forEach((a, idx) => {
      a.x += a.vx;
      a.y += 10;
      if (a.y > canvas.height) bossAttack1.splice(idx, 1);
    });

    // 공격2
    if (score >= 500 && score <= 2000) {
      if (currentTime - attack2Timer > 3000) {
        for (let i = 0; i < 5; i++) {
          bossAttack2.push({
            x: Math.random() * canvas.width,
            y: 0,
            r: 15,
            vy: 13
          });
        }
        attack2Timer = currentTime;
      }
    }
    bossAttack2.forEach((c, idx) => {
      c.y += c.vy;
      if (c.y > canvas.height) bossAttack2.splice(idx, 1);
    });

    // 공격3
    if (score >= 600 && score <= 2000) {
      if (currentTime - attack3Timer > 2000) {
        for (let i = 0; i < 8; i++) {
          bossAttack3.push({
            x: Math.random() * canvas.width,
            y: 0,
            width: 30,
            height: 30,
            vy: 13
          });
        }
        attack3Timer = currentTime;
      }
    }
    bossAttack3.forEach((r, idx) => {
      r.y += r.vy;
      if (r.y > canvas.height) bossAttack3.splice(idx, 1);
    });
  }

  function checkCollisions() {
    const playerRect = {
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height
    };

    function isColliding(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    // 공격1 충돌
    bossAttack1.forEach(a => {
      if (isColliding(playerRect, a)) damagePlayer();
    });

    // 공격2 충돌 (원형)
    bossAttack2.forEach(c => {
      let dx = player.x + player.width / 2 - (c.x + c.r);
      let dy = player.y + player.height / 2 - (c.y + c.r);
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < player.width / 2 + c.r) damagePlayer();
    });

    // 공격3 충돌
    bossAttack3.forEach(r => {
      if (isColliding(playerRect, r)) damagePlayer();
    });
  }

  function damagePlayer() {
    lives--;
    updateLifeUI();
    if (lives <= 0) {
      gameRunning = false;
      alert("게임 오버!");
    }
  }

  function update() {
    // 점수 증가
    score++;
    scoreUI.textContent = "점수: " + score;

    // 플레이어 중력
    player.vy += gravity;
    player.y += player.vy;
    player.x += player.vx;

    // 땅에 닿았을 때
    if (player.y + player.height >= ground.y) {
      player.y = ground.y - player.height;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }

    // 이동
    if (keys.left) player.x -= 5;
    if (keys.right) player.x += 5;

    // 보스 소환/삭제
    if (!boss && score >= 200) spawnBoss();
    if (boss && Date.now() - bossStartTime > 30000) removeBoss();

    if (boss) {
      updateBossAttacks();
      checkCollisions();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 땅
    ctx.fillStyle = ground.color;
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

    // 플레이어
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 보스
    if (boss) {
      ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
    }

    // 공격1
    ctx.fillStyle = "blue";
    bossAttack1.forEach(a => {
      ctx.fillRect(a.x, a.y, a.width, a.height);
    });

    // 공격2
    ctx.fillStyle = "cyan";
    bossAttack2.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 공격3
    ctx.fillStyle = "orange";
    bossAttack3.forEach(r => {
      ctx.fillRect(r.x, r.y, r.width, r.height);
    });
  }

  function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  function jump() {
    if (player.onGround) {
      player.vy = jumpForce;
      player.onGround = false;
    }
  }

  // 키보드 조작
  window.addEventListener("keydown", e => {
    if (e.code === "ArrowLeft") keys.left = true;
    if (e.code === "ArrowRight") keys.right = true;
    if (e.code === "Space") jump();
  });
  window.addEventListener("keyup", e => {
    if (e.code === "ArrowLeft") keys.left = false;
    if (e.code === "ArrowRight") keys.right = false;
  });

  // 모바일 터치 조작
  window.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;

    if (y > midY) {
      if (x > midX) keys.right = true;
      else keys.left = true;
    } else {
      jump();
    }
  });
  window.addEventListener("touchend", () => {
    keys.left = false;
    keys.right = false;
  });

  return { init };
})();
