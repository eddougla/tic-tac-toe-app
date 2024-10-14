//This is a helper function that simplifies the process of selecting elements from the DOM. 
//It uses document.getElementById and takes a string selector representing the ID of an HTML element. 
//This function allows for cleaner code when retrieving DOM elements.
const getElement = (selector) => document.getElementById(selector);

//These lines retrieve audio elements from the DOM using the getElement function. 
//They are used to play sound effects for winning, losing, draws or clicking.
const winSound = getElement("winSound");
const loseSound = getElement("loseSound");
const drawSound = getElement("drawSound");
const clickSound = getElement("clickSound");

//This section declases multiple variables:
//board: Represents the state of the game in a 1D array (length of 9 for a 3x3 grid).
//currentPlayer: Tracks whose turn it is ('X' or 'O').
//xWins, oWins, draws: Counters for wins and draws.
//isAIEnabled: A boolean indicating if the game is versus an AI.
//difficulty: A string representing the difficulty setting of the AI.
let board, currentPlayer, xWins, oWins, draws, isAIEnabled, difficulty;
xWins = oWins = draws = 0;

//This function resets the game state:
const resetGame = () => {
    board = Array(9).fill(null); //Reinitalizes the board to an empty state.
    currentPlayer = 'X'; //Resets currentPlayer to 'X' (player starts first).
    document.querySelectorAll('.cell').forEach(cell => cell.innerText = ''); //Clears the text in each cell in the UI.
}

//This function checks for a winning combination on the board:
const checkWinner = () => {
    //Defines possible winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]; 

    for (const combination of winningCombinations) {
        //Iterates through the combinations to see if any player has won.
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes(null) ? null : 'draw'; //Returns 'X', 'O', or 'draw' as per the game state.
}

//This function updates the scoreboard based on the game result:
const updateScoreboard = (result) => {
    if (result === 'X') {
        xWins++; //Increments the corresponding counter for X.
        winSound.play(); //Plays the winSound on wins.
    } else if (result === 'O') {
        oWins++;
        loseSound.play();
    } else {
        draws++;
        drawSound.play();
    }

    getElement("xWins").innerText = xWins; //Updates the score for player X
    getElement("oWins").innerText = oWins; //Updates the score for player O
    getElement("draws").innerText = draws; //Updates the score for draws
}

//This function saves the current game state and related settings to localStorage:
const saveGameState = () => {
    const gameState = {
        //Creates an object containing board, currentPlayer, scores, AI status and difficulty.
        board,
        currentPlayer,
        xWins,
        oWins,
        draws,
        isAIEnabled,
        difficulty
    };
    localStorage.setItem('ticTacToeGameState', JSON.stringify(gameState)); //Serializes the object into a JSON string and stores it in localStorage.
}

//This function retrieves the saved state from localStorage.
const loadGameState = () => {
    const savedState = localStorage.getItem('ticTacToeGameState');
    //If a saved state exists, it parses the JSON string back into an object.
    if (savedState) {
        //Updates the local variables with data from the localStorage.
        const gameState = JSON.parse(savedState);
        board = gameState.board;
        currentPlayer = gameState.currentPlayer;
        xWins = gameState.xWins;
        oWins = gameState.oWins;
        draws = gameState.draws;
        isAIEnabled = gameState.isAIEnabled;
        difficulty = gameState.difficulty;

        // Update the UI based on the game state from localStorage
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.innerText = board[index] ? board[index] : '';
        });
        getElement("xWins").innerText = xWins;
        getElement("oWins").innerText = oWins;
        getElement("draws").innerText = draws;

        // Set the selected game mode and difficulty from localStorage
        getElement("gameMode").value = isAIEnabled ? 'pvc' : 'pvp';
        getElement("difficulty").value = difficulty;

        // Show or hide difficulty level selector based on AI setting from localStorage
        getElement("difficulty_level").style.display = isAIEnabled ? 'block' : 'none';
    }
}

