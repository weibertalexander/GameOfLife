"use strict";
class Audiomanager {
    constructor(src) {
        this._soundlimit = 25;
        this._volume = 0.02;
        this._duration = 0;
        this._buffer = [];
        this._src = "";
        if (src == "") {
            return;
        }
        this._src = src;
        for (let i = 0; i < this._soundlimit; i++) {
            let sound = new Audio(src);
            sound.volume = 0.1;
            sound.loop = false;
            this._buffer.push(sound);
        }
        this._buffer[0].addEventListener("ended", function () {
            audiomanager.duration = this.currentTime;
        }, { once: true });
    }
    playSound() {
        if (this._src != "") {
            for (let i = 0; i < this._soundlimit; i++) {
                if (this._buffer[i].currentTime == 0 || this._buffer[i].currentTime == this._duration) {
                    this._buffer[i].play();
                    return true;
                }
            }
        }
        return false;
    }
    set duration(v) {
        if (this._src != "") {
            this._duration = v;
        }
    }
}
class Grid {
    constructor(size) {
        this._grid1 = [];
        this._grid2 = [];
        this._htmlgrid = [];
        for (var i = 0; i < size; i++) {
            this._grid1[i] = [];
            for (var j = 0; j < size; j++) {
                this._grid1[i][j] = false;
            }
            this._htmlgrid[i] = new Array(size);
        }
        this._grid2 = JSON.parse(JSON.stringify(this._grid1));
    }
    setHTMLGrid(x, y, cell) {
        this._htmlgrid[x][y] = cell;
    }
    get grid() {
        return this._grid1;
    }
    setGrid(x, y) {
        this._grid1[x][y] = !this._grid1[x][y];
        this._grid2[x][y] = !this._grid2[x][y];
        return this._grid1[x][y];
    }
    returnNeighbors(x, y) {
        let result = 0;
        for (let xcheck = x - 1; xcheck <= x + 1; xcheck++) {
            for (let ycheck = y - 1; ycheck <= y + 1; ycheck++) {
                // Check within grid boundaries.
                if (xcheck >= 0 && ycheck >= 0 && xcheck < gridsize && ycheck < gridsize) {
                    if (this._grid2[xcheck][ycheck]) {
                        result++;
                    }
                }
            }
        }
        // As [x][y] gets also checked as a neighbor and added to results if it is true.
        if (this._grid2[x][y])
            result--;
        if (result > 0) {
        }
        return result;
    }
    applyRules() {
        for (let x = 0; x < gridsize; x++) {
            for (let y = 0; y < gridsize; y++) {
                let liveNeighbors = this.returnNeighbors(x, y);
                //let cell: HTMLDivElement = document.querySelectorAll(`[data-x="${x}"][data-y="${y}"]`)[0] as HTMLDivElement;
                let cell = this._htmlgrid[x][y];
                // Cell is alive.
                if (this._grid2[x][y]) {
                    // Dies due to underpopulation.
                    if (liveNeighbors < 2) {
                        this._grid1[x][y] = false;
                        cell.style.backgroundColor = "rgb(14, 1, 19)";
                    }
                    // Dies due to overpopulation.
                    else if (liveNeighbors > 3) {
                        this._grid1[x][y] = false;
                        cell.style.backgroundColor = "rgb(14, 1, 19)";
                    }
                    // Cell stays alive with 2 or 3 neighbors
                    else if (liveNeighbors == 2 || liveNeighbors == 3) {
                    }
                }
                // Cell is dead.
                else {
                    // Cell gets born.
                    if (liveNeighbors == 3) {
                        audiomanager.playSound();
                        this._grid1[x][y] = true;
                        cell.style.backgroundColor = "rgb(121, 226, 209)";
                    }
                }
                // Live cell stays alive with 2 neighbors (or 3, see previous if).
                //else if (this._grid[x][y] == true && liveNeighbors == 2) {
            }
        }
        this._grid2 = JSON.parse(JSON.stringify(this._grid1));
    }
    deleteHTMLGrid() {
        let grid = document.getElementById("grid");
        grid.parentNode.removeChild(grid);
    }
}
let audiomanager = new Audiomanager("");
let lifebutton = document.getElementById("lifebutton");
let lifebuttontext = document.getElementById("lifebuttontext");
let isRunning = false;
let resetbutton = document.getElementById("resetbutton");
let gridcontainer = document.getElementById("gridcontainer");
let cells;
let gridsize = 50;
let grid = new Grid(gridsize);
// Fill gridcontainer with cell elements
function initGrid(random) {
    var _a, _b, _c;
    if ((_a = document.getElementById("gridcontainer")) === null || _a === void 0 ? void 0 : _a.hasChildNodes) {
        (_b = document.getElementById("gridcontainer")) === null || _b === void 0 ? void 0 : _b.remove;
    }
    let newgrid = document.createElement("div");
    newgrid.setAttribute("id", "grid");
    for (let i = 0; i < gridsize; i++) {
        let col = document.createElement("div");
        col.setAttribute("class", "gridcol");
        for (let j = 0; j < gridsize; j++) {
            let cell = document.createElement("div");
            cell.setAttribute("class", "cell");
            cell.setAttribute("data-x", i.toString());
            cell.setAttribute("data-y", j.toString());
            col.appendChild(cell);
            grid.setHTMLGrid(i, j, cell);
            if (random && Math.random() < 0.4) {
                grid.setGrid(i, j);
                cell.style.backgroundColor = "rgb(121, 226, 209)";
            }
        }
        newgrid.appendChild(col);
    }
    (_c = document.getElementById("gridcontainer")) === null || _c === void 0 ? void 0 : _c.appendChild(newgrid);
    cells = Array.from(document.getElementsByClassName("cell"));
    cells.forEach(cell => {
        cell.addEventListener("click", cellClicked);
    });
    if (localStorage.getItem("speedfactor") != null) {
        speedslider.value = localStorage.getItem("speedfactor");
        speedFactor = +speedslider.value;
    }
    if (localStorage.getItem("sound") != null) {
        let filename = localStorage.getItem("sound");
        audiomanager = new Audiomanager(filename);
        if (filename == "") {
            let soundoption = document.getElementById("nosound");
            soundoption.setAttribute("checked", "checked");
            return;
        }
        let soundoption = document.getElementById(filename);
        soundoption.setAttribute("checked", "checked");
    }
}
function cellClicked(e) {
    let cell = e.target;
    let x = +cell.getAttribute("data-x");
    let y = +cell.getAttribute("data-y");
    if (grid.setGrid(x, y) == true) {
        cell.style.backgroundColor = "rgb(121, 226, 209)";
        audiomanager.playSound();
    }
    else {
        cell.style.backgroundColor = "rgb(14, 1, 19)";
    }
}
let soundoptions = Array.from(document.getElementsByClassName("soundoption"));
soundoptions.forEach(option => {
    option.addEventListener("input", function () {
        audiomanager = new Audiomanager(option.value);
        localStorage.setItem("sound", option.value);
    });
});
let speedslider = document.getElementById("speedslider");
speedslider.addEventListener("input", setSpeed);
let speedFactor = 5;
function setSpeed(e) {
    speedFactor = +speedslider.value;
    localStorage.setItem("speedfactor", speedFactor.toString());
    if (isRunning) {
        clearInterval(intervalID);
        intervalID = setInterval(gameOfLife, 1000 / speedFactor);
    }
}
let intervalID;
lifebutton.addEventListener("click", toggleLifeButton);
function toggleLifeButton() {
    lifebutton.style.backgroundColor = "rgb(105, 192, 71)";
    isRunning = !isRunning;
    if (isRunning) {
        lifebuttontext.textContent = "Stop Game";
        intervalID = setInterval(gameOfLife, 1000 / speedFactor);
    }
    else {
        lifebuttontext.textContent = "Start Game";
        clearInterval(intervalID);
        lifebutton.style.backgroundColor = "rgb(82, 82, 82)";
    }
}
function gameOfLife() {
    grid.applyRules();
}
resetbutton.addEventListener("click", resetGame);
function resetGame(e) {
    localStorage.setItem("speedfactor", speedFactor.toString());
    window.location.reload();
}
let randombutton = document.getElementById("randombutton");
randombutton.addEventListener("click", randomizeGrid);
function randomizeGrid(e) {
    grid.deleteHTMLGrid();
    initGrid(true);
}
initGrid(false);
