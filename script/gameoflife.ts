class Audiomanager {
    private readonly _soundlimit = 25;
    private readonly _volume = 0.02;
    private _duration = 0;
    private _buffer: HTMLAudioElement[] = [];

    constructor(src: string) {
        for (let i = 0; i < this._soundlimit; i++) {
            let sound: HTMLAudioElement = new Audio(src);
            sound.volume = 0.1;
            sound.loop = false;
            this._buffer.push(sound);
        }
        this._buffer[0].addEventListener("ended", function(){
            audiomanager.duration = this.currentTime;
        }, {once: true});
    }

    public playSound(): boolean {
        for (let i: number = 0; i < this._soundlimit; i++) {
            if (this._buffer[i].currentTime == 0 || this._buffer[i].currentTime == this._duration) {
                this._buffer[i].play();
                return true;
            }
        }
        return false;
    }

    set duration(v: number) {
        this._duration = v;
        console.log(v);
    }
}

class Grid {
    private _grid1: boolean[][] = [];
    private _grid2: boolean[][] = [];
    
    private _htmlgrid: HTMLDivElement[][] = [];


    constructor(size: number) {
        for (var i: number = 0; i < size; i++) {
            this._grid1[i] = [];
            for (var j: number = 0; j < size; j++) {
                this._grid1[i][j] = false;
            }
            this._htmlgrid[i] = new Array<HTMLDivElement>(size);
        }
        this._grid2 = JSON.parse(JSON.stringify(this._grid1));
    }

    public setHTMLGrid(x: number, y: number, cell: HTMLDivElement): void {
        this._htmlgrid[x][y] = cell;
    }

    public get grid() {
        return this._grid1;
    }

    public setGrid(x: number, y: number): boolean {
        this._grid1[x][y] = !this._grid1[x][y];
        this._grid2[x][y] = !this._grid2[x][y];
        return this._grid1[x][y];
    }

    public returnNeighbors(x: number, y: number): number {
        let result: number = 0;

        for (let xcheck: number = x - 1; xcheck <= x + 1; xcheck++) {
            for (let ycheck: number = y - 1; ycheck <= y + 1; ycheck++) {
                // Check within grid boundaries.
                if (xcheck >= 0 && ycheck >= 0 && xcheck < gridsize && ycheck < gridsize) {
                    if (this._grid2[xcheck][ycheck]) {
                        result++;
                    }
                }
            }
        }
        // As [x][y] gets also checked as a neighbor and added to results if it is true.
        if (this._grid2[x][y]) result--;
        if (result > 0) {
        }
        return result;
    }

    public applyRules(): void {

        for (let x: number = 0; x < gridsize; x++) {
            for (let y: number = 0; y < gridsize; y++) {
                let liveNeighbors = this.returnNeighbors(x, y);
                //let cell: HTMLDivElement = document.querySelectorAll(`[data-x="${x}"][data-y="${y}"]`)[0] as HTMLDivElement;
                let cell: HTMLDivElement = this._htmlgrid[x][y];
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
}

let audiomanager: Audiomanager = new Audiomanager("./sounds/s_7.wav");

let lifebutton: HTMLDivElement = document.getElementById("lifebutton") as HTMLDivElement;
let lifebuttontext: HTMLParagraphElement = document.getElementById("lifebuttontext") as HTMLParagraphElement;

let isRunning: boolean = false;

let resetbutton: HTMLDivElement = document.getElementById("resetbutton") as HTMLDivElement;

let gridcontainer: HTMLDivElement = document.getElementById("gridcontainer") as HTMLDivElement;
let cells: HTMLDivElement[];

let gridsize: number = 50;

let grid: Grid = new Grid(gridsize);

// Fill gridcontainer with cell elements
function initGrid(): void {
    for (let i: number = 0; i < gridsize; i++) {
        let col: HTMLDivElement = document.createElement("div");
        col.setAttribute("class", "gridcol");

        for (let j: number = 0; j < gridsize; j++) {
            let cell: HTMLDivElement = document.createElement("div");
            cell.setAttribute("class", "cell");
            cell.setAttribute("data-x", i.toString());
            cell.setAttribute("data-y", j.toString());
            col.appendChild(cell);
            grid.setHTMLGrid(i, j, cell);
        }
        gridcontainer.appendChild(col);
    }
    cells = Array.from(document.getElementsByClassName("cell") as HTMLCollectionOf<HTMLDivElement>);

    cells.forEach(cell => {
        cell.addEventListener("click", cellClicked)
    });

    if (localStorage.getItem("speedfactor") != null) {
        speedslider.value = localStorage.getItem("speedfactor")!;
        speedFactor = +speedslider.value;
    }

}

function cellClicked(e: Event): void {
    let cell: HTMLDivElement = e.target as HTMLDivElement;
    let x: number = +cell.getAttribute("data-x")!;
    let y: number = +cell.getAttribute("data-y")!;

    if (grid.setGrid(x, y) == true) {
        cell.style.backgroundColor = "rgb(121, 226, 209)"
        console.log(audiomanager.playSound());
        
    } else {
        cell.style.backgroundColor = "rgb(14, 1, 19)";
    }
}

let speedslider: HTMLInputElement = document.getElementById("speedslider") as HTMLInputElement;
speedslider.addEventListener("input", setSpeed);

let speedFactor: number = 5;

function setSpeed(e: Event) {
    speedFactor = +speedslider.value;

    if (isRunning) {
        clearInterval(intervalID);
        intervalID = setInterval(gameOfLife, 1000 / speedFactor);
    }
}

let intervalID: number;
lifebutton.addEventListener("click", toggleLifeButton);

function toggleLifeButton() {
    lifebutton.style.backgroundColor = "rgb(105, 192, 71)";
    isRunning = !isRunning;
    if (isRunning) {
        lifebuttontext.textContent = "Stop Game";
        intervalID = setInterval(gameOfLife, 1000 / speedFactor);
    } else {
        lifebuttontext.textContent = "Start Game";
        clearInterval(intervalID!);
        lifebutton.style.backgroundColor = "rgb(82, 82, 82)";
    }
}


function gameOfLife() {
    grid.applyRules();
}

resetbutton.addEventListener("click", resetGame);

function resetGame(e: Event): void {
    localStorage.setItem("speedfactor", speedFactor.toString())
    window.location.reload();
}

initGrid();


