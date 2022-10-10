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
                if (game.getCurrentColor() === colors().RED) {
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
            return createCoordinate(board.getFirstEmptyRow(column - 1), column - 1);
        }
    }
}

function createBoard() {
    return {
        ON_LINE_LENGTH: 4,
        slots: [],
        EMPTY_SLOT: " ",

        reset() {
            this.slots = new Array(createCoordinate().MAX_ROWS);
            for (let i = 0; i < createCoordinate().MAX_ROWS; i++) {
                this.slots[i] = new Array(createCoordinate().MAX_COLUMNS).fill(this.EMPTY_SLOT);
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
            const currentColor = this.slots[coordinate.getRow()][coordinate.getColumn()];
            this.getDirections().forEach(direction => {
                let coordinatesOnLine = coordinate.getOnLine(direction, this.ON_LINE_LENGTH);
                direction.reverse()
                let reverseCoordinatesOnLine = coordinate.getOnLine(direction, this.ON_LINE_LENGTH);
                reverseCoordinatesOnLine.reverse().pop();
                coordinatesOnLine = reverseCoordinatesOnLine.concat(coordinatesOnLine);
                let colorCounter = 0;
                coordinatesOnLine.forEach(coordinate => {
                    if (this.slots[coordinate.getRow()][coordinate.getColumn()] === currentColor) {
                        colorCounter++;
                    } else {
                        colorCounter = 0;
                    }
                    if (colorCounter === this.ON_LINE_LENGTH) {
                        isWinner = true;
                    }
                });
            });
            return isWinner;
        },

        getDirections(){
            let directions = [];
            directions.push(createDirection("SOUTH", 1, 0));
            directions.push(createDirection("EAST", 0, 1));
            directions.push(createDirection("SOUTH_WEST", 1, -1));
            directions.push(createDirection("SOUTH_EAST", 1, 1)); 
            return directions;
        },

        isTied() {
            for (let i = 0; i < createCoordinate().MAX_COLUMNS; i++) {
                if (this.slots[0][i] === " ") {
                    return false;
                }
            }
            return true;
        },
        getFirstEmptyRow(column) {
            for (let i = createCoordinate().MAX_ROWS - 1; i >= 0; i--) {
                if (this.slots[i][column] === " ") {
                    return i;
                }
            }
        },

        isCompletedColumn(column) {
            return this.slots[0][column] !== " ";
        },

        isOnValidRange(column) {
            return 1 <= column && column <= createCoordinate().MAX_COLUMNS;
        },

        getMaxColumns() {
            return createCoordinate().MAX_COLUMNS;
        },
    }
}

function createTurnView(turn) {
    return {
        show() {
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

        change() {
            this.currentColor = this.currentColor === colors().RED ? colors().YELLOW : colors().RED;
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
    return{
        MAX_ROWS: 6,
        MAX_COLUMNS: 7,
        row: row,
        column: column,

        getOnLine(direction, onLineLength){
            let coordinates = [];
            let row = this.row;
            let column = this.column;
            coordinates.push(this);
            for (let i = 0; i < onLineLength; i++) {
                row = row + direction.getRow();
                column = column + direction.getColumn();
                let offsetCoordinate = createCoordinate(row, column);
                if (this.include(offsetCoordinate)) {
                    coordinates.push(offsetCoordinate);
                }
            }
            return coordinates;
        },

        include(coordinate){
            return coordinate.getRow() >= 0 && coordinate.getRow() < this.MAX_ROWS && coordinate.getColumn() >= 0 && coordinate.getColumn() < this.MAX_COLUMNS;
        },

        getRow(){
            return this.row;
        },

        getColumn(){
            return this.column;
        },

        setRow(row){
            this.row = row;
        },

        setColumn(column){
            this.column = column;
        }
    }
}

function createDirection(name, row, column) {
    return {
        coordinate: createCoordinate(row, column),
        name: name,

        getRow() {
            return this.coordinate.getRow();
        },

        getColumn() {
            return this.coordinate.getColumn();
        },

        reverse() {
            this.coordinate.setRow(this.coordinate.getRow() * -1);
            this.coordinate.setColumn(this.coordinate.getColumn() * -1);
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