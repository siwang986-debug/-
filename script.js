// Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 8;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Player Paddle
const player = {
    x: 15,
    y: canvasHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer Paddle
const computer = {
    x: canvasWidth - 15 - paddleWidth,
    y: canvasHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: ballRadius,
    dx: 5,
    dy: 5,
    speed: 5
};

// Score
let playerScore = 0;
let computerScore = 0;

// Game State
let gameRunning = false;
let mouseY = canvasHeight / 2;

// Input Handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetScore);

// Start Game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        document.getElementById('startBtn').textContent = 'Game Running...';
        document.getElementById('startBtn').disabled = true;
    }
}

// Reset Score
function resetScore() {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
}

// Reset Ball to Center
function resetBall() {
    ball.x = canvasWidth / 2;
    ball.y = canvasHeight / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 8;
}

// Update Game State
function update() {
    if (!gameRunning) return;

    // Player Movement with Mouse or Arrow Keys
    if (keys['ArrowUp'] || keys['w']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y = Math.min(canvasHeight - player.height, player.y + player.speed);
    }

    // Player Movement with Mouse
    player.y = Math.max(0, Math.min(canvasHeight - player.height, mouseY - player.height / 2));

    // Computer AI
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const difficulty = 0.8; // Adjust for difficulty (0-1, lower = easier)

    if (computerCenter < ballCenter - 35 && computer.y < canvasHeight - computer.height) {
        computer.y += computer.speed * difficulty;
    } else if (computerCenter > ballCenter + 35 && computer.y > 0) {
        computer.y -= computer.speed * difficulty;
    }

    // Ball Movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball Collision with Top and Bottom Walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvasHeight) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvasHeight - ball.radius, ball.y));
    }

    // Ball Collision with Player Paddle
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;

        // Add spin based on where the ball hits the paddle
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.dy += deltaY * 0.05;
    }

    // Ball Collision with Computer Paddle
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;

        // Add spin based on where the ball hits the paddle
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy += deltaY * 0.05;
    }

    // Ball Out of Bounds
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }

    if (ball.x + ball.radius > canvasWidth) {
        playerScore++;
        updateScore();
        resetBall();
    }

    // Limit ball speed
    const maxSpeed = 10;
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    if (speed > maxSpeed) {
        ball.dx = (ball.dx / speed) * maxSpeed;
        ball.dy = (ball.dy / speed) * maxSpeed;
    }
}

// Update Score Display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw Functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear Canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw Center Line
    drawCenterLine();

    // Draw Paddles and Ball
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();

    // Draw Court Borders
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize and Start
updateScore();
gameLoop();
