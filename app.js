const { Console } = require("console-mpds");
const console = new Console();

connect4().playGame();

function connect4() {
    return {
        yesNoDialog: yesNoDialog(),
        boardView: boardView(),
        playGame: function () {
            do {
                this.boardView.init();
                this.yesNoDialog.read("Play agsain?");
            } while (this.yesNoDialog.isAffirmative());
        }
    }
}

function boardView() {
    return {
        MAX_ROWS: 7,
        MAX_COLUMNS: 9,
        board: board(),
        turnView: turnView(),
        init: function () {
            console.writeln("Connect4 title");
            this.board.fillAllHolesWithNoColorAndEmptyFlagTokens(this.MAX_ROWS, this.MAX_COLUMNS);
            do {
                this.show();
                let userCoordinate = "";
                do {
                    userCoordinate = this.turnView.getCoordinate(this.MAX_ROWS, this.MAX_COLUMNS);
                } while (!this.board.isHole(userCoordinate));
                this.board.putToken(userCoordinate);
                this.turnView.nextTurn();
            } while (this.board.isEndGame());
            this.board.isComplete() === true ? "Game over" : "Player " + this.turnView.getColor() + " win!";
        },
        show: function () {
            let tokens = this.board.getTokens();
            for (let i = 0; i < tokens.length; i++) {
                for (let j = 0; j < tokens[i].length; j++) {
                    currentColor = tokens[i][j].getColor();
                    currentHole = tokens[i][j].isHole();
                    if (currentColor === colors().Red) {
                        console.write(" R ");
                    }
                    if (currentColor === colors().Yellow) {
                        console.write(" Y ");
                    }
                    if (currentHole === true) {
                        console.write(" o ");
                    }
                    if (j === MAX_COLUMNS) {
                        console.writeln("");
                    }
                }
            }
        }
    }
}

function board() {
    return {
        tokens: [[]],
        fillAllHolesWithNoColorAndEmptyFlagTokens: function (maxRows, maxColumns) {
            //hardcoded
            this.tokens[
                [token(), token(), token(), token(), token(), token(), token(), token(), token()],
                [token(), token(), token(), token(), token(), token(), token(), token(), token()],
                [token(), token(), token(), token(), token(), token(), token(), token(), token()],
                [token(), token(), token(), token(), token(), token(), token(), token(), token()],
                [token(), token(), token(), token(), token(), token(), token(), token(), token()],
                [token(), token(), token(), token(), token(), token(), token(), token(), token()],
                [token(), token(), token(), token(), token(), token(), token(), token(), token()]
            ]
            //coded not work
            // for (let i = 0; i < maxRows; i++) {
            //     for (let j = 0; j < maxColumns; j++) {
            //         this.tokens[i][j] = token();
            //     }
            // }
        },
        isHole: function (coordinate) {
            console.writeln("traza: " + coordinate.getRow() + ", " + coordinate.getColumn());
            this.tokens[coordinate.getRow()][coordinate.getColumn()].test();
            this.tokens[0][0].test();
            return this.tokens[coordinate.getRow()][coordinate.getColumn()].isHole();
        },
        getTokens: function () {
            return this.tokens;
        },
        isEndGame: function () {
            const AMOUNT_TOKENS_FOR_CONNECT4 = 3;
            let sameColorInHorizontal = 0;
            for (let i = 0; i < this.tokens.length; i++) {
                for (let j = 0; j < this.tokens[i].length; j++) {
                    if (!this.tokens[i][j].isHole) {
                        sameColorInHorizontal = this.sameColorInHorizontal(coordinate(i, j), this.tokens[i][j].getColor());
                    }
                }
            }
            return sameColorInHorizontal === AMOUNT_TOKENS_FOR_CONNECT4;
        },
        sameColorInHorizontal: function (coordinate, color) {
            let counter = 0;
            let horizontalCoordinates = coordinate.getHorizontals();
            for (let i = 0; i < horizontalCoordinates.length; i++) {
                if (this.tokens[horizontalCoordinates[i].getRow()][horizontalCoordinates[i].getColumn()].getColor() === color) {
                    counter++;
                }
            }
            return counter;
        },
        isComplete: function () {
            let counter = 0;
            for (let i = 0; i < this.tokens.length; i++) {
                for (let j = 0; j < this.tokens[i].length; j++) {
                    if (!this.tokens[i][j].isHole()) {
                        counter++;
                    }
                }
                return counter === this.tokens.length();
            }
        }
    }
}

function turnView() {
    return {
        turn: turn(),
        getCoordinate: function (maxRows, maxColumns) {
            let row = this.getValidValue("row", maxRows);
            let column = this.getValidValue("column", maxColumns);
            let userCoordinate = coordinate(row, column);
            return userCoordinate;
        },
        getValidValue: function (name, maxValue) {
            let value = 0;
            let error = true;
            do {
                value = console.readString("Insert " + name + ": ");
                error = value < 0 || value > maxValue;
                if (error) {
                    console.writeln("Insert value between 0 and " + maxValue);
                }
            } while (error);
            return value;
        }
    }
}

function turn() {
    return {
        color: "R",
        getColor: function () {
            return this.color;
        },
        nextTurn: function () {
            //todo
        }
    }
}

function coordinate(row, column) {
    return {
        row: row,
        column: column,
        getRow: function () {
            return this.row;
        },
        getColumn: function () {
            return this.column;
        },
        getHorizontals: function () {
            const MAX_COORDINATES = 3; //todo
            const POSITIVE_LIMIT = 9; //todo
            const NEGATIVE_LIMIT = 0; //todo
            let coordinates = [];
            let counter = 0;
            if (this.row + 1 <= POSITIVE_LIMIT && counter <= MAX_COORDINATES) {
                this.row++;
                coordinates += coordinate(this.row, this.column);
                counter++;
            }
            maxCounter = 0;
            if (this.row - 1 >= NEGATIVE_LIMIT && counter <= MAX_COORDINATES) {
                this.row--;
                coordinates += coordinate(this.row, this.column);
                counter++;
            }
            return coordinates;
        }
    }
}

function token() {
    return {
        color: "",
        hole: true,

        setColor: function (color) {
            this.color = color;
        },
        getColor: function () {
            return this.color;
        },
        isHole: function () {
            return this.hole;
        },
        setHole: function (boolean) {
            this.hole = boolean;
        },
        test: function () {
            console.writeln("desde token tripas");
        }
    }
}

function color() { //todo howto make enum?
    Red = "R";
    Yellow = "Y";
}

function yesNoDialog() {
    return {
        YES: "yes",
        NO: "no",
        response: "",
        error: true,
        read: function (message) {
            do {
                this.response = console.readString(message);
                this.error = this.response != this.YES && this.response != this.NO;
                if (this.error) {
                    console.writeln("Response must be " + this.YES + " or " + this.NO);
                }
            } while (this.error);
            return this.response;
        },
        isAffirmative() {
            return this.response === this.YES;
        }
    }
}