//Implements the minimax algorithm for the AI.
//newboard: The current state of the game board being evaluated.
//depth: A number representing the depth of the current move in the game tree (how many moves down the tree):
//isMaximazing: A boolean indicating whether the current move is for the maximizing player ('O') or minimizing player ('X').
const minimax = (newBoard, depth, isMaximizing) => {
    let result = checkWinner(newBoard); //Calls checkWinner to see if the game has reached a terminal state (win for X, win for O, or a draw).
    if (result === 'X') return -10 + depth; //If the minimizing plyer ('X) wins, it returns a negative score (-10 + depth). This discourages longer games for X.
    if (result === 'O') return 10 - depth; //If the maximizing player ('O') wins, it returns a positive score (10 - depth). The depth is subtracted to prefer quicker wins.
    if (result === 'draw') return 0; //If it's a draw, it returns 0.

    if (isMaximizing) {
        //If isMaximizing is true (meaning it's the AI's turn), it initializes bestScore to negative infinity.
        let bestScore = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            //For each potentially empty cell in newBoard.
            //Undo move 
            if (newBoard[i] === null) { 
                newBoard[i] = 'O'; //Simulates playing 'O' in that cell.
                let score = minimax(newBoard, depth + 1, false); //Calls minimax recursively, treating the next turn as the minimizing plyer's turn by passing false.
                newBoard[i] = null;
                bestScore = Math.max(score, bestScore); //Updates best score.
            }
        }
        return bestScore; //Return the best score (move) found.
    } else {
        //If isMaximizing is false (meaning it's the human's turn), it initializes bestScore to positive infinity.
        let bestScore = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = 'X'; //Simulate move for minimizing player.
                let score = minimax(newBoard, depth + 1, true); // Recursive call
                newBoard[i] = null; //Undo move
                bestScore = Math.min(score, bestScore); //Updates best score
            }
        }
        return bestScore;//Return the best score (move) found.
    }
}

//Determines the best move for the AI using the minimax function.
const bestMove = () => {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        //Iterates over possible moves and evaluates them using the minimax algorithm.
        if (board[i] === null) {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

//Contains logic for the AI's moves based on the difficulty.
const aiMove = () => {
    //Implements different strategies for 'easy', 'mediun', and 'hard' modes.
    if (difficulty === 'easy') {
        let emptyCells = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell] = currentPlayer;
        document.querySelector(`[data-index='${randomCell}']`).innerText = currentPlayer;
    } else if (difficulty === 'medium') {
        // Medium AI logic
        if (board[4] === null) {
            board[4] = 'O';
            document.querySelector(`[data-index='4']`).innerText = 'O';
            return;
        }

        const cornerCells = [0, 2, 6, 8];
        for (let cell of cornerCells) {
            if (board[cell] === null) {
                board[cell] = 'O';
                document.querySelector(`[data-index='${cell}']`).innerText = 'O';
                return;
            }
        }

        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                if (checkWinner() === 'O') {
                    return;
                }
                board[i] = null;
            }
        }

        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                if (checkWinner() === 'X') {
                    board[i] = 'O';
                    document.querySelector(`[data-index='${i}']`).innerText = 'O';
                    return;
                }
                board[i] = null;
            }
        }

        let emptyCells = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell] = currentPlayer;
        document.querySelector(`[data-index='${randomCell}']`).innerText = currentPlayer;
    } else {
        const move = bestMove();
        board[move] = currentPlayer;
        document.querySelector(`[data-index='${move}']`).innerText = currentPlayer;
    }

    currentPlayer = 'X';
}

//This function handles user clicks on the game cells.
const handleCellClick = (event) => {
    clickSound.play(); //Plays click sound.
    const index = event.target.dataset.index;

    if (board[index] || checkWinner()) return; //Checks for a valid move (if the cell is emppty and the game is still ongoing).

    //Updates the board and UI accordingly.
    board[index] = currentPlayer;
    event.target.innerText = currentPlayer;
    saveGameState();  // Save the game state after each move

    const result = checkWinner(); 

    if (result) {
        //Checks for a winner and updates the scoreboard, potentially calling the AI's move if applicable.
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

//Attaches click event listeners to each cell in the Tic Tac Toe grid, allowing for user interation.
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

//Listens for reset buttin clicks.
getElement("reset").addEventListener('click', () => {   
    resetGame(); //Resets the game.
    localStorage.removeItem('ticTacToeGameState');  //Clears the saved state from localStorage.
});

// Listens for changes to the game mode.
getElement("gameMode").addEventListener('change', (event) => {
    const mode = event.target.value;
    isAIEnabled = mode === 'pvc'; //Updates isAIEnabled based on user selection.
    getElement("difficulty_level").style.display = isAIEnabled ? 'block' : 'none'; //Shows or hides the difficulty section
    getElement("difficulty").value = 'easy';
    resetGame(); //Resets the game.
    saveGameState();  // Save game mode and difficulty to localStorage.
});

// Listens for changes in difficulty settings.
getElement("difficulty").addEventListener('change', (event) => {
    difficulty = event.target.value; //Updates the current difficulty variable.
    resetGame(); //Resets the game.
    saveGameState();  // Save game mode and difficulty to localStorage.
});

document.addEventListener("DOMContentLoaded", loadGameState); //Loads any previously saved game state to continue the game where it left off.