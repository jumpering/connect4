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
                this.yesNoDialog.read("Play again?");
            } while (this.yesNoDialog.isAffirmative());
        }
    }
}

function boardView() {
    return {
        MAX_ROWS: 6,
        MAX_COLUMNS: 7,
        board: board(),
        turnView: turnView(),
        init: function () {
            console.writeln("\n      Connect4\n");
            this.board.reset(this.MAX_ROWS, this.MAX_COLUMNS);//todo in board constructor?
            do {
                this.show();
                this.turnView.nextTurn();//todo es un poco raro...
                console.write("\nTurn " + this.turnView.getColor());
                let inputColumn;
                do {
                    inputColumn = this.turnView.getColumn(this.MAX_COLUMNS);
                    if (this.board.isFilledColumn(inputColumn)) {
                        console.writeln("This column has not empty holes, select another column");
                    }
                } while (this.board.isFilledColumn(inputColumn));
                this.board.putToken(inputColumn, this.turnView.getColor());
            } while (!this.board.isEndGame());
            this.show();
            console.writeln(this.board.isFilled() === true ? "Game over" : "Player " + this.turnView.getColor() + " win!");
        },
        show: function () {
            let tokens = this.board.getTokens();
            console.writeln("\n 0  1  2  3  4  5  6");
            console.writeln("--------------------");
            for (let i = 0; i < tokens.length; i++) {
                for (let j = 0; j < tokens[i].length; j++) {
                    if (typeof (tokens[i][j]) === 'undefined') {
                        console.write(" · ");
                    }
                    if (typeof (tokens[i][j]) === 'object') {
                        if (tokens[i][j].getColor() === colors().Red) {
                            console.write(" R ");
                        }
                        if (tokens[i][j].getColor() === colors().Yellow) {
                            console.write(" Y ");
                        }
                    }
                }
                console.writeln("");
            }
        }
    }
}

function board() {
    return {
        tokens: [],
        reset: function (maxRows, maxColumns) {
            this.tokens = new Array(maxRows)//todo remove new
            for (let i = 0; i < maxRows; i++) {
                this.tokens[i] = new Array(maxColumns);//todo remove new
            }
        },
        isFilledColumn: function (column) {
            return typeof (this.tokens[0][column]) === 'object';
        },
        putToken: function (column, color) {
            let emptyRow = this.getFirstEmptyRowFromColumn(column);
            this.tokens[emptyRow][column] = token(color);
        },
        getFirstEmptyRowFromColumn: function (column) {
            for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (typeof (this.tokens[i][column]) === 'undefined') {
                    return i;
                }
            }
        },
        isEndGame: function () {
            return this.isFilled() || this.isFourInLine();
        },
        isFilled: function () {
            countTokens = 0;
            for (let i = 0; i < this.tokens.length; i++) {
                for (let j = 0; j < this.tokens[i].length; j++) {
                    if (typeof (this.tokens[i][j]) === 'object') {
                        countTokens++;
                    }
                }
            }
            return countTokens === 42;//todo magic number
        },
        isFourInLine: function () {//todo foreach colors
            return this.isHorizontal(colors().Red) || this.isHorizontal(colors().Yellow)
                || this.isVertical(colors().Red) || this.isVertical(colors().Yellow)
                || this.isDiagonal(colors().Red) || this.isDiagonal(colors().Yellow);
            // || this.isReverseDiagonal(colors().Red) || this.isReverseDiagonal(colors().Yellow);
        },
        isHorizontal: function (color) {
            const FOUR_IN_LINE = 4;
            let counter = 0;
            for (let i = 0; i < this.tokens.length; i++) {
                for (let j = 0; j < this.tokens[i].length; j++) {
                    if (typeof (this.tokens[i][j]) === 'object' && this.tokens[i][j].getColor() === color) {
                        counter++;
                    } else if (typeof (this.tokens[i][j]) === 'undefined') {
                        counter = 0;
                    }
                    if (counter === FOUR_IN_LINE) {
                        return true;
                    }
                }
                counter = 0;
            }
        },
        isVertical: function (color) {
            const FOUR_IN_LINE = 4;
            let counter = 0;
            for (let i = 0; i < 7; i++) {//todo magic number columns
                let row = this.getFirstEmptyRowFromColumn(i);
                for (let j = row; j < 5; j++) {//todo magic number rows
                    if (this.tokens[j + 1][i].getColor() === color) {//todo magic number + 1
                        counter++;
                    }
                    if (this.tokens[j + 1][i].getColor() !== color) {
                        counter = 0;
                    }
                    if (counter === FOUR_IN_LINE) {
                        return true;
                    }
                }
                counter = 0;
            }
        },
        isDiagonal: function (color) {
            let counter = 0;
            let coordinates = [];
            for (let i = 0; i <= counter, counter <= 5; i++) {
                for (let j = counter; counter <= 0, j >= 0; j--) {
                    for (let k = 0; counter <= 0, k <= counter; k++) {
                        coordinates.push(coordinate(j, k));
                        console.write(" (" + j-- + ", " + k + ")");
                    }
                    console.writeln(" ");
                }
                counter++;
            }
            counter = 0;
            for (let i = 0; i <= counter, counter <= 5; i++) {
                for (let j = counter; counter < 5, j <= counter; j++) {
                    for (let k = 6; counter < 0, k > counter; k--) {
                        //coordinates.push(coordinate(j,k));
                        console.write(" (" + j++ + ", " + k + ")");
                    }
                    console.writeln(" ");
                }
                counter++;
            }
            //return false;
        },
        isReverseDiagonal: function (color) {
            return false;
        },
        getTokens: function () {
            return this.tokens;
        },
    }
}

function turnView() {
    return {
        turn: turn(),
        getColumn: function (maxColumns) {
            let column = 0;
            let error = true;
            do {
                column = console.readNumber(" insert column: ");
                error = column < 0 || column >= maxColumns;
                if (error) {
                    console.writeln("Insert value between 0 and " + (maxColumns - 1));
                }
            } while (error);
            return column;
        },
        getColor: function () {
            return this.turn.getColor();
        },
        nextTurn: function () {
            this.turn.nextTurn();
        }
    }
}

function turn() {
    return {
        color: undefined,
        getColor: function () {
            return this.color;
        },
        nextTurn: function () {
            if (this.color === 'undefined') {
                this.color = colors().Red;
            } else if (this.color === colors().Red) {
                this.color = colors().Yellow;
            } else {
                this.color = colors().Red;
            }
        }
    }
}

function coordinate(row, column) {//todo dead code
    return {
        row: row,
        column: column,
        getRow: function () {
            return this.row;
        },
        getColumn: function () {
            return this.column;
        },
    }
}

function token(color) {//todo innecesary class?
    return {
        color: color,
        getColor: function () {
            return this.color;
        }
    }
}

function colors() { //todo howto make enum?
    return {
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
        isAffirmative: function () {
            return this.response === this.YES;
        }
    }
}