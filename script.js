// Initialize variables
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turnIndicator');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');

const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');

let currentPlayer = 'X';
let boardState = Array(9).fill('');
let gameOver = false;

// Load scores from localStorage
let scoreX = parseInt(localStorage.getItem('scoreX')) || 0;
let scoreO = parseInt(localStorage.getItem('scoreO')) || 0;
let scoreDraw = parseInt(localStorage.getItem('scoreDraw')) || 0;
updateScoreDisplay();

// Winning combinations
const winningCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

// Handle cell click
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (gameOver || cell.textContent !== '') return;

        cell.textContent = currentPlayer;
        cell.style.transform = 'scale(0)';
        setTimeout(()=>cell.style.transform='scale(1)',10);
        boardState[cell.dataset.index] = currentPlayer;

        if (checkWin()) {
            gameOver = true;
            turnIndicator.textContent = `Player ${currentPlayer} wins!`;
            addScore(currentPlayer);
            triggerConfetti();
            return;
        }

        if (boardState.every(cell => cell !== '')) {
            gameOver = true;
            turnIndicator.textContent = "It's a draw!";
            addScore('Draw');
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        turnIndicator.textContent = `Player ${currentPlayer}'s turn`;
    });
});

// Check win
function checkWin() {
    for (let combo of winningCombos) {
        const [a,b,c] = combo;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            showWinLine(a,b,c);
            return true;
        }
    }
    return false;
}

// Display win line
function showWinLine(a,b,c) {
    const line = document.createElement('div');
    line.classList.add('line');

    const cellA = cells[a].getBoundingClientRect();
    const cellB = cells[c].getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();

    line.style.left = `${cellA.left - boardRect.left + cellA.width/2}px`;
    line.style.top = `${cellA.top - boardRect.top + cellA.height/2}px`;
    const dx = cellB.left - cellA.left;
    const dy = cellB.top - cellA.top;
    const length = Math.sqrt(dx*dx + dy*dy);
    line.style.width = `${length}px`;
    line.style.height = `5px`;
    line.style.transformOrigin = '0 0';
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    line.style.transform = `rotate(${angle}deg)`;
    board.appendChild(line);

    setTimeout(()=>line.remove(), 3000);
}

// Update scores
function addScore(winner) {
    if (winner === 'X') scoreX++;
    else if (winner === 'O') scoreO++;
    else scoreDraw++;
    localStorage.setItem('scoreX', scoreX);
    localStorage.setItem('scoreO', scoreO);
    localStorage.setItem('scoreDraw', scoreDraw);
    updateScoreDisplay();
}

function updateScoreDisplay() {
    scoreXEl.textContent = scoreX;
    scoreOEl.textContent = scoreO;
    scoreDrawEl.textContent = scoreDraw;
    [scoreXEl,scoreOEl,scoreDrawEl].forEach(el=>{
        el.parentElement.classList.add('update');
        setTimeout(()=>el.parentElement.classList.remove('update'), 300);
    });
}

// Restart game
restartBtn.addEventListener('click', () => {
    if(!confirm('Are you sure you want to restart the game?')) return;
    boardState = Array(9).fill('');
    cells.forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
    gameOver = false;
    turnIndicator.textContent = `Player ${currentPlayer}'s turn`;
});

// Reset scores
resetScoreBtn.addEventListener('click', () => {
    if(!confirm('Are you sure you want to reset scores?')) return;
    scoreX = 0; scoreO = 0; scoreDraw = 0;
    localStorage.setItem('scoreX', scoreX);
    localStorage.setItem('scoreO', scoreO);
    localStorage.setItem('scoreDraw', scoreDraw);
    updateScoreDisplay();
});

// Confetti effect
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let confettiParticles = [];
function triggerConfetti() {
    confettiParticles = [];
    for(let i=0;i<150;i++){
        confettiParticles.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height- canvas.height,
            r: Math.random()*6+4,
            d: Math.random()*20+10,
            color: `hsl(${Math.random()*360}, 100%, 50%)`,
            tilt: Math.random()*10-10,
            tiltAngleIncrement: Math.random()*0.07+0.05,
            tiltAngle: 0
        });
    }
    animateConfetti();
    setTimeout(()=>confettiParticles=[],3000);
}

function animateConfetti(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    confettiParticles.forEach(p=>{
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(p.d) + 3 + p.r/2)/2;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r/2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r/2);
        ctx.stroke();
    });
    if(confettiParticles.length>0) requestAnimationFrame(animateConfetti);
}

window.addEventListener('resize',()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
