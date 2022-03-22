"use strict";

window.onload = init();

var grid;
var table;
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

    for (let i = 0; i < gridWidth; i++) {
        let row = document.createElement('tr');

        for (let j = 0; j < gridHeight; j++) {
            let num = (i + 1) * (j + 1);

            console.log(`Making square ${i} ${j} ${num}`);

            let square = document.createElement('td');
            square.classList.add('square');
            square.id = `square_${i}_${j}`;
            square.innerHTML = `${num}`;

            row.append(square);
        }

        table.append(row);
    }

    grid.append(table);
}