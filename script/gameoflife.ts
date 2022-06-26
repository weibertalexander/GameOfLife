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
                    if (liveNeighbors == 3) {
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

let lifebutton: HTMLDivElement = document.getElementById("lifebutton") as HTMLDivElement;
let lifebuttontext: HTMLParagraphElement = document.getElementById("lifebuttontext") as HTMLParagraphElement;
let isRunning: boolean = false;
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

}

function cellClicked(e: Event): void {
    let cell: HTMLDivElement = e.target as HTMLDivElement;
    let x: number = +cell.getAttribute("data-x")!;
    let y: number = +cell.getAttribute("data-y")!;

    grid.setGrid(x, y) == true ? cell.style.backgroundColor = "rgb(121, 226, 209)" : cell.style.backgroundColor = "rgb(14, 1, 19)";
}

let intervalID: number;
lifebutton.addEventListener("click", toggleLifeButton);

function toggleLifeButton() {
    lifebutton.style.backgroundColor = "rgb(105, 192, 71)";
    isRunning = !isRunning;
    if (isRunning) {
        lifebuttontext.textContent = "Stop Game";
        intervalID = setInterval(gameOfLife, 100);
    } else {
        lifebuttontext.textContent = "Start Game";
        clearInterval(intervalID!);
        lifebutton.style.backgroundColor = "rgb(82, 82, 82)";
    }
}

function gameOfLife() {
    grid.applyRules();
}

initGrid();


