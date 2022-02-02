// Variables
const canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d"),
  btn = document.getElementById("btn"),
  modal = document.querySelector(".modal"),
  hScore = document.querySelector("span"),
  friction = 0.98;
let cHeight = (canvas.height = window.innerHeight),
  cWidth = (canvas.width = window.innerWidth),
  xpos,
  ypos,
  projectiles = [],
  enemies = [],
  particles = [],
  dist,
  running,
  int,
  score = 0,
  active = {
    stats: false,
    x: 0,
    y: 0,
  };

// CLASSES:
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}
////////////CLASSES END////////////////

// Player
let player = new Player(cWidth / 2, cHeight / 2, 30, "gray");
player.draw();

// Enemies
const spawnEnemies = () => {
  int = setInterval(() => {
    const radius = Math.floor(Math.random() * (30 - 9 + 1)) + 9;
    // if math.random is < 0.5 assign spawn from left
    // else assign spawn from right
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : cWidth + radius;
      y = Math.random() * cHeight;
    } else {
      x = Math.random() * cWidth;
      y = Math.random < 0.5 ? 0 - radius : cHeight + radius;
    }
    // Different colors
    const color = `hsl(${Math.random() * 360}, ${
        Math.random() * (100 - 30) + 30
      }%, 40%)`,
      // angle alpha (TAN)
      // Basically this will compute tan (alpha) = opp / adj = y / x
      angle = Math.atan2(player.y - y, player.x - x),
      velocity = {
        // velocity x
        x: Math.cos(angle),
        // velocity y
        y: Math.sin(angle),
      };
    // Generating many enemies
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
};
// pause the game when window is not active
// onmousemove = function (e) {
//   active.x = e.clientX;
//   active.y = e.clientY;
//   if (active.x < 0 || active.x > cWidth || active.y < 0 || active.y > cHeight) {
//     active.stats = false;
//   } else active.stats = true;
// };

// Game initialize
const game = () => {
  running = requestAnimationFrame(game);
  ctx.strokeStyle = "gray";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "50px Helvetica, Arial, sans-serif";
  ctx.strokeText(`Score: ${score}`, cWidth / 2, 50);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, cWidth, cHeight);
  player.draw();
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  projectiles.forEach((projectile, index) => {
    projectile.update();
    // Remove projectiles when they go out of the screen
    if (
      projectile.x + projectile.radius <= 0 ||
      projectile.x - projectile.radius >= cWidth ||
      projectile.y + projectile.radius <= 0 ||
      projectile.y - projectile.radius > cHeight
    ) {
      projectiles.splice(index, 1);
    }
  });
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    const pp = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    // Enemy collision with player
    if (pp - enemy.radius - player.radius <= 1) {
      if (localStorage.getItem("highScore") < score) {
        localStorage.setItem("highScore", score);
      }
      hScore.innerText = localStorage.getItem("highScore");
      score = 0;
      cancelAnimationFrame(running);
      ctx.clearRect(0, 0, cWidth, cHeight);
      btn.innerText = "Play Again!";
      modal.classList.remove("fadeModal");
      projectiles = [];
      enemies = [];
      clearInterval(int);
      int = 0;
    }
    projectiles.forEach((projectile, projectileIndex) => {
      dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      // Projectile touch enemy
      if (dist - enemy.radius - projectile.radius <= 1) {
        // Create particles
        for (let i = 0; i < enemy.radius / 1.4; ++i) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * Math.random() * 6,
                y: (Math.random() - 0.5) * Math.random() * 6,
              }
            )
          );
        }
        if (enemy.radius > 15) {
          score += 50;
          gsap.to(enemy, {
            radius: enemy.radius - (enemy.radius / 30) * 15,
          });
          setTimeout(() => {
            // if (enemy.radius <= 15) {
            //   enemy.splice(enemyIndex, 1);
            //   score++;
            // }
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          score += 100;
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
  particles.forEach((particle, i) => {
    if (particle.alpha <= 0.01) {
      particles.splice(i, 1);
    }
    particle.update();
  });
};

// High score system
if (localStorage.getItem("highScore") === null) {
  localStorage.setItem("highScore", 0);
}
hScore.innerText = localStorage.getItem("highScore");

//Shooting event listener
window.addEventListener("click", (e) => {
  xpos = e.clientX;
  ypos = e.clientY;
  const angle = Math.atan2(ypos - cHeight / 2, xpos - cWidth / 2);
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4,
  };
  projectiles.push(new Projectile(cWidth / 2, cHeight / 2, 5, "red", velocity));
});

// Launch
btn.addEventListener("click", () => {
  projectiles = [];
  enemies = [];
  modal.classList.add("fadeModal");
  clearInterval(int);
  int = 0;
  game();
  spawnEnemies();
});

// PLEASE DONT RESIZE WHILE GAME IS ON
window.addEventListener("resize", () => {
  cWidth = innerWidth;
  cHeight = innerHeight;
  canvas.height = cHeight;
  canvas.width = cWidth;
  ctx.clearRect(0, 0, cWidth, cHeight);
  ctx.fillRect(0, 0, cWidth, cHeight);
  player = new Player(cWidth / 2, cHeight / 2, 30, "gray");
  player.draw();
});
