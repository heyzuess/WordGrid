"use strict";

window.onload = init();

var grid;
var table;
var tableStatus;
var gridWidth;
var gridHeight;

var options;
var optionsStatus;

var debug;

var myRow;
var myCol;
var myWord;
var answer;

var backgroundColor;
var nonactiveColor;

let firstColor = '#55ea56';
let secondColor = '#fb842c';
let wrongColor = '#242424';

let gridFull = false;
let rowFull = false;
let gridComplete = false;

function init() {
    // Debug
    debug = true;
    myRow = 0;
    myCol = 0;
    myWord = '';
    backgroundColor = '#e3e0d8';
    nonactiveColor = '#85827A';

    makeGrid(5, 6);
    makeOptions();

    answer = randomWord(gridWidth);

    debug_log(`Answer has been set to: ${answer}`);

    if (!answer) {
        debug_log('Failed to choose a random word');
    }
}

function makeGrid(gWidth, gHeight) {
    grid = document.getElementById('grid');
    gridWidth = gWidth;
    gridHeight = gHeight;

    debug_log('creating square');
    debug_log(`Width: ${gridWidth}, Height: ${gridHeight}`);

    table = document.createElement('table');
    table.classList.add('grid-table');
    tableStatus = {};

    for (let i = 0; i < gridHeight; i++) {
        let row = document.createElement('tr');

        for (let j = 0; j < gridWidth; j++) {
            let num = (i + 1) * (j + 1);

            debug_log(`Making square ${i} ${j} ${num}`);

            let square = document.createElement('td');
            square.classList.add('square');
            square.id = `square_${i}_${j}`;

            tableStatus[square.id] = {
                'active': 0,
                'row': i+0,
                'col': j+0,
                'color': `${square.style.color}`,
                'backgroundColor': `${square.style.backgroundColor}`,
                'status': 0,
                'set': false,
                'value': ''
            };

            row.append(square);
        }

        table.append(row);
    }

    grid.append(table);
}

