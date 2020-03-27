let rows = 12;
let colums = 12;
let grid = rows * colums; // el numero total de celdas
let cells = []; // el array que va a contener todas las celdas
let mines = Math.floor(grid * 0.1); // numero de minas que usara el juego
let firstClick = false; // chequea si ya se hizo el primer click
let game = "not started"; //chequea el estado del juego
let goodCells = grid - mines; // es la cantidad de minas sin celda. Cuando llegue a 0 se gana el juego
let nFlags = mines; // numero maximo de banderitas que se pueden poner, que es igual al numero de minas

let board = document.querySelector("#board");
let replay = document.querySelector("#replay");

replay.addEventListener('click', () => {
    cells = [];
    board.innerHTML = "";
    mines = Math.floor(grid * 0.1);
    firstClick = false;
    game = "not started";
    goodCells = grid - mines;
    nFlags = mines;
    cells = createCells(rows, colums);
});

class Mine { // esta es la clase mina, aqui deberia poner los metodos, tambien falta crear la clase contenedor
    constructor(ypos, xpos, el) {
        this.ypos = ypos;
        this.xpos = xpos;
        this.id = parseToID(xpos, ypos);
        this.el = el;
        this.clicked = false;
        this.mined = false;
        this.number = 0;
        this.firstClicked = false;
        this.flagged = false;
    }

}

cells = createCells(rows, colums); // llamada de la funcion que crea las celdas (la de las minas va dentro del primer click)

function numbers() {
    for ( let i = 0; i < rows; i++ ) {
        for ( let j = 0; j < colums; j++ ) {
            if (!cells[i][j].mined) {
                cells[i][j].number = setNumbers(cells, i, j);
            }
        }
    }
}

function setNumbers(_cells, _ypos, _xpos) { //esta funcion asigna numeros a cada elemento verificando las 8 posiciones alrededor
    let num = 0;
    
    let x = _cells[_ypos][_xpos].xpos;
    let y = _cells[_ypos][_xpos].ypos;

    // trabaja de la siguiente manera: intenta el check, si hay un error no hace nada, si esta bien: +1 al 
    // el error ocurre cuando se chequea un array out of bounds
    // no consegui una forma mas elegante de hacer esta verificacion
    try {
        if (_cells[y + 1][x].mined) {
            num++;
        }
    } catch {}
    try {
        if (_cells[y][x + 1].mined) {
            num++;
        }
    } catch {}
    try {
        if (_cells[y - 1][x].mined) {
            num++;
        }
    } catch {}
    try {
        if (_cells[y][x - 1].mined) {
            num++;
        }
    } catch {}
    try {
        if (_cells[y + 1][x + 1].mined) {
            num++;
        }
    } catch {}
    try {
        if (_cells[y - 1][x - 1].mined) {
            num++;
        }
    } catch {}
    try {
        if (_cells[y + 1][x - 1].mined) {
            num++;
        }
    } catch {}
    try {
        if (_cells[y - 1][x + 1].mined) {
            num++;
        }
    } catch {}

    return num;
}

function setMines(_mines, _cells) { // esta funcion setea las minas, toma como argumento las celdas y el numero maximo de minas

    while (_mines > 0) { // esto hace que el proceso se repita mientras el numero de minas sea > 0
        for (let i = 0; i < _cells.length; i++) { // recorre las filas

            if (_mines <= 0) break; // si ya tenemos todas las minas, nos salimos de el loop
            for (let j = 0; j < _cells[i].length; j++) {// este recorre cada elemento

                if (_mines <= 0) break; // si ya tenemos todas las minas nos salimos del loop

                if (!_cells[i][j].mined && !_cells[i][j].firstClicked) { // si no tiene minas ni es el primer clickeado...
                    if (chanceBoolean(1)) { // crea un numero random, y si es menor o igual a 1, le pone mina
                        _cells[i][j].mined = true;
                        _cells[i][j].number = -1;
                        _mines--;
                    }
                }
            }
        }
    }

    return _cells;
}

