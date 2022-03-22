"use strict";

window.onload = init();

var grid;
var table;
var tableStatus;
var gridWidth;
var gridHeight;

function init() {
    grid = document.getElementById('grid');
    gridWidth = 5;
    gridHeight = 5;

    console.log('creating square');
    console.log(`Width: ${gridWidth}, Height: ${gridHeight}`);

    table = document.createElement('table');
    table.classList.add('grid-table');
    tableStatus = new Object();

    for (let i = 0; i < gridWidth; i++) {
        let row = document.createElement('tr');

        for (let j = 0; j < gridHeight; j++) {
            let num = (i + 1) * (j + 1);

            console.log(`Making square ${i} ${j} ${num}`);

            let square = document.createElement('td');
            square.classList.add('square');
            square.id = `square_${i}_${j}`;
            square.innerHTML = `${num}`;
            square.addEventListener('click', squareAction);

            tableStatus[square.id] = {
                'active': false,
                'color': 'black',
                'background-color': 'white'
            };

            row.append(square);
        }

        table.append(row);
    }

    grid.append(table);
}

function squareAction () {
    console.log(`${this.id} was clicked`);
}