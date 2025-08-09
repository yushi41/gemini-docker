/**
 * シンプルシューティングゲーム
 * 目的: HTML/CSS/JSで基本的なシューティングゲームを実装する。
 * 使い方: ブラウザで index.html を開く。
 *        ←→キーで移動、スペースキーで弾を発射。
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ゲーム設定 ---
let score = 0;
let gameOver = false;

// --- プレイヤー ---
const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 40,
    width: 30,
    height: 20,
    speed: 5,
    dx: 0, // 移動量
};

function drawPlayer() {
    ctx.fillStyle = 'cyan';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
}

function movePlayer() {
    player.x += player.dx;

    // 壁での反射
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// --- 弾 ---
const bullets = [];
const bulletSpeed = 7;

function shoot() {
    const bullet = {
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
    };
    bullets.push(bullet);
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= bulletSpeed;
        // 画面外に出たら削除
        if (b.y < 0) {
            bullets.splice(i, 1);
        }
    }
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });
}

// --- 敵 ---
const enemies = [];
const enemySpeed = 2;
let enemySpawnTimer = 0;

function spawnEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
    };
    enemies.push(enemy);
}

function updateEnemies() {
    enemySpawnTimer++;
    if (enemySpawnTimer > 80) { // 約1.3秒ごとに敵を生成
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += enemySpeed;

        // 画面下まで到達したらゲームオーバー
        if (e.y + e.height > canvas.height) {
            gameOver = true;
        }
    }
}

function drawEnemies() {
    ctx.fillStyle = 'red';
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.width, e.height);
    });
}

// --- 衝突判定 ---
function checkCollisions() {
    // 弾と敵
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const b = bullets[i];
            const e = enemies[j];

            if (b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y) {
                // 衝突！
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;
                break; // 次の弾へ
            }
        }
    }

    // 敵とプレイヤー
    for (const e of enemies) {
        if (player.x < e.x + e.width &&
            player.x + player.width > e.x &&
            player.y < e.y + e.height &&
            player.y + player.height > e.y) {
            // 衝突！
            gameOver = true;
        }
    }
}

// --- UI ---
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`スコア: ${score}`, 10, 25);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '20px Arial';
    ctx.fillText(`最終スコア: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.font = '16px Arial';
    ctx.fillText('リフレッシュして再挑戦', canvas.width / 2, canvas.height / 2 + 60);
}

// --- ゲームループ ---
function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    // 1. 状態の更新
    movePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();

    // 2. 描画
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面クリア
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawScore();

    requestAnimationFrame(gameLoop);
}

// --- イベントリスナー ---
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        if (!gameOver) {
            shoot();
        }
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' ||
        e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// --- ゲーム開始 ---
spawnEnemy(); // 最初の敵
gameLoop();
