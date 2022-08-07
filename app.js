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
            console.writeln("Connect4\n");
            this.board.fillAllHolesWithNoColorAndEmptyFlagTokens(this.MAX_ROWS, this.MAX_COLUMNS);//in board constructor, not in view
            do {
                this.show();
                console.writeln("Turn color: " + this.turnView.getColor());
                let inputCoordinate = "";
                do {
                    inputCoordinate = this.turnView.getCoordinate(this.MAX_ROWS, this.MAX_COLUMNS);
                } while (!this.board.isHole(inputCoordinate));
                this.board.putToken(inputCoordinate, this.turnView.getColor());
                this.turnView.nextTurn();
            } while (!this.board.isEndGame());
            this.board.isComplete() === true ? "Game over" : "Player " + this.turnView.getColor() + " win!";
        },
        show: function () {
            let tokens = this.board.getTokens();
            for (let i = 0; i < tokens.length; i++) {
                for (let j = 0; j < tokens[i].length; j++) {
                    if (tokens[i][j].getColor() === colors().Red) {
                        console.write(" R ");
                    }
                    if (tokens[i][j].getColor() === colors().Yellow) {
                        console.write(" Y ");
                    }
                    if (tokens[i][j].isHole()) {
                        console.write(" o ");
                    }
                }
                console.writeln("");
            }
        }
    }
}

function board() {
    return {
        tokens: new Array(7),//todo remove new
        fillAllHolesWithNoColorAndEmptyFlagTokens: function (maxRows, maxColumns) {
            for (let i = 0; i < 7; i++) {
                this.tokens[i] = new Array(9);//todo remove new
            }
            for (let i = 0; i < maxRows; i++) {
                for (let j = 0; j < maxColumns; j++) {
                    this.tokens[i][j] = token();
                }
            }
        },
        isHole: function (coordinate) {
            return this.tokens[coordinate.getRow()][coordinate.getColumn()].isHole();
        },
        putToken: function (coordinate, color){
            this.tokens[coordinate.getRow()][coordinate.getColumn()].setColor(color);
            this.tokens[coordinate.getRow()][coordinate.getColumn()].setHole(false);

        },
        isEndGame: function () {//todo
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
                return counter === this.tokens.length;
            }
        },
        getTokens: function () {
            return this.tokens;
        },
    }
}

function turnView() {
    return {
        turn: turn(),
        getCoordinate: function (maxRows, maxColumns) { //todo now user can select to column like tictactoe, not like in real connect4 game
            let row = this.getValidValue("row", maxRows);
            let column = this.getValidValue("column", maxColumns);
            let inputCoordinate = coordinate(row, column);
            return inputCoordinate;
        },
        getValidValue: function (name, maxValue) {
            let value = 0;
            let error = true;
            do {
                value = console.readNumber("Insert " + name + ": ");
                error = value < 0 || value > maxValue;
                if (error) {
                    console.writeln("Insert value between 0 and " + maxValue);
                }
            } while (error);
            return value;
        },
        getColor: function (){
            return this.turn.getColor();
        },
        nextTurn: function (){
            this.turn.nextTurn();
        }
    }
}

function turn() {
    return {
        color: colors().Red,
        getColor: function () {
            return this.color;
        },
        nextTurn: function () {
            if (this.color === colors().Red){
                this.color = colors().Yellow;
            } else {
                this.color = colors().Red;
            }        
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
        color: null,
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
        }
    }
}

function colors() { //todo howto make enum?
    return{
        Red: "red",
        Yellow: "yellow",
    }
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