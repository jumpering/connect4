const { Console } = require("console-mpds");
const console = new Console();

connect4().play();

function connect4() {
    const gameView = createGameView(createGame());
    return {
        play() {
            yesNoDialogView = createYesNoDialogView();
            do {
                gameView.playOneRound();
                yesNoDialogView.read(messageView().PLAY_AGAIN);
            } while (yesNoDialogView.isAffirmative());
        }
    }
}

function createGameView(game) {
    const boardView = createBoardView(game.getBoard());
    const turnView = createTurnView(game.getTurn());
    return {
        playOneRound() {
            game.reset();
            console.writeln(messageView().TITLE);
            let coordinate;
            do {
                boardView.show();
                turnView.show();
                coordinate = boardView.getCoordinate();//ha de ser read
                game.updateBoard(coordinate);
                if (!game.isFinished(coordinate)) {
                    game.changeTurn();
                }
            } while (!game.isFinished(coordinate));
            boardView.show();
            this.showResult();
        },

        showResult() {
            if (game.isTied()) {
                console.writeln(messageView().TIED_GAME);
            } else {
                console.writeln(messageView().PLAYER + game.getCurrentColor() + messageView().WIN_GAME);
            }
        },
    }
}

function createGame() {
    const board = createBoard();
    const turn = createTurn();
    return {
        reset() {
            board.reset();
        },

        updateBoard(coordinate) {//sin board (clase alternativas con interfaces diferentes smell), más que update sería put
            board.update(coordinate, this.getCurrentColor());
        },

        getCurrentColor() {
            return turn.getCurrentColor();
        },

        changeTurn() {
            turn.change();
        },

        isTied() {
            return board.isTied();
        },

        getBoard() {
            return board;
        },

        getTurn() {
            return turn;
        },
        isFinished(coordinate) {
            return board.isFinished(coordinate);
        }
    }
}

function createBoardView(board) {
    return {
        show() {
            console.writeln(messageView().BOARD_HEADER);
            for (let i = 0; i < board.grid.length; i++) {
                for (let j = 0; j < board.grid[i].length; j++) {
                    if (board.grid[i][j] === "") {
                        console.write(messageView().BOARD_HOLE);
                    }
                    else {
                        if (board.grid[i][j] === colors().RED){  //////repeated code, compactar, como si fuera un array
                            console.write(messageView().BOARD_RED);
                        }
                        if (board.grid[i][j] === colors().YELLOW){
                            console.write(messageView().BOARD_YELLOW);
                        }
                    }
                }
                console.writeln();
            }
        },

        getCoordinate() {//ha de ser read PUEDE ESTAR JUNTO CON GETCOLUMN, DEJAR GETCCOORDINATE
            let column = this.getColumn();
            let coordinate = createCoordinate(board.getFirstEmptyRow(column), column);
            return coordinate;
        },

        getColumn() {//ha de ser read
            let column;
            do {
                column = console.readNumber(messageView().INSERT_COLUMN);
                if (!board.isOnValidRange(column)) {
                    console.writeln(messageView().INSERT_VALUES_BETWEEN + board.getMaxColumns(column));
                } else if (board.isCompletedColumn(column - 1)) {
                    console.writeln(messageView().COLUMN_NOT_EMPTY);
                }
            } while (!board.isOnValidRange(column) || board.isCompletedColumn(column - 1));
            return (column - 1);
        },
    }
}

function createBoard() {
    const MAX_ROWS = 6;
    const MAX_COLUMNS = 7;
    return {
        grid: [], //mal nombre

        reset() {
            this.grid = new Array(MAX_ROWS); ///con un fill se puede rellenar del tirón
            for (let i = 0; i < MAX_ROWS; i++) {
                this.grid[i] = new Array(MAX_COLUMNS);
            }
            for (let i = 0; i < this.grid.length; i++) {
                for (let j = 0; j < this.grid[0].length; j++) {
                    this.grid[i][j] = "";//dice que combiene más un espacio que una cadena vacia
                }   
            }
        },

        isFinished(coordinate) {
            return this.isWinner(coordinate) || this.isTied();
        },

        update(coordinate, color) {
            this.grid[coordinate.getRow()][coordinate.getColumn()] = color;
        },

        isWinner(coordinate) { //TODO
            return false;
        },

        isTied() {
            for (let i = 0; i < this.grid.length; i++) { //este está mal, ojo puede estar completo pero ganar en la última ficha
                for (let j = 0; j < this.grid[i].length; j++) {
                    if (this.grid[i][j] === "") {
                        return false;
                    }
                }
            }
            return true;
        },

        getFirstEmptyRow(column) {//tal vez un assert column not completed
            for (let i = this.grid.length - 1; i >= 0; i--) {
                if (this.grid[i][column] === "") {
                    return i;
                }
            }
        },

        isCompletedColumn(column) {
            return this.grid[0][column] !== "";
        },

        isOnValidRange(column) {
            return 1 <= column && column <= MAX_COLUMNS;
        },

        getMaxColumns() {
            return this.grid[0].length; ///unificar criterios si usar length o maxColumns
        },
    }
}

function createTurnView(turn) {
    return {
        show() {
            if (turn.getCurrentColor() === colors().RED){ ///esto en un array con una sola linea 0 o 1
                console.write(messageView().TURN + messageView().RED);
            } else {
                console.write(messageView().TURN + messageView().YELLOW);
            }
        }
    }
}

function createTurn() {
    return {
        currentColor: colors().RED,

        getCurrentColor() {
            return this.currentColor;
        },

        change() {
            this.currentColor = this.currentColor === colors().RED ? colors().YELLOW : colors().RED; //tal vez solo con 0 y 1
        }
    }
}

function colors() {
    return {
        RED: "R",
        YELLOW: "Y"
    }
}

function createCoordinate(row, column) {
    return {
        row: row,
        column: column,

        getRow() {
            return this.row;
        },

        getColumn() {
            return this.column;
        },

        displace(direction) { //TODO
            return false;
        }
    }
}

function createYesNoDialogView() {
    return {
        YES: messageView().YES,
        NO: messageView().NO,
        response: "",
        error: true,

        read(message) {
            do {
                this.response = console.readString(message);
                this.error = this.response != this.YES && this.response != this.NO;
                if (this.error) {
                    console.writeln(messageView().RESPONSE_MUST_BE + this.YES + messageView().OR + this.NO);
                }
            } while (this.error);
            return this.response;
        },

        isAffirmative() {
            return this.response === this.YES;
        }
    }
}

function messageView() {
    return {
        TITLE: "\n      Connect4\n",
        TURN: "\nTurn ",
        COLUMN_NOT_EMPTY: "This column has not empty holes, select another column",
        INSERT_COLUMN: " please insert column: ",
        TIED_GAME: "Tied game",
        PLAYER: "Player ",
        WIN_GAME: " win!",
        BOARD_HEADER: "\n 1  2  3  4  5  6  7\n -------------------",
        BOARD_HOLE: " · ",
        BOARD_RED: " R ",
        BOARD_YELLOW: " Y ",
        INSERT_VALUES_BETWEEN: "Insert value between 1 and ",
        PLAY_AGAIN: "Play again? (yes/no)",
        YES: "yes",
        NO: "no",
        RESPONSE_MUST_BE: "Response must be ",
        OR: " or ",
        RED: "Red",
        YELLOW: "Yellow"
    }
}