import { Universe, Cell } from "wasm-life";
import { memory } from "wasm-life/wasm_life_bg";

const CELL_SIZE_PX = 5;
const GRID_COLOR = "#gggggg";
const HOVER_COLOR = "#00ff00";
const DEAD_COLOR = "#5a5a68";
const ALIVE_COLOR = "#ffffff";
const UPDATE_INTERVAL = 100;

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

const canvas = document.getElementById("life-canvas");
canvas.height = (CELL_SIZE_PX + 1) * height + 1;
canvas.width = (CELL_SIZE_PX + 1) * width + 1;

const ctx = canvas.getContext('2d');
let mouseOnCanvas = false;
let mouseX = 0;
let mouseY = 0;

const getIndex = (row, column) => {
    return row * width + column;
}

const registerCanvasEvents = function() {
    canvas.addEventListener('mouseover', function(event) {
        mouseOnCanvas = true;
    });
    canvas.addEventListener('mouseout', function(event) {
        mouseOnCanvas = false;
    });
    canvas.addEventListener('mousemove', function(event) {
        var x = event.offsetX,
            y = event.offsetY;
    
        x = Math.floor(x / (CELL_SIZE_PX + 1));
        y = Math.floor(y / (CELL_SIZE_PX + 1));
        if (x === mouseX && y === mouseY) return;
    
        let idx = getIndex(mouseY, mouseX);
        let cell = universe.get_cell(idx);
        ctx.fillStyle = cell === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;
        ctx.fillRect(
            mouseX * (CELL_SIZE_PX + 1) + 1,
            mouseY * (CELL_SIZE_PX + 1) + 1,
            CELL_SIZE_PX,
            CELL_SIZE_PX
        );
        ctx.stroke();
    
        mouseX = x;
        mouseY = y;
    
        ctx.fillStyle = HOVER_COLOR;
        ctx.fillRect(
            mouseX * (CELL_SIZE_PX + 1) + 1,
            mouseY * (CELL_SIZE_PX + 1) + 1,
            CELL_SIZE_PX,
            CELL_SIZE_PX
            );
        ctx.stroke();
    });
    canvas.addEventListener('click', function(event) {
        var x = event.offsetX,
            y = event.offsetY;
    
        x = Math.floor(x / (CELL_SIZE_PX + 1));
        y = Math.floor(y / (CELL_SIZE_PX + 1));
    
        let index = getIndex(y, x);
        universe.swap_cell(index);
    
        let cell = universe.get_cell(index);
        ctx.fillStyle = cell === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;
        ctx.fillRect(
            x * (CELL_SIZE_PX + 1) + 1,
            y * (CELL_SIZE_PX + 1) + 1,
            CELL_SIZE_PX,
            CELL_SIZE_PX
            );
        ctx.stroke();
    
    }, false);
}

const drawCells = function() {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
    

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            if (mouseOnCanvas && row === mouseY && col === mouseX){
                continue;
            }

            ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;
            ctx.fillRect(
                col * (CELL_SIZE_PX + 1) + 1,
                row * (CELL_SIZE_PX + 1) + 1,
                CELL_SIZE_PX,
                CELL_SIZE_PX
                );
        }
    }

    ctx.stroke();
}

const drawGrid = function() {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE_PX + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE_PX + 1) + 1, (CELL_SIZE_PX + 1) * height + 1);
    }

    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * (CELL_SIZE_PX + 1) + 1);
        ctx.lineTo((CELL_SIZE_PX + 1) * width + 1, j * (CELL_SIZE_PX + 1) + 1);
    }

    ctx.stroke();
}

let tickTimeout = 0;
const lifeCycle = function() {   
    universe.tick();
    drawCells();

    tickTimeout = setTimeout(lifeCycle, UPDATE_INTERVAL);
}

const registerControlEvents = function() {
    const stopBtn = document.getElementById("stop");
    const startBtn = document.getElementById("start");
    const restartBtn = document.getElementById("restart");

    stopBtn.addEventListener('click', function(event) {
        if (tickTimeout !== 0) {
            clearTimeout(tickTimeout);
            tickTimeout = 0;
        }
    });
    
    startBtn.addEventListener('click', function(event) {
        if (tickTimeout === 0) {
            tickTimeout = lifeCycle();
        }
    });
    
    restartBtn.addEventListener('click', function(event) {
        if (tickTimeout !== 0) {
            clearTimeout(tickTimeout);
            tickTimeout = 0;
        }
    
        universe.flush();
        lifeCycle();
    });
}

drawGrid();
drawCells();
registerCanvasEvents();
registerControlEvents();