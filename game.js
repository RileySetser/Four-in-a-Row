const turnText = document.getElementById(`playerTurn`);

const startSection = document.getElementById(`startSection`);
const playerSelection = document.getElementById(`playerSelect`);
const player = document.getElementById(`players`);

const restartButton = document.getElementById(`restart`);

var config = {
    width: 650,
    height: 550,
    type: Phaser.AUTO,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var board = new Array(6); // Board variable to keep track of available slots.
var xList = [31, 115, 199, 283, 367, 451, 535];
var yList = [23, 107, 191, 275, 359, 443];
var enemyTurn = false;
var gameDone = false;
var singlePlayer = true;
var piece;
var hasControl = false;
var timeout = 0;
var game = new Phaser.Game(config);

function preload() {
    this.load.image('bg-color', 'assets/bg_color.png');
    this.load.image('background', 'assets/background.png');
    this.load.image('red', 'assets/red2.png');
    this.load.image('yellow', 'assets/yellow2.png');
}

function initBoard() {  // initalize the board coordinates.
    for (var i = 0; i < 6; i++) {
        board[i] = [0, 0, 0, 0, 0, 0, 0];
    }
}

function getSections(board) {
    var sections = new Array();
    // horizontal sections
    for (var j = 0; j < 4; j++){
        for (var i = 0; i<6; i++) {
            sections.push([board[i][j], board[i][j+1], board[i][j+2], board[i][j+3]]);
        }
    }
    // vertical sections
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 7; j++) {
            sections.push([board[i][j], board[i+1][j], board[i+2][j], board[i+3][j]]);
        }
    }
    // forward-diagonal
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 4; j++) {
            sections.push([board[i][j], board[i+1][j+1], board[i+2][j+2], board[i+3][j+3]]);
        }
    }
    // backward-diagonal
    for (var i = 3; i < 6; i++) {
        for (var j = 0; j < 4; j++) {
            sections.push([board[i][j], board[i-1][j+1], board[i-2][j+2], board[i-3][j+3]]);
        }
    }

    return sections; 
}

function isWinner(board, player) {
    var sections = getSections(board);
    for (i = 0; i < sections.length; i++) {
        var possible = true;
        for (j = 0; j < 4; j++) {
            if (sections[i][j] != player) {
                possible = false;
            }
        }
        if (possible) return true;
    }
    return false;
}

function boardFull(board) {
    for (var j = 0; j < 7; j++) {
        if (board[0][j] == 0) return false;
    }
    return true;
}

// AI code created by iammanish17
function sectionScore(section, player) {    
    // Assigns a score to a section based on how likely player is to win/lose
    var score = 0;          
    var selfCount = 0,      
        opponentCount = 0,  
        empty = 0;          

    for (var i = 0; i < 4; i++) {   
        if (section[i] == player) selfCount++;             
        else if (section[i] == 3 - player) opponentCount++; 
        else empty++;                                       
    }

    if (selfCount == 4) score += 100;                   
    if (selfCount == 3 && empty == 1) score += 5;       
    if (selfCount == 2 && empty == 2) score += 2;       
    if (opponentCount == 3 && empty == 1) score -= 4;   

    return score;
}

function getScore(board, player) {  
    // Function to assign a score to a board
    var score = 0;
    var sections = getSections(board);

    for (var i = 0; i < sections.length; i++)  
        score += sectionScore(sections[i], player);    

    for (var i = 0; i < 6; i++)     
        if (board[i][3] == player) score += 3; 

    return score;
}

function miniMax(board, depth, alpha, beta, player) {
    // Minimax Algorithm for AI to recursively find an optimal move
    if (isWinner(board, 2)) return [-1, 99999999];
    if (isWinner(board, 1)) return [-1, -99999999];
    if (boardFull(board)) return [-1, 0];
    if (depth == 0) return [-1, getScore(board, 2)];

    if (player == 2) {
        // Maximizing player
        var value = Number.NEGATIVE_INFINITY;
        var col = -1;
        for (var i = 0; i < 7; i++) {
            if (board[0][i] == 0) {
                var boardCopy = new Array(6);
                for (var k = 0; k < board.length; k++)
                    boardCopy[k] = board[k].slice();
                var j = 5;
                for (j; j >= 0; j--) {
                    if (boardCopy[j][i] == 0)
                        break;
                }
                boardCopy[j][i] = player;
                var newScore = miniMax(boardCopy, depth - 1, alpha, beta, 3 - player)[1];
                if (newScore > value) {
                    value = newScore;
                    col = i;
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break;
            }
        }
        return [col, value];
    } else {
        // Minimizing player
        var value = Number.POSITIVE_INFINITY;
        var col = -1;
        for (var i = 0; i < 7; i++) {
            if (board[0][i] == 0) {
                var boardCopy = new Array(6);
                for (var k = 0; k < board.length; k++)
                    boardCopy[k] = board[k].slice();
                var j = 5;
                for (j; j >= 0; j--) {
                    if (boardCopy[j][i] == 0)
                        break;
                }
                boardCopy[j][i] = player;
                var newScore = miniMax(boardCopy, depth - 1, alpha, beta, 3 - player)[1];
                if (newScore < value) {
                    value = newScore;
                    col = i;
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) break;
            }
        }
        return [col, value];
    }
}
// End of AI code

function create() {
    initBoard();
    bg_color = this.add.sprite(0, 0, 'bg-color').setOrigin(0,0); 
    bg = this.add.sprite(325, 275, 'background'); 
}

playerSelection.addEventListener('submit', function(event) {
    event.preventDefault();
    if (player.value == 'single'){
        singlePlayer = true;
    } else if (player.value == 'multi'){
        singlePlayer = false;
    }
    turnText.removeAttribute('hidden');
    restartButton.removeAttribute('hidden');
    hasControl = true;
    startSection.setAttribute('hidden', 'true')
})

restartButton.addEventListener('click', function() {
    game.scene.stop('default');
    game.scene.start('default');
    gameDone = false;
    enemyTurn = false;
})

function update() {
    var pieceColor;
    var playerValue;
    game.canvas.style.cursor = "default";
    timeout--;

    if (gameDone) return;

    if (enemyTurn) {
        pieceColor = 'yellow';
        playerValue = 2;
        turnText.textContent = "Player 2's Turn";
    } else {
        pieceColor = 'red';
        playerValue = 1;
        turnText.textContent = "Player 1's Turn";
    }

    if (timeout <= 0 && hasControl) {
        // finding the player's cursor
        var mouse = this.input.activePointer;
        var column = -1;
        var xpos = mouse.worldX;
        var ypos = mouse.worldY;
        if (enemyTurn && singlePlayer) {
            var move = miniMax(board, 5, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 2)[0];
            console.log(move);
            for (i = 5; i >= 0; i--) {
                if (board[i][move] == 0) {
                    board[i][move] = playerValue;
                    piece = this.add.sprite(xList[move], yList[i], pieceColor).setOrigin(0,0);
                    timeout = 35;
                    enemyTurn = !enemyTurn;
                    break;
                }
            }
        }
        for (var i = 0; i < 7; i++) {
            var dist = xpos - xList[i];
            if (0 <= dist && dist <= 83 && 23 <= ypos && ypos <= 527) {
                game.canvas.style.cursor = "pointer";
                column = i;
                break;
            }
        }

        if (column != -1 && mouse.primaryDown) {
            for (i = 5; i >= 0; i--) {
                if (board[i][column] == 0) {
                    board[i][column] = playerValue;
                    piece = this.add.sprite(xList[column], yList[i], pieceColor).setOrigin(0,0);
                    timeout = 35;
                    enemyTurn = !enemyTurn;
                    console.log(`${enemyTurn}, ${pieceColor}, ${playerValue}`);
                    break;
                }
            }
        }


        if (isWinner(board, playerValue)) {
            turnText.textContent = `Player ${playerValue} is the Winner!!`;
            gameDone = true;
        } else if (boardFull(board)) {
            turnText.textContent = `Draw!`;
            gameDone = true;
        }
    }
}