const { Console } = require("console-mpds");
const console = new Console();

connect4().play();

function connect4() {
    const gameView = createGameView(createGame());
    return {
        play() {
            let yesNoDialogView = createYesNoDialogView();
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
                coordinate = boardView.getCoordinate();
                game.updateBoard(coordinate);//esto mejor que lo haga getCoordinate en l linea de arriba?
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

        updateBoard(coordinate) {
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

function createBoard() {
    const MAX_ROWS = 6;
    const MAX_COLUMNS = 7;
    return {
        grid: [],
        reset() { //se rellena con undefineds
            this.grid = new Array(MAX_ROWS);
            for (let i = 0; i < MAX_ROWS; i++) {
                this.grid[i] = new Array(MAX_COLUMNS);
            }
        },

        isFinished(coordinate) {
            return this.isWinner(coordinate) || this.isTied();
        },

        update(coordinate, color) {
            this.grid[coordinate.getRow()][coordinate.getColumn()] = color;
        },

        isWinner(coordinate) {
            //todo search with directions
            return false;
        },

        isTied() {
            for (let i = 0; i < this.grid[0].length; i++) {
                if (typeof (this.grid[MAX_ROWS - 1][i]) === 'undefined') {
                    return false;
                }
                return true;
            }
        },

        getFirstEmptyRow(column) {
            for (let i = this.grid.length - 1; i >= 0; i--) {
                if (typeof (this.grid[i][column]) === 'undefined') {
                    return i;
                }
            }
        },

        isCompletedColumn(column) {
            return typeof (this.grid[0][column]) !== 'undefined';
        },

        isOnValidRange(column) {
            return 0 < column && column <= MAX_COLUMNS;
        },

        getMaxColumns() {
            return this.grid[0].length;
        }
    }
}

function createBoardView(board) {
    return {
        show() {
            console.writeln(messageView().BOARD_HEADER);
            for (let i = 0; i < board.grid.length; i++) {
                for (let j = 0; j < board.grid[i].length; j++) {
                    if (typeof (board.grid[i][j]) === 'undefined') {
                        console.write(messageView().BOARD_HOLE);
                    }
                    if (board.grid[i][j] === colors().RED) {
                        console.write(messageView().BOARD_RED);
                    }
                    if (board.grid[i][j] === colors().YELLOW) {
                        console.write(messageView().BOARD_YELLOW);
                    }
                }
                console.writeln();
            }
        },
        reset() {
            board.reset();
        },

        getCoordinate() {
            let column = this.getColumn();
            let coordinate = createCoordinate(board.getFirstEmptyRow(column), column);
            console.writeln("2do boardView.getCoordinate: column user: " + (coordinate.getRow() + ", " + coordinate.getColumn()));
            return coordinate;
        },

        getColumn() {
            let column;
            do {
                column = console.readNumber(messageView().INSERT_COLUMN);
                if (!board.isOnValidRange(column)) {
                    console.writeln(messageView().INSERT_VALUES_BETWEEN + board.getMaxColumns(column));
                }else if (board.isCompletedColumn(column)) {
                    console.writeln(messageView().COLUMN_NOT_EMPTY);
                }
            } while (!board.isOnValidRange(column) || board.isCompletedColumn(column));
            console.writeln("1er boardView.getColumn: column user: " + (column -1));
            return column - 1;
        },
    }
}

function createTurn() {
    return {
        currentColor: colors().RED,

        getCurrentColor() {
            return this.currentColor;
        },

        change() {
            this.currentColor = this.currentColor === colors().RED ? colors().YELLOW : colors().RED;
        }
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
        }
    }
}

function createTurnView(turn) {

    return {
        show() {
            console.write(messageView().TURN + turn.getCurrentColor());
        }
    }
}

function createYesNoDialogView() {
    return {
        YES: messageView().YES,
        NO: messageView().NO,
        response: "",
        error: true,
        read: function (message) {
            do {
                this.response = console.readString(message);
                this.error = this.response != this.YES && this.response != this.NO;
                if (this.error) {
                    console.writeln(messageView().RESPONSE_MUST_BE + this.YES + messageView().OR + this.NO);
                }
            } while (this.error);
            return this.response;
        },

        isAffirmative: function () {
            return this.response === this.YES;
        }
    }
}

function messageView() {
    return {
        TITLE: "\n      Connect4\n",
        TURN: "\nTurn ",
        COLUMN_NOT_EMPTY: "This column has not empty holes, select another column",
        INSERT_COLUMN: " insert column: ",
        TIED_GAME: "Game over",
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

function colors() {
    return {
        RED: "Red",
        YELLOW: "Yellow"
    }
}