function makeOptions() {
    options = document.getElementById('options');
    optionsStatus = {};

    debug_log('creating options');

    let row = document.createElement('div');
    let rowNum = 0;

    row.id = `options_row_${rowNum}`;
    row.classList.add('option-row');
    row.classList.add('word-container');

    for (let i = 0; i < 26; i++) {
        let letter = String.fromCharCode(i + 'A'.charCodeAt(0));

        debug_log(`Creating option ${i} letter ${letter}`);

        let optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.id = `option_${i}_${letter}`;
        optionElement.innerHTML = letter;
        optionElement.addEventListener('click', optionAction);

        optionsStatus[optionElement.id] = {
            'active': true,
            'letter': letter,
            'row': rowNum,
            'color': optionElement.style.color,
            'backgroundColor': optionElement.style.backgroundColor
        };

        row.append(optionElement);

        debug_log(`Added letter ${letter} to row ${rowNum}`);

        if (i === 9 || i === 18) {
            options.append(row);

            row = document.createElement('div');
            row.id = `options_row_${++rowNum}`;
            row.classList.add('option-row');
            row.classList.add('word-container');
        }
    }

    options.append(row);

    row = document.createElement('div');
    row.id = 'options_buttons';
    row.classList.add('word-container');

    let deleteButton = document.createElement('button');
    deleteButton.classList.add('option-button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.addEventListener('click', deleteLast);

    let enterButton = document.createElement('button');
    enterButton.classList.add('option-button');
    enterButton.innerHTML = 'Enter';
    enterButton.addEventListener('click', tryAnswer);

    row.append(deleteButton);
    row.append(enterButton);

    options.append(row);
}

function setActiveRow (row) {
    if (row < 0 || row > gridHeight) return;

    for (let squareId in tableStatus) {
        let squareObj = tableStatus[squareId];
        let squareElement = document.getElementById(squareId);

        squareElement.style.backgroundColor = squareObj['row'] === row ? backgroundColor : nonactiveColor;
        squareObj['backgroundColor'] = squareElement.style.backgroundColor;
    }
}

function optionAction () {
    //setColorFromStatus(this, optionsStatus);

    if (gridFull) {
        debug_log('Grid is full, can not set another option action');
        return;
    }

    if (rowFull) {
        debug_log('Row is full, can not set another option action');
        return;
    }

    if (gridComplete) {
        debug_log('Grid is complete, can not set another option action');
        return;
    }

    if (!optionsStatus[this.id]['active']) {
        debug_log('Option is disabled, can not select this value');
        return;
    }

    let squareDetail = findSquare(myCol, myRow);
    if (!squareDetail) return;

    let square = squareDetail['square'];
    let squareObj = squareDetail['squareObj'];

    debug_log('Open square found:');
    debug_log(square);

    debug_log('Square data:');
    debug_log(tableStatus[square]);

    let squareElement = document.getElementById(square);

    if (!squareElement) return;

    squareElement.innerHTML = this.innerHTML;
    squareObj['value'] = this.innerHTML;
    squareObj['set'] = true;

    myCol = squareObj['col'] + 1;
    myWord += squareObj['value'];

    if (myCol >= gridWidth) {
        rowFull = true;
    }

    debug_log(`New - Col: ${myCol} Row: ${myRow}`);
    debug_log(`New - RowFull: ${rowFull} GridFull: ${gridFull}`);
    debug_log(`Current Word: ${myWord}`);
}

function debug_log (message) {
    if (!debug) return;
    console.log(message);
}

function deleteLast () {
    if (myCol === 0) {
        debug_log('Col is 0, can not delete last');
        return;
    }

    let squareDetails = findSquare(myCol - 1, myRow);

    if (!squareDetails) return;

    let square = squareDetails['square'];
    let squareObj = squareDetails['squareObj'];
    let squareElement = document.getElementById(square);

    squareElement.innerHTML = '';
    squareObj['value'] = squareElement.innerHTML;
    squareObj['set'] = false;

    myCol--;
    rowFull = false;
    myWord = myWord.substr(0, myWord.length - 1);
}

function tryAnswer () {
    if (!rowFull) {
        debug_log('Row is not full, can not try answer');
        return;
    }

    if (gridFull) {
        debug_log('Grid is full, can not try new attempt');
        return;
    }

    if (answer.length !== myWord.length) {
        debug_log('Word lengths do not match');
        return;
    }

    let wordStatus = {};
    let letterCount = {};
    let answerArray = answer.split("");

    for (let i = 0; i < answerArray.length; i++) {
        if (!letterCount[answerArray[i]])
        letterCount[answerArray[i]] = {
            'count': 0,
            'correct': 0,
            'almost': 0
        }

        letterCount[answerArray[i]]['count']++;
    }

    /* Checks which tiles are correct, partially correct, and incorrect
       and creates a count to hold this data for coloring of the tiles */
    for (let i = 0; i < answer.length; i++) {
        let squareDetail = findSquare(i, myRow);
        let myLetter = myWord.substr(i, 1);
        let answerLetter = answer.substr(i, 1);
        if (!squareDetail) continue;

        let correct = myLetter === answerLetter;

        if (correct) letterCount[myLetter]['correct']++;

        let almost = answer.includes(myLetter);

        if (almost) letterCount[myLetter]['almost']++;

        wordStatus[i] = {
            'try': myLetter,
            'letter': answerLetter,
            'correct': correct,
            'almost': almost
        };

        let squareObj = squareDetail['squareObj'];
        let backgroundStyle = backgroundColor;

        if (almost) backgroundStyle = secondColor;
        if (correct) backgroundStyle = firstColor;
        if (!almost && !correct) backgroundStyle = wrongColor;

        squareObj['backgroundColor'] = backgroundStyle;
    }

    /* Sets the colors of the letter tiles depending on the counts
       obtained from the above loop */
    for (let i = answer.length - 1; i >= 0; i--) {
        let squareDetail = findSquare(i, myRow);
        let myLetter = myWord.substr(i, 1);
        let squareObj = squareDetail['squareObj'];
        let squareElement = document.getElementById(squareDetail['square']);

        if (answer.includes(myLetter)) {
            debug_log(`  count: ${letterCount[myLetter]['count']}`);
            debug_log(`correct: ${letterCount[myLetter]['correct']}`);
            debug_log(` almost: ${letterCount[myLetter]['almost']}`);
        }

        if (squareObj['backgroundColor'] === secondColor) {
            if (letterCount[myLetter]['almost'] >
                letterCount[myLetter]['count'] - letterCount[myLetter]['correct']) {

                debug_log(`changing letter ${myLetter} col ${i} to (wrongcolor):${wrongColor}`);

                squareObj['backgroundColor'] = wrongColor;
            }
        }

        /* If the tile is marked wrong and the letter guessed is not found in
           the answer then set the option tile inactive */
        if (squareObj['backgroundColor'] === wrongColor) {
            if (!answer.includes(myLetter)) {
                let myOptionDetail = findOption(myLetter);
                optionsStatus[myOptionDetail['option']]['active'] = false;
            }
        }

        squareElement.style.backgroundColor = squareObj['backgroundColor'];
    }

    debug_log(`Word Status - Row: ${myRow}`);
    debug_log(wordStatus);

    /* Colors the options buttons depending on what was
       correct, partially correct, incorrect */
    let buttonStatus = {};

    for (let tryId in wordStatus) {
        let tryDetail = wordStatus[tryId];

        let optionDetail = findOption(tryDetail['try']);
        if (!optionDetail) continue;

        let optionElement = document.getElementById(optionDetail['option']);
        let optionObject = optionDetail['optionObj'];

        debug_log('Try Details:');
        debug_log(tryDetail);
        debug_log(optionElement.style.backgroundColor);
        debug_log(firstColor);
        debug_log(secondColor);
        debug_log(wrongColor);

        if (tryDetail['almost']) {
            if (!buttonStatus[optionObject['letter']]) optionElement.style.backgroundColor = secondColor;
        }

        if (tryDetail['correct']) {
            optionElement.style.backgroundColor = firstColor;
            buttonStatus[optionObject['letter']] = true;
        }

        if (!tryDetail['almost'] && !tryDetail['correct']) {
            if (!tryDetail['correct']) optionElement.style.backgroundColor = wrongColor;
        }

        optionObject['backgroundColor'] = optionElement.style.backgroundColor;
    }

    /* Check if all tiles are correct */
    let correct = 0;
    let length = 0;
    for (let letter in letterCount) {
        if (letterCount[letter]['count'] === letterCount[letter]['correct']) correct++;
        length++;
    }

    gridComplete = correct === length;
    if (gridComplete) {
        debug_log(`Grid Complete: ${gridComplete}`);
        displayResult(true);
        return;
    }

    gridFull = myRow + 1 >= gridHeight;
    if (gridFull) {
        debug_log(`Grid Full: ${gridFull}`);
        displayResult(false);
        return;
    }

    /*  Increment row count for next guess */
    myRow++;
    myCol = 0;
    rowFull = false;
    myWord = '';
}

function randomWord (wordLength) {
    let word;

    let randomLetter = Math.random() * 26;
    let wordLetter = String.fromCharCode('A'.charCodeAt(0) + randomLetter);
    let wordFile = `./data/${wordLetter}word.csv`;

    let results = loadFile(wordFile).split(' ');

    debug_log(`Random letter selected: ${wordLetter}`);
    debug_log(`Word file to read from: ${wordFile}`);
    debug_log(`results text type: ${typeof resultsText}`);

    let list = [];

    /* Filter results down to words that match length */
    for (let r in results) {
        let temp = results[r].trim();

        if (temp.length !== wordLength) continue;

        //debug_log(`random word -- length ok -- ${temp} -- ${temp.length}`);

        /* Check each letter to make sure its >= A and <= Z */
        let ok = false;
        let check = 0;

        for (let i = 0; i < temp.length; i++) {
            let myLetter = temp.substr(i, 1);
            if ((myLetter >= 'A' && myLetter <= 'Z') ||
                (myLetter >= 'a' && myLetter <= 'z')) check++;
        }

        ok = check === temp.length;

        /* Add word to list if it's all ok */
        if (ok) {
            //debug_log(`random word -- word added ${temp} length ${temp.length}`);
            list.push(temp);
        } else {
            //debug_log(`random word -- check fail ${temp} length ${temp.length} count ${check}`);
        }
    }

    /* Select random word from list */
    let randomWord = Math.trunc(Math.random() * list.length);
    word = list[randomWord].toUpperCase();

    debug_log(`selected entry ${randomWord} from word list: ${word}`);

    return word;
}

function loadFile(filePath) {
    let result = null;
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();

    if (xmlhttp.status === 200) {
        debug_log(`File ${filePath} loaded successfully`);
        result = xmlhttp.responseText;
    } else {
        debug_log(`Read file request returned unhandled response ${xmlhttp.status}`);
    }
    return result;
}

function findSquare (col, row) {
    let squareDetail = null;
    let square;
    let squareObj;
    let squareFound = false;

    for (square in tableStatus) {

        squareObj = tableStatus[square];

        //debug_log(`checking ${square}, row ${squareObj['row']} col ${squareObj['col']}`);

        if (!(squareObj['row'] === row && squareObj['col'] === col)) continue;
        squareFound = true;
        break;
    }

    if (!squareFound) {
        debug_log('No open square found');
        return squareDetail;
    }

    squareDetail = {};
    squareDetail['square'] = square;
    squareDetail['squareObj'] = squareObj;

    return squareDetail;
}

function findOption (letter) {
    let optionDetail = null;
    let optionFound = false;
    let optionObj;
    let optionId;

    for (optionId in optionsStatus) {
        optionObj = optionsStatus[optionId];

        if (optionObj['letter'] === letter) {
            optionFound = true;
            break;
        }
    }

    if (!optionFound) {
        return optionDetail;
    }

    optionDetail = {};
    optionDetail['option'] = optionId;
    optionDetail['optionObj'] = optionObj;

    return optionDetail;
}

function displayResult (gameWin) {
    let message = gameWin ? 'Congratulations!' : `Sorry, better luck next time!\nWord was ${answer}`;
    window.alert(message);
}