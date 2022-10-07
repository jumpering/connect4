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
                coordinate = boardView.readCoordinate();
                game.putToken(coordinate);
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
                if (game.getCurrentColor() === colors().RED) {//esto en un array con una sola linea 0 o 1
                    console.writeln(messageView().PLAYER + messageView().RED + messageView().WIN_GAME);
                } else {
                    console.writeln(messageView().PLAYER + messageView().YELLOW + messageView().WIN_GAME);
                }
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

        putToken(coordinate) {
            board.putToken(coordinate, this.getCurrentColor());
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
            for (let i = 0; i < board.slots.length; i++) {
                for (let j = 0; j < board.slots[i].length; j++) {
                    if (board.slots[i][j] === " ") {
                        console.write(messageView().BOARD_HOLE);
                    }
                    else {
                        console.write(board.slots[i][j] === colors().RED ? messageView().BOARD_RED : messageView().BOARD_YELLOW);
                    }
                }
                console.writeln();
            }
        },

        readCoordinate() {
            let column;
            do {
                column = console.readNumber(messageView().INSERT_COLUMN);
                if (!board.isOnValidRange(column)) {
                    console.writeln(messageView().INSERT_VALUES_BETWEEN + board.getMaxColumns());
                } else if (board.isCompletedColumn(column - 1)) {
                    console.writeln(messageView().COLUMN_NOT_EMPTY);
                }
            } while (!board.isOnValidRange(column) || board.isCompletedColumn(column - 1));
            return new Coordinate(board.getFirstEmptyRow(column - 1), column - 1);
        }
    }
}

function createBoard() {
    return {
        slots: [],
        EMPTY_SLOT: " ",

        reset() {
            new Coordinate(); //¿porque si no hago este NEW no obtengo propiedades estáticas de la clase Coordinate?¿?¿
            this.slots = new Array(Coordinate.MAX_ROWS);
            for (let i = 0; i < Coordinate.MAX_ROWS; i++) {
                this.slots[i] = new Array(Coordinate.MAX_COLUMNS).fill(this.EMPTY_SLOT);
            }
        },

        isFinished(coordinate) {
            return this.isWinner(coordinate) || this.isTied();
        },

        putToken(coordinate, color) {
            this.slots[coordinate.getRow()][coordinate.getColumn()] = color;
        },

        isWinner(coordinate) {
            let isWinner = false;
            let currentColor = this.slots[coordinate.getRow()][coordinate.getColumn()];
            let directions = [];
            directions.push(new Direction("SOUTH", 1, 0));
            directions.push(new Direction("EAST", 0, 1));
            directions.push(new Direction("WEST", 0, -1));
            directions.push(new Direction("NORTH_EAST", -1, 1));
            directions.push(new Direction("SOUTH_WEST", 1, -1));
            directions.push(new Direction("SOUTH_EAST", 1, 1));
            directions.push(new Direction("NORTH_WEST", -1, -1));
            directions.forEach(direction => {
                let coordinates = coordinate.getOnLine(direction);
                let colorCounter = 0;
                coordinates.forEach(coordinate => {
                    if (this.slots[coordinate.getRow()][coordinate.getColumn()] === currentColor) {
                        colorCounter++;
                    } else {
                        colorCounter = 0;
                    }
                    if (colorCounter === 4) {
                        isWinner = true;
                    }
                });
            });
            return isWinner;
        },

        isTied() {
            for (let i = 0; i < Coordinate.MAX_COLUMNS; i++) {
                if (this.slots[0][i] === " ") {
                    return false;
                }
            }
            return true;
        },
        getFirstEmptyRow(column) {//como assert columna no completa
            for (let i = Coordinate.MAX_ROWS - 1; i >= 0; i--) {
                if (this.slots[i][column] === " ") {
                    return i;
                }
            }
        },

        isCompletedColumn(column) {
            return this.slots[0][column] !== " ";
        },

        isOnValidRange(column) {
            return 1 <= column && column <= Coordinate.MAX_COLUMNS;
        },

        getMaxColumns() {
            return Coordinate.MAX_COLUMNS;
        },
    }
}

function createTurnView(turn) {
    return {
        show() {//esto en un array con una sola linea 0 o 1
            if (turn.getCurrentColor() === colors().RED) {
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

        change() {// usar indice
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

function Coordinate(row, column) {
    Coordinate.MAX_ROWS = 6;
    Coordinate.MAX_COLUMNS = 7;
    this.row = row;
    this.column = column;

    Coordinate.prototype.getRow = function () {
        return this.row;
    }
    Coordinate.prototype.getColumn = function () {
        return this.column;
    }

    Coordinate.prototype.getOnLine = function (direction) {
        this.LENGTH_ON_LINE = 4;
        this.coordinates = [];
        let row = this.row;
        let column = this.column;
        this.coordinates.push(new Coordinate(this.row, this.column));
        for (let i = 0; i < this.LENGTH_ON_LINE; i++) {
            row = row + direction.getRow();
            column = column + direction.getColumn();
            if (row >= 0 && row < 6 && column >= 0 && column < 7) {
                this.coordinates.push(new Coordinate(row, column));
            }
        }
        return this.coordinates;
    }
}

function Direction(name, row, column) {
    this.coordinate = new Coordinate(row, column);
    this.name = name;

    Direction.prototype.getRow = function () {
        return this.coordinate.getRow();
    }

    Direction.prototype.getColumn = function () {
        return this.coordinate.getColumn();
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