function createCells(row, col) { // esta funcion crea los elementos div que representaran las casillas

    let _mines = []; // crea un array que representara cada fila

    for (let i = 0; i < row; i++) { // este for crea los elementos y lo inserta en el array de fila

        let row = [];

        for (let j = 0; j < col; j++) {
        
            row.push(new Mine(i, j, board.appendChild(document.createElement('div'))));

            let c = row[j]
            c.el.setAttribute("class", "item");
            
            clickEvent(c, i, j);
            contextMenuEvent(c);
        }
        _mines.push(row); // aqui se inserta la fila y crea el grid o el array de dos dimensiones
    }

    
    board.style.gridTemplateColumns = `repeat(${colums}, 40px)`;
    return _mines; // retorna el array de dos dimensiones
}

// Esta funcion añade las funciones al click izquierdo (quitar bloques)
function clickEvent(_c, _i, _j) {
    _c.el.addEventListener("click", () => {
        
        
        if (!firstClick) { //si no se ha hecho el primer click, cambiar el estado de la variable y ejecutar el seteador de minas
            firstClick = true;
            _c.firstClicked = true;
            cells = setMines(mines, cells); // esta funcion le pone las minas a los elementos
            numbers();

            
            game = "started" // inicializa el juego supuestamente
        }
        
        if (_c.flagged) {}

        else click(_c);

		!_c.flagged ? _c.clicked = true : _c.clicked = false; //cambia el estado a clickeado (si no esta flagged)
		
    });
}

//esta funcion añade funcionalidad al click derecho (banderitas)
function contextMenuEvent(_c) {

    _c.el.addEventListener("contextmenu", e => {
        e.preventDefault(); // previene la creacion del menu de contexto cuando se selecciona el elemento

		if (!(game === "lost" || game === "won")) {
			if (firstClick && !_c.clicked) { // si ya se hizo el primer click y no esta clickeado...

				if (!_c.flagged) { // si no tiene banderita, poner la bandera y restar el numero de banderas y cambia el estado
					if (nFlags > 0) {
						_c.el.innerHTML = '<span id="a">|</span><span id="b">></span>';
						nFlags -= 1;
						_c.flagged = !_c.flagged;
					}
				} else { // si hay bandera, aumenta el numero de banderas, cambia el estado y quita la banderita
					_c.el.textContent = "";
					nFlags += 1;
					_c.flagged = !_c.flagged;
				}
			}
		}
    });
}

function lose(c) {
    let flagged = c.flagged;
    let mined = c.mined;
    let element = c.el;

    if (flagged && !mined) {
        element.textContent = "X";
        element.style.color = "red";
    } else if (!flagged) {
        element.style.backgroundColor = "rgb(170, 20, 25)";
        game = "lost";
	}
	
	goOverCells((c) => {
		if (c.mined) {
			c.el.style.backgroundColor = "rgb(170, 20, 25)";
		}
	});
}
 
//Funcion que ejecuta el click
function click(c) {
    let clicked = c.clicked;
    let number = c.number;
    let y = c.ypos;
    let x = c.xpos;
    let mined = c.mined;
	let flag = checkFlags(y, x);
	let flags = flag.num;
	let badFlags = flag.badFlags;

    // si esta en lost no debe dejar clickear
    if (!(game === "lost" || game === "won")) {

        //proceso para cuando NO esta clickeado
        if (!clicked) {
            if (mined) {
                lose(c);
            }
            else if (number === 0) {
                openSurroundingCells(c, y, x, false);
            }
            else {
                openCell(c);
            }
        }

        //proceso para cuando la casilla esta abierta
        else if (clicked && number > 0) {
            if (flags === number && !badFlags) {
				openSurroundingCells(c, y, x, true);
			}
			else if (badFlags > 0) {
				lost2(c);
			}
        }
    }
}

function lost2(c) {
    let y = c.ypos;
    let x = c.xpos;
    let yend = y + 2;
    let xend = x + 2;
    for (let i = y - 1; i < yend; i++) {
        for (let j = x - 1; j < xend; j++) {
			try {
				let c2 = cells[i][j];
				if (!(c2 === c)) {
					if (c2.mined || c2. flagged) {
						lose(c2);
					}
				}
			} catch {};
    	}
	}
}

function goOverCells(rows, cols, func) {
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			let c = cells[i][j];

			func(c);
		}
	}
}

//funcion que va a abrir las minas colindantes
function openSurroundingCells(_cell, _i, _j, byClick) {
	
	let clicked = _cell.clicked;
    if (!clicked) {
        openCell(_cell);
    }
    // tratar de hacer que funcione el try catch desde la funcion destroy para aminorar codigo
    
    destroy(_cell, cells[_i][_j - 1], byClick);
    destroy(_cell, cells[_i][_j + 1], byClick);

    try {
        destroy(_cell, cells[_i + 1][_j], byClick);
    } catch {};

    try {
        destroy(_cell, cells[_i - 1][_j], byClick);
    } catch {};

    try {
        destroy(_cell, cells[_i - 1][_j - 1], byClick);
    } catch {};

    try {
        destroy(_cell, cells[_i + 1][_j + 1], byClick);
    } catch {};

    try {
        destroy(_cell, cells[_i - 1][_j + 1], byClick);
    } catch {};

    try {
        destroy(_cell, cells[_i + 1][_j - 1], byClick);
    } catch {};
}

function destroy(c1, c2, byClick) {
    try {
        if (!c2.flagged && !c2.mined && !c2.clicked && !c1.number) {
            openSurroundingCells(c2, c2.ypos, c2.xpos, false);
		}
		else if (!c2.flagged && !c2.mined && c1.number > 0 && byClick) {
			openSurroundingCells(c2, c2.ypos, c2.xpos);
		}
    } catch {};
}

//funcion que abre minas normales y con 0
function openCell(_cell) {
    if (!_cell.clicked) {
        goodCells -= 1;
	}
	
	if (goodCells === 0) {
		game = "won";
	}

    _cell.el.style.backgroundColor = "#232323";
    _cell.clicked = true;

    if (_cell.number > 0) {
        _cell.el.textContent = _cell.number;
    }
}

function checkFlags(y, x) { //esta funcion chequea el numero de banderas al rededor
	let num = 0;
	let badFlags = 0;

    // trabaja de la siguiente manera: intenta el check, si hay un error no hace nada, si esta bien: +1 al numero
    // el error ocurre cuando se chequea un array out of bounds
    // no consegui una forma mas elegante de hacer esta verificacion
    try {
        if (cells[y + 1][x].flagged) {
			num++;
			if (!cells[y + 1][x].mined) {
				badFlags++;
			}
        }
    } catch {}
    try {
        if (cells[y][x + 1].flagged) {
			num++;
			if (!cells[y][x + 1].mined) {
				badFlags++;
			}
        }
    } catch {}
    try {
        if (cells[y - 1][x].flagged) {
			num++;
			if (!cells[y - 1][x].mined) {
				badFlags++;
			}
        }
    } catch {}
    try {
        if (cells[y][x - 1].flagged) {
			num++;
			if (!cells[y][x - 1].mined) {
				badFlags++;
			}
        }
    } catch {}
    try {
        if (cells[y + 1][x + 1].flagged) {
			num++;
			if (!cells[y + 1][x + 1].mined) {
				badFlags++;
			}
        }
    } catch {}
    try {
        if (cells[y - 1][x - 1].flagged) {
			num++;
			if (!cells[y - 1][x - 1].mined) {
				badFlags++;
			}
        }
    } catch {}
    try {
        if (cells[y + 1][x - 1].flagged) {
			num++;
			if (!cells[y + 1][x - 1].mined) {
				badFlags++;
			}
        }
    } catch {}
    try {
        if (cells[y - 1][x + 1].flagged) {
			num++;
			if (!cells[y - 1][x + 1].mined) {
				badFlags++;
			}
        }
    } catch {}

    return {num: num, badFlags: badFlags};
}

/******************************------  OTHER FUNCTIONS  ------******************************/
function parseToID(x, y) { // convierte los indices i y j a un id que luce tipo "000x000"
    x = String(x).padStart(3, "0");
    y = String(y).padStart(3, "0");
    return x + "x" + y;
    // en realidad no se que utilidad le voy a dar a este id
}

function parseToCoord(str) { // convierte el id a coordenada.
    coord = str.split("x");
    coord[0] = parseInt(coord[0]);
    coord[1] = parseInt(coord[1]);
    return coord;
}

function randomNum(num) { // crea un numero random entre 0 y el numero obtenido
    let rand = Math.floor(Math.random() * num);
    return rand;
}

function randomBool() { // crea un booleano random
    let rand = Math.floor(Math.random() * 2);
    return rand === 1 ? true : false;
}
    
function chanceBoolean(_chance = 5) { // crea true o false dependiendo de la probabilidad que se le de
    let rand = Math.floor(Math.random() * 10);

    return rand < _chance ? true : false;
}