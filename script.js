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

function init() {
    // Debug
    debug = true;
    myRow = 0;
    myCol = 0;
    myWord = '';
    answer = 'GRAPE';
    backgroundColor = '#e3e0d8';
    nonactiveColor = '#85827A';

    makeGrid(5, 6);
    makeOptions();
}

function makeGrid(gWidth, gHeight) {
    grid = document.getElementById('grid');
    gridWidth = gWidth;
    gridHeight = gHeight;

    debug_log('creating square');
    debug_log(`Width: ${gridWidth}, Height: ${gridHeight}`);

    table = document.createElement('table');
    table.classList.add('grid-table');
    tableStatus = new Object();

    for (let i = 0; i < gridHeight; i++) {
        let row = document.createElement('tr');

        for (let j = 0; j < gridWidth; j++) {
            let num = (i + 1) * (j + 1);

            debug_log(`Making square ${i} ${j} ${num}`);

            let square = document.createElement('td');
            square.classList.add('square');
            square.id = `square_${i}_${j}`;
            //square.innerHTML = `${num}`;
            square.addEventListener('click', squareAction);

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
    optionsStatus = new Object();

    debug_log('creating options');

    let row = document.createElement('div');
    let rowNum = 0;

    row.id = `options_row_${rowNum}`;
    row.classList.add('option-row');
    row.classList.add('container');

    for (let i = 0; i < 26; i++) {
        let letter = String.fromCharCode(i + 'A'.charCodeAt(0));

        debug_log(`Creating option ${i} letter ${letter}`);

        let optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.id = `option_${i}_${letter}`;
        optionElement.innerHTML = letter;
        optionElement.addEventListener('click', optionAction);

        optionsStatus[optionElement.id] = {
            'active': 0,
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
            row.classList.add('container');
        }
    }

    options.append(row);

    row = document.createElement('div');
    row.id = 'options_buttons';
    row.classList.add('container');

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

function squareAction () {
    //setColorFromStatus(this, tableStatus);
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

/*
function setColorFromStatus (eventObj, objStatus) {
    debug_log(`${eventObj.id} was clicked`);

    if (!objStatus[eventObj.id]) return;

    debug_log(objStatus[eventObj.id]);

    let status = objStatus[eventObj.id];
    let element = document.getElementById(eventObj.id);

    switch (status['active']) {
        case 0:
            status['active'] = 1;
            element.style.backgroundColor = firstColor;
            break;
        case 1:
            status['active'] = 2;
            element.style.backgroundColor = secondColor;
            break;
        case 2:
            status['active'] = 0;
            element.style.backgroundColor = backgroundColor;
            break;
    }

    status['color'] = eventObj.style.color;
    status['backgroundColor'] = eventObj.style.backgroundColor;

    debug_log(`Status for ${eventObj.id} has been set to ${status['active']}`);
    debug_log(status);
}
 */

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
    myWord = myWord.substr(1, myWord.length - 1);
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

    let wordStatus = new Object();

    for (let i = 0; i < answer.length; i++) {
        let squareDetail = findSquare(i, myRow);
        if (!squareDetail) continue;

        let correct = myWord.substr(i, 1) === answer.substr(i, 1);
        let almost = answer.includes(myWord.substr(i, 1));

        wordStatus[i] = {
            'try': myWord.substr(i, 1),
            'letter': answer.substr(i, 1),
            'correct': correct,
            'almost': almost
        };

        let squareObj = squareDetail['squareObj'];
        let squareElement = document.getElementById(squareDetail['square']);

        if (almost) squareElement.style.backgroundColor = secondColor;
        if (correct) squareElement.style.backgroundColor = firstColor;
        if (!almost && !correct) squareElement.style.backgroundColor = wrongColor;

        squareObj['backgroundColor'] = squareElement.style.backgroundColor;
    }

    debug_log(`Word Status - Row: ${myRow}`);
    debug_log(wordStatus);

    let buttonStatus = new Object();

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

    if (myRow + 1 >= gridHeight) {
        gridFull = true;
        return;
    }

    myRow++;
    myCol = 0;
    rowFull = false;
    myWord = '';
}

function findSquare (col, row) {
    let squareDetail = null;
    let square;
    let squareObj;
    let squareFound = false;

    for (square in tableStatus) {

        squareObj = tableStatus[square];

        debug_log(`checking ${square}, row ${squareObj['row']} col ${squareObj['col']}`);

        if (!(squareObj['row'] === row && squareObj['col'] === col)) continue;
        squareFound = true;
        break;
    }

    if (!squareFound) {
        debug_log('No open square found');
        return squareDetail;
    }

    squareDetail = new Object();
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

    optionDetail = new Object();
    optionDetail['option'] = optionId;
    optionDetail['optionObj'] = optionObj;

    return optionDetail;
}