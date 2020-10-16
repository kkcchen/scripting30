// Connect 4

var cnv = document.getElementById("gameScreen");
var ctx = cnv.getContext('2d');

var pauseMenu = document.getElementById("pauseMenu");
var pauseButton = document.getElementById("resetButton");
var cancel = document.getElementById('cancel');

var info = document.getElementById("info");
var dropSound = new Audio('click.mp3');

var width, height;
var holeSize = 95;
var borderWidth = 30;
var grid;

var turnNumber;
var rowsFilled = 0;
var paused = true;

var pieceColor = 'yellow'
var buttonColor = '#ffa8a8';
var hoverColor = 'red';

document.getElementById("play").addEventListener("click", resetGame);
pauseButton.addEventListener("click", togglePauseGame);
cancel.addEventListener('click', togglePauseGame)
startGame();


// grid of columns: (col, row), bottom to top
// yellow, red, or null

function togglePauseGame() {

    if (!paused) { // then pause
        pauseMenu.style.visibility = "visible";
        pauseButton.style.visibility = "hidden";
        pauseMenu.style.zIndex = "2";
        cancel.style.display = 'block';
        document.getElementById("play").innerHTML = 'Reset';
        paused = true;
    } else { // then unpause
        pauseMenu.style.visibility = "hidden";
        pauseButton.style.visibility = "visible";
        pauseMenu.style.zIndex = "-1";
        paused = false;
    }

}

function infoColor(color) {
    if (color === "red") {
        info.style.color = "red";
        document.body.style.backgroundColor = "white";
    } else if (color === "yellow") {
        info.style.color = "yellow";
        document.body.style.backgroundColor = "gray";
    } else if (color === null) {
        info.style.color = "black";
        document.body.style.backgroundColor = "white";
    }
}

// rechecks and sets board dimensions, clears board data
function resetGame() {
    console.log("reset game");
    turnNumber = 0;
    rowsFilled = 0;
    width = parseInt(document.getElementById("width").value, 10);
    height = parseInt(document.getElementById("height").value,10);
    var totalWidth = width*holeSize;
    var totalHeight = height*holeSize;
    pieceColor = 'yellow'
    buttonColor = '#ffa8a8';
    hoverColor = 'red';
    turnNumber = 0;

    // hide pause menu
    togglePauseGame();

    // show game menu
    info.innerHTML = "Red Turn";
    infoColor("red");
    document.getElementById("mainScreen").style.visibility = "visible";

    cnv.width = String(totalWidth);
    cnv.height = String(totalHeight);

    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // add drop buttons
    var dropButtons = document.getElementById("dropButtons");
    dropButtons.style.visibility = "visible";
    dropButtons.style.width = totalWidth + "px";
    // delete old row
    dropButtons.innerHTML = "";
    // create a row
    dropButtons.style.width = totalWidth + "px";
    // add cells and buttons
    grid = [];
    for (let col = 0; col < width; col++) {
        var btn = document.createElement("BUTTON");
        btn.innerHTML = "Drop Row " + (col+1);
        dropButtons.appendChild(btn);
        btn.setAttribute("id", "col"+col);
        btn.setAttribute("class", "columnButton");
        btn.style.backgroundColor = "#ffa8a8";
        btn.style.width = holeSize*0.8 + "px";

        // also add correct rows to backend array
        grid.push([]);
        for (let row = 0; row < height; row++) {
            grid[col][row] = null;
        }

        // draw blank columns
        drawCol(col);
    }
}

// Adds button eventListeners
function startGame() {
    console.log("start game relaunched");
    

    document.addEventListener('mouseover', function (event) {
        if (!event.target.classList.contains('columnButton')) return;
        event.target.style.backgroundColor = hoverColor;
    })

    document.addEventListener('mouseout', function (event) {
        if (!event.target.classList.contains('columnButton')) return;
        event.target.style.backgroundColor = buttonColor;
    })
    // add event listener
    document.addEventListener('click', function turn(event) {
        if (!event.target.classList.contains('columnButton')) return;

        // set colors, updates info box
        // why colors opposite? because when you click the button once, color 1 drops but now we must display for color 2.
        
        if (turnNumber%2 === 0) {
            buttonColor = "#ffffa8"; //change to yellow
            pieceColor = "red";
            hoverColor = 'yellow';
            info.innerHTML = "Yellow Turn";
            infoColor("yellow");

        } else {
            buttonColor = "#ffa8a8";// change to red
            pieceColor = "yellow";
            hoverColor = 'red';
            info.innerHTML = "Red Turn";
            infoColor("red");
        }

        // change button colors
        document.querySelectorAll(".columnButton").forEach(function(button) {
            button.style.backgroundColor = buttonColor;
        });
        //...except for the one you clicked; that should be active
        event.target.style.backgroundColor = hoverColor;
        console.log("turn "+turnNumber);

        var colSelected = Array.prototype.indexOf.call(dropButtons.children, event.target);
        var filledRow = addPiece(pieceColor, colSelected);
        if (filledRow === height-1) {
            rowsFilled++;
            event.target.style.visibility = "hidden";
        }

        var winningPieces = checkWin(colSelected, filledRow);

        if (winningPieces !== null) { // there is a winner
            var winner = grid[winningPieces[0][0]][winningPieces[0][1]];
            let capitalizedWinner = winner.charAt(0).toUpperCase() + winner.slice(1) + " wins!";
            
            ctx.beginPath();
            ctx.moveTo(winningPieces[0][0] * holeSize + holeSize/2, (height-winningPieces[0][1])*holeSize - holeSize/2);
            ctx.lineTo(winningPieces[3][0] * holeSize + holeSize/2, (height-winningPieces[3][1])*holeSize - holeSize/2);
            ctx.stroke();
            setTimeout(function(){ alert(capitalizedWinner); }, 10);
            // alert(capitalizedWinner)
            info.innerHTML = capitalizedWinner;
            infoColor(winner);

            // hide buttons to prevent further play
            document.getElementById("dropButtons").style.visibility = "hidden";
        } else if (rowsFilled === width) { // draw
            infoColor(null);
            setTimeout(function(){ alert("Game was a draw."); }, 10);
            // alert("Game was a draw.");
            info.innerHTML = "Draw";
        }

        turnNumber++;
        
    })

    
}


// returns fillheight (row) filled to
function addPiece(color, col) {
    // updates backend array
    row = grid[col].indexOf(null);

    if(row != -1) {
        grid[col][row] = color;

        dropSound.currentTime = 0;
        dropSound.play();

        // updates display
        drawCol(col);

        return row;
    }
}

// draws a column of pieces. Draws black if empty
function drawCol(col) {
    currentCol = grid[col];
    var x = holeSize*col + holeSize/2;

    for (let row = 0; row < height; row++) {
        ctx.beginPath();
        ctx.arc(x, ((height-row)*holeSize - holeSize/2), holeSize*0.4, 0, 2 * Math.PI);
        if (currentCol[row] === null) ctx.fillStyle = "black";
        else ctx.fillStyle = currentCol[row];
        ctx.fill();
    }
    
}

// col: column of last piece dropped
// go to the left as far as possible. then go back for the right, checking for 4 of the same
function checkWin(col, row) {
    var color = grid[col][row];
    var inARows = [];

    // checks if testCoord is the color, and if it's in bounds
    function isColor(testCoord) {
        if (testCoord[0] < 0 || testCoord[1] < 0 || testCoord[0] >= width || testCoord[1] >= height) {
            return false;
        }
        return grid[testCoord[0]][testCoord[1]] === color;
    }

    // incrementFunction returns a coord in (col, row) form. takes 0, 1; currentCoord. 0 is down, 1 is up
    // if win, returns array of coords of pieces that won. else returns null
    function checkDirection(incrementFunction) {
        var checking = [col, row];
        inARows = [];
        

        while (checking[0] >= 0 && checking[1] >= 0 && isColor(checking)) {
            checking = incrementFunction(0, checking);
        }

        for (let i = 0; i < 4; i++) {
            checking = incrementFunction(1, checking);
            if (!isColor(checking)) break; // there is a color mismatch within 4 spaces
            inARows.push([checking[0], checking[1]]);
        }

        return inARows;
    }

    // check vertically. changing row, constant column
    currentPieces = checkDirection(function(increment, currentCoord) {
        if (increment === 0) return [currentCoord[0]-1, currentCoord[1]];
        else if (increment === 1) return [currentCoord[0]+1, currentCoord[1]];
        return null;
    });
    if (currentPieces.length === 4) return currentPieces;

    // check horizontally. constant row, change column
    currentPieces = checkDirection(function(increment, currentCoord) {
        if (increment === 0) return [currentCoord[0], currentCoord[1]-1];
        else if (increment === 1) return [currentCoord[0], currentCoord[1]+1];
        return null;
    });
    if (currentPieces.length === 4) return currentPieces;

    //check negative (right down) diagonal. as column adds, row adds
    currentPieces = checkDirection(function(increment, currentCoord) {
        if (increment === 0) return [currentCoord[0]-1, currentCoord[1]-1];
        else if (increment === 1) return [currentCoord[0]+1, currentCoord[1]+1];
        return null;
    });
    if (currentPieces.length === 4) return currentPieces;

    // check positive (right up) slope diagonal. as column adds, row subtracts
    currentPieces = checkDirection(function(increment, currentCoord) {
        if (increment === 0) return [currentCoord[0]-1, currentCoord[1]+1];
        else if (increment === 1) return [currentCoord[0]+1, currentCoord[1]-1];
        return null;
    });
    if (currentPieces.length === 4) return currentPieces;

    console.log("no winner");
    return null;
}
