const getElement = selector => document.getElementById(selector);

const winSound = getElement("winSound");
const loseSound = getElement("loseSound");
const drawSound = getElement("drawSound");
const clickSound = getElement("clickSound");

let board, currentPlayer, xWins, oWins, draws, isAIEnabled, difficulty;
xWins = oWins = draws = 0;

const resetGame = () => {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    document.querySelectorAll('.cell').forEach(cell => cell.innerText = '');
}

const checkWinner = () => {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes(null) ? null : 'draw';
}

const updateScoreboard = (result) => {
    if (result === 'X') {
        xWins++;
        winSound.play();
    } else if (result === 'O') {
        oWins++;
        loseSound.play();
    } else {
        draws++;
        drawSound.play();
    }

    getElement("xWins").innerText = xWins;
    getElement("oWins").innerText = oWins;
    getElement("draws").innerText = draws;
}

const minimax = (newBoard, depth, isMaximizing) => {
    let result = checkWinner(newBoard);
    if (result === 'X') return -10 + depth; // X is the player
    if (result === 'O') return 10 - depth; // O is the AI
    if (result === 'draw') return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = 'O';
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = null; // Undo move
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = 'X';
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = null; // Undo move
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

const bestMove = () => {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = null; // Undo move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

const aiMove = () => {
    if (difficulty === 'easy') {
        let emptyCells = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell] = currentPlayer;
        document.querySelector(`[data-index='${randomCell}']`).innerText = currentPlayer;
    } else if (difficulty === 'medium') {
        // Medium AI with improved logic

        // First take the center if available
        if (board[4] === null) {
            board[4] = 'O';
            document.querySelector(`[data-index='4']`).innerText = 'O';
            return;
        }

        // Second, check for corners (0, 2, 6, 8)
        const cornerCells = [0, 2, 6, 8];
        for (let cell of cornerCells) {
            if (board[cell] === null) {
                board[cell] = 'O';
                document.querySelector(`[data-index='${cell}']`).innerText = 'O';
                return;
            }
        }

        // Check for a winning move
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'O'; // Try to win
                if (checkWinner() === 'O') {
                    return; // If it’s a winning move, return
                }
                board[i] = null; // Undo move
            }
        }

        // Block the player's winning moves
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'X'; // Try to block
                if (checkWinner() === 'X') {
                    board[i] = 'O';
                    document.querySelector(`[data-index='${i}']`).innerText = 'O';
                    return;
                }
                board[i] = null; // Undo move
            }
        }

        // If no immediate moves, play randomly in available cells
        let emptyCells = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell] = currentPlayer;
        document.querySelector(`[data-index='${randomCell}']`).innerText = currentPlayer;
    } else {
        // Hard AI using Minimax
        const move = bestMove();
        board[move] = currentPlayer;
        document.querySelector(`[data-index='${move}']`).innerText = currentPlayer;
    }
    currentPlayer = 'X';
}

const handleCellClick = (event) => {
    clickSound.play();
    const index = event.target.dataset.index;

    if (board[index] || checkWinner()) return;

    board[index] = currentPlayer;
    event.target.innerText = currentPlayer;
    const result = checkWinner();

    if (result) {
        updateScoreboard(result);
        return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (isAIEnabled && currentPlayer === 'O') {
        aiMove();
        const result = checkWinner();
        if (result) {
            updateScoreboard(result);
        } else {
            currentPlayer = 'X';
        }
    }
}

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

getElement("reset").addEventListener('click', resetGame);

// Handle game mode selection
getElement("gameMode").addEventListener('change', (event) => {
    const mode = event.target.value;
    isAIEnabled = mode === 'pvc';
    getElement("difficulty_level").style.display = isAIEnabled ? 'block' : 'none';
    getElement("difficulty").value = 'easy';
    resetGame();
});

// Handle difficulty selection
getElement("difficulty").addEventListener('change', (event) => {
    difficulty = event.target.value;
    resetGame();
});

document.addEventListener("DOMContentLoaded", () => {
    getElement("gameMode").value = "pvp";
    getElement("difficulty").value = 'easy';
    resetGame();

})