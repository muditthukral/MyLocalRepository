var cxt;
var cxtPreview;

var unitSize = 30;
var numColumns = 15;
var numRows = 30;
var unitPadding = 3;
var blockSize = 4;

var heap;
var block;
var nextBlock;
var block_x;
var block_y;

var timerSleep = 300;
var myTimer;

var color_completeLine = "#000";
var color_heap = "#bbb";
var color_block = "#f00";
var color_nextBlock = "#0b0";
var color1_block = "#f00";
var color2_block = "#0b0";
var color3_block = "#00f";
var color4_block = "#aa0";
var color5_block = "#0aa";

var x = 0;
var y = 0;

var linesCompleted = 0;
var score = 0;
var level = 0;

var lblLines;
var lblScore;
var lblLevel;

var isPaused = false;

function initialize() {
    cxt = document.getElementById('myCanvas').getContext('2d');
    cxtPreview = document.getElementById('myCanvasPreview').getContext('2d');
    lblLines = document.getElementById('lblLinesCompleted');
    lblScore = document.getElementById('lblScore');
    lblLevel = document.getElementById('lblLevel');

    linesCompleted = 0;
    score = 0;
    level = 0;
    timerSleep = 300;

    lblLines.textContent = 0;
    lblScore.textContent = 0;
    lblLevel.textContent = 1;

    block = new Array(blockSize);
    for (var i = 0; i < blockSize; i++) {
        block[i] = new Array(blockSize);
        for (var j = 0; j < blockSize; j++) {
            block[i][j] = false;
        }
    }

    heap = new Array(numColumns);
    for (i = 0; i < numColumns; i++) {
        heap[i] = new Array(numColumns);
        for (j = 0; j < numRows; j++) {
            heap[i][j] = false;
        }
    }

    nextBlock = new Array(blockSize);
    for (var i = 0; i < blockSize; i++) {
        nextBlock[i] = new Array(blockSize);
        for (var j = 0; j < blockSize; j++) {
            nextBlock[i][j] = false;
        }
    }
    document.onkeydown = checkKey;

    clearAll();

    generateNextBlock();
    changeBlock();
    drawHeap();
    drawBlock();

    resetTimer();
}


function checkKey(e) {

    if (isPaused == true) { return; }

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
    }
    else if (e.keyCode == '40') {
        // down arrow
        moveDown();
    }
    else if (e.keyCode == '37') {
        // left arrow
        moveLeft();
    }
    else if (e.keyCode == '39') {
        // right arrow
        moveRight();
    }

    else if (e.keyCode == '32') {
        // right arrow
        rotateLeft();
    }

}

function resetTimer() {
    isPaused = false;
    window.clearInterval(myTimer)
    myTimer = setInterval(function () { moveDown() }, timerSleep);
}

function drawHeap() {
    cxt.fillStyle = color_heap;

    for (var i = 0; i < numColumns; i++) {
        for (var j = 0; j < numRows; j++) {
            if (heap[i][j] == true) {
                x = unitSize * i + unitPadding * (i + 1);
                y = unitSize * j + unitPadding * (j + 1);
                cxt.fillRect(x, y, unitSize, unitSize);
            }
        }
    }
}

function clearHeap() {
    cxt.fillStyle = color_heap;

    for (var i = 0; i < numColumns; i++) {
        for (var j = 0; j < numRows; j++) {
            if (heap[i][j] == true) {
                x = unitSize * i + unitPadding * (i + 1);
                y = unitSize * j + unitPadding * (j + 1);
                cxt.clearRect(x, y, unitSize, unitSize);
            }
        }
    }
}

function clearAll() {
    cxt.fillStyle = color_heap;

    for (var i = 0; i < numColumns; i++) {
        for (var j = 0; j < numRows; j++) {
            x = unitSize * i + unitPadding * (i + 1);
            y = unitSize * j + unitPadding * (j + 1);
            cxt.clearRect(x, y, unitSize, unitSize);
        }
    }
}

function drawBlock() {
    cxt.fillStyle = color_block;

    for (var i = block_x; i < block_x + blockSize; i++) {
        for (var j = block_y; j < block_y + blockSize; j++) {
            if (block[i - block_x][j - block_y] == true) {
                x = unitSize * i + unitPadding * (i + 1);
                y = unitSize * j + unitPadding * (j + 1);
                cxt.fillRect(x, y, unitSize, unitSize);
            }
        }
    }
}

function clearBlock() {
    cxt.fillStyle = color_block;

    for (var i = block_x; i < block_x + blockSize; i++) {
        for (var j = block_y; j < block_y + blockSize; j++) {
            if (block[i - block_x][j - block_y] == true) {
                x = unitSize * i + unitPadding * (i + 1);
                y = unitSize * j + unitPadding * (j + 1);
                cxt.clearRect(x, y, unitSize, unitSize);
            }
        }
    }
}

function moveDown() {
    if (canMoveDown()) {
        clearBlock();
        block_y += 1;
        drawBlock();
    }
    else {
        freeze();
    }
}

function moveLeft() {
    if (canMoveLeft()) {
        clearBlock();
        block_x -= 1;
        drawBlock();
    }
}

function moveRight() {
    if (canMoveRight()) {
        clearBlock();
        block_x += 1;
        drawBlock();
    }
}

function rotateLeft() {
    var oldBlock = block;

    var newBlock = new Array(blockSize);
    for (var i = 0; i < blockSize; i++) {
        newBlock[i] = new Array(blockSize);
        for (var j = 0; j < blockSize; j++) {
            newBlock[i][j] = block[blockSize - j - 1][i];
        }
    }
    newBlock = trimTopAndLeft(newBlock);

    if (canRotate(newBlock)) {
        clearBlock();
        block = newBlock;
        drawBlock();
    }
}

function rotateRight() {
    var oldBlock = block;

    var newBlock = new Array(blockSize);
    for (var i = 0; i < blockSize; i++) {
        newBlock[i] = new Array(blockSize);
        for (var j = 0; j < blockSize; j++) {
            newBlock[i][j] = block[j][blockSize - i - 1];
        }
    }
    newBlock = trimTopAndLeft(newBlock);

    if (canRotate(newBlock)) {
        clearBlock();
        block = newBlock;
        drawBlock();
    }
}

function canRotate(newBlock) {
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (block_x + i >= numColumns && newBlock[i][j] == true) {
                return false;
            }
            if (block_y + j >= numRows && newBlock[i][j] == true) {
                return false;
            }
            if (block_x + i < numColumns && block_y + j < numRows) {
                if ((heap[block_x + i][block_y + j] == true) && newBlock[i][j] == true) {
                    return false;
                }
            }
            else {
                if (newBlock[i][j] == true)
                    return false;
            }
        }
    }

    return true;
}

function trimTopAndLeft(newBlock) {
    var trimTop = true;
    var trimLeft = true;

    do {
        var justtry = readBlock();

        for (var i = 0; i < blockSize; i++) {
            if (newBlock[i][0] == true) {
                trimTop = false;
            }
            if (newBlock[0][i] == true) {
                trimLeft = false;
            }
        }

        if (trimLeft == false && trimTop == false) {
            break;
        }

        if (trimLeft == true) {
            for (var i = 1; i < blockSize; i++) {
                for (var j = 0; j < blockSize; j++) {
                    newBlock[i - 1][j] = newBlock[i][j];
                }
                justtry = readBlock();
            }
        }
        justtry = readBlock();
        if (trimTop == true) {
            for (var i = 0; i < blockSize; i++) {
                for (var j = 1; j < blockSize; j++) {
                    newBlock[i][j - 1] = newBlock[i][j];
                }
                justtry = readBlock();
            }
        }
        justtry = readBlock();
        for (var i = 0; i < blockSize; i++) {
            if (trimLeft == true) {
                newBlock[blockSize - 1][i] = false;
            }
            if (trimTop == true) {
                newBlock[i][blockSize - 1] = false;
            }
        }

        justtry = readBlock();
    } while (trimLeft == true || trimTop == true);

    return newBlock;
}

function readBlock() {
    var s = "";
    for (var i = 0; i < blockSize; i++) {
        s += "\n";
        for (var j = 0; j < blockSize; j++) {
            s += (block[j][i] == true ? 1 : 0) + " ";
        }
    }
    return s;
}

function readHeap() {
    var s = "";
    for (var i = 0; i < numColumns; i++) {
        s += "\n";
        for (var j = 0; j < numRows; j++) {
            s += (heap[j][i] == true ? 1 : 0) + " ";
        }
    }
    return s;
}

function canMoveLeft() {
    if (block_x == 0) {
        return false;
    }
    if (block_x > 0) {
        for (var i = 0; i < blockSize; i++) {
            for (var j = 0; j < blockSize; j++) {
                if (block_x + i - 1 < numColumns && block_y + j < numRows) {
                    if ((heap[block_x + i - 1][block_y + j] == true) && block[i][j] == true) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function canMoveRight() {
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (block_x + 1 + i >= numColumns && block[i][j] == true) {
                return false;
            }
            if (block_x + 1 + i < numColumns && block_y + j < numRows) {
                if ((heap[block_x + 1 + i][block_y + j] == true) && block[i][j] == true) {
                    return false;
                }
            }
        }
    }

    return true;
}

function canMoveDown() {
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (block_y + 1 + j >= numRows && block[i][j] == true) {
                return false;
            }
            if (block_y + 1 + j < numRows && block_x + i < numColumns) {
                if ((heap[block_x + i][block_y + 1 + j] == true) && block[i][j] == true) {
                    return false;
                }
            }
        }
    }

    return true;
}

function freeze() {
    clearHeap();
    clearBlock();

    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (block[i][j] == true) {
                heap[block_x + i][block_y + j] = true;
            }
        }
    }

    changeBlock();
    drawHeap();
    drawBlock();

    removeCompleteLines();
    checkGameOver();
}

function changeBlock() {
    block_x = 5;
    block_y = 0;

    block = nextBlock;
    color_block = color_nextBlock;
    generateNextBlock();
}

function generateNextBlock() {
    document.getElementById('startButton').blur();

    clearNextBlock();

    var randomBlockType = Math.floor(Math.random() * 7 + 1);


    nextBlock = new Array(blockSize);
    for (var i = 0; i < blockSize; i++) {
        nextBlock[i] = new Array(blockSize);
        for (var j = 0; j < blockSize; j++) {
            nextBlock[i][j] = false;
        }
    }

    switch (randomBlockType) {
        case 1: //square
            nextBlock[0][0] = true;
            nextBlock[0][1] = true;
            nextBlock[1][0] = true;
            nextBlock[1][1] = true;
            break;
        case 2: //bar
            nextBlock[0][0] = true;
            nextBlock[1][0] = true;
            nextBlock[2][0] = true;
            nextBlock[3][0] = true;
            break;
        case 3: //L
            nextBlock[0][0] = true;
            nextBlock[1][0] = true;
            nextBlock[2][0] = true;
            nextBlock[2][1] = true;
            break;
        case 4: //mirror-L
            nextBlock[2][0] = true;
            nextBlock[1][0] = true;
            nextBlock[0][0] = true;
            nextBlock[0][1] = true;
            break;
        case 5: //Z
            nextBlock[0][0] = true;
            nextBlock[1][0] = true;
            nextBlock[1][1] = true;
            nextBlock[2][1] = true;
            break;
        case 6: //mirror-Z
            nextBlock[2][0] = true;
            nextBlock[1][0] = true;
            nextBlock[1][1] = true;
            nextBlock[0][1] = true;
            break;
        case 7: //T
            nextBlock[0][0] = true;
            nextBlock[1][0] = true;
            nextBlock[2][0] = true;
            nextBlock[1][1] = true;
            break;
    }

    var nextBlockColor = Math.floor(Math.random() * 5 + 1);
    switch (nextBlockColor) {
        case 1:
            color_nextBlock = color1_block;
            break;
        case 2:
            color_nextBlock = color2_block;
            break;
        case 3:
            color_nextBlock = color3_block;
            break;
        case 4:
            color_nextBlock = color4_block;
            break;
        case 5:
            color_nextBlock = color5_block;
            break;
    }

    drawNextBlock();
}


function drawNextBlock() {
    cxtPreview.fillStyle = color_nextBlock;

    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (nextBlock[i][j] == true) {
                x = unitSize * i + unitPadding * (i + 1);
                y = unitSize * j + unitPadding * (j + 1);
                cxtPreview.fillRect(x, y, unitSize, unitSize);
            }
        }
    }
}

function clearNextBlock() {
    cxtPreview.fillStyle = color_nextBlock;

    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            x = unitSize * i + unitPadding * (i + 1);
            y = unitSize * j + unitPadding * (j + 1);
            cxtPreview.clearRect(x, y, unitSize, unitSize);
        }
    }
}

function removeCompleteLines() {

    var linesToBeCleared;
    var isCurrentLineComplete = true;

    do {
        linesToBeCleared = new Array();

        for (var j = 0; j < numRows; j++) {
            isCurrentLineComplete = true;

            for (var i = 0; i < numColumns; i++) {
                if (heap[i][j] != true) {
                    isCurrentLineComplete = false;
                    break;
                }
            }

            if (isCurrentLineComplete == true) {
                linesToBeCleared.push(j);
            }
        }

        if (linesToBeCleared.length > 0) {
            window.clearInterval(myTimer);

            showCompletedLines(linesToBeCleared);

            linesCompleted += linesToBeCleared.length;
            score += 10 * linesToBeCleared.length;

            if (linesToBeCleared.length == 2)
                score += 5;

            if (linesToBeCleared.length == 3)
                score += 10;

            if (linesToBeCleared.length == 4)
                score += 20;

            level = Math.floor(linesCompleted / 5) + 1;

            lblLines.textContent = linesCompleted;
            lblScore.textContent = score;
            lblLevel.textContent = level;

            timerSleep = 300 - (level * 50);

            window.setTimeout(clearCompleteLinesWithDelay(linesToBeCleared), 2000);
        }

    } while (linesToBeCleared.length > 0);
}

function showCompletedLines(linesToBeCleared) {
    cxt.fillStyle = color_completeLine;

    for (var j = 0; j < numRows; j++) {
        if (linesToBeCleared.indexOf(j) >= 0) {
            for (var i = 0; i < numColumns; i++) {
                x = unitSize * i + unitPadding * (i + 1);
                y = unitSize * j + unitPadding * (j + 1);
                cxt.fillRect(x, y, unitSize, unitSize);
            }
        }
    }

    cxt.fillStyle = color_heap;
}

function clearCompleteLinesWithDelay(linesToBeCleared) {

    clearHeap();

    var newHeap = new Array(numColumns);
    for (i = 0; i < numColumns; i++) {
        newHeap[i] = new Array(numColumns);
        for (j = 0; j < numRows; j++) {
            newHeap[i][j] = false;
        }
    }

    var row = numRows - 1;

    for (j = row; j >= 0; j--) {
        if (linesToBeCleared.indexOf(row) >= 0) {
            row--;
            if (row == -1) {
                break;
            }
        }

        for (i = 0; i < numColumns; i++) {
            newHeap[i][j] = heap[i][row];
        }
        row--;
    }

    heap = newHeap;

    drawHeap();
    resetTimer();

}

function checkGameOver() {
    var isOver = false;

    for (var i = 0; i < numColumns; i++) {
        if (heap[i][0] == true) {
            isOver = true;
            break;
        }
    }

    if (isOver == true) {
        alert('Game Over, well played!\nYour total score=' + score);
        pause();
        clearAll();
    }
}

function pause() {
    isPaused = true;
    window.clearInterval(myTimer)
}