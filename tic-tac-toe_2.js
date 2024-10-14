//this function takes a string selector representing an ID and uses document.getElementbyid to return a corresponding DOM element.
const getElement = selector => document.getElementById(selector);

//these lines create constants for sound elements (audio files) for winning, losing, drawing and clicking sounds
const winSound = getElement("winSound");
const loseSound = getElement("loseSound");
const drawSound = getElement("drawSound");
const clickSound = getElement("clickSound");

//declares variables to keep track of the game state, such as board, the current player, score counters for Xs and Os, whether AI is enabled and the difficulty level.
let board, currentPlayer, xWins, oWins, draws, isAIEnabled, difficulty;
xWins = oWins = draws = 0; //initialzed to zero.

//this function initializes the game board as an array of 9 null values (representing empty cells), sets currentPlayer to 'X', and clears the text of all cells in the game UI.
const resetGame = () => {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    document.querySelectorAll('.cell').forEach(cell => cell.innerText = '');
}

//This function checks for a winner by comparing the current state of the board against all possible winning combinations. If there's a winning combination, it returns 'X' or 'O'. If the board is fulll and there's no winner, it returns 'draw'; otherwise, it returns null.
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

//This function updates the scoreboard based on the game result, plays the corresponding sound and updates the UI elements displying the scores.
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

const saveGameState = () => {
    const gameState = {
        board,
        currentPlayer,
        xWins,
        oWins,
        draws,
        isAIEnabled,
        difficulty,
    };
    localStorage.setItem('ticTacToeGameState', JSON.stringify(gameState));
}

const loadGameState = () => {
    const savedState = localStorage.getItem('ticTacToeGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        board = gameState.board;
        currentPlayer = gameState.currentPlayer;
        xWins = gameState.xWins;
        oWins = gameState.oWins;
        draws = gameState.draws;
        isAIEnabled = gameState.isAIEnabled;
        difficulty = gameState.difficulty;

        // Update the UI based on the loaded game state
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.innerText = board[index] ? board[index] : '';
        });
        getElement("xWins").innerText = xWins;
        getElement("oWins").innerText = oWins;
        getElement("draws").innerText = draws;
    }
}

//this function is used for AI decision-making. It evaluates possible game states (board configurations) to determine the optimal move for the AI. It also assigns scores based on wheter 'X' or 'O' wins or if there's a draw.
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

//this function uses the minimax algorithm to find the best move for the AI by evaluating scores from possible moves and returning the index that results in the best score.
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

//this function implements different strategies for the AI based on the selected difficulty level, allowing for varying levels of challenge. The AI behavior differs between easy, medium and hard difficulties.
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

//This function handles clicks on the game cells. It plays a click sound, updates the board, checks for a winner and switches the current player. If it's the AI's turn, it calls the aiMove function.
const handleCellClick = (event) => {
    clickSound.play();
    const index = event.target.dataset.index;

    if (board[index] || checkWinner()) return;

    board[index] = currentPlayer;
    event.target.innerText = currentPlayer;
    saveGameState();  // Save the game state after each move
    const result = checkWinner();

    if (result) {
        updateScoreboard(result);
        saveGameState();  // Save the final result
        return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (isAIEnabled && currentPlayer === 'O') {
        aiMove();
        const result = checkWinner();
        if (result) {
            updateScoreboard(result);
            saveGameState();  // Save the final result
        } else {
            currentPlayer = 'X';
        }
    }
}

//Event listeners added for click events, to the reset button for resetting the game and to the dropdowns for game mode and difficulty selection, allowing user interaction.
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});
getElement("reset").addEventListener('click', () => {
    resetGame();
    localStorage.removeItem('ticTacToeGameState');  // Clear saved state on reset
})
getElement("gameMode").addEventListener('change', (event) => {
    const mode = event.target.value;
    isAIEnabled = mode === 'pvc';
    getElement("difficulty_level").style.display = isAIEnabled ? 'block' : 'none';
    getElement("difficulty").value = 'easy';
    resetGame();
});
getElement("difficulty").addEventListener('change', (event) => {
    difficulty = event.target.value;
    resetGame();
});

//Sets default values in the game mode and difficulty dropdowns and resets the game state when the page fully loads.
document.addEventListener("DOMContentLoaded", loadGameState);