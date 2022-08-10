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
            this.board.reset(this.MAX_ROWS, this.MAX_COLUMNS);//in board constructor?
            do {
                this.show();
                console.write("\nTurn " + this.turnView.getColor());
                let inputColumn = "";
                do {
                    inputColumn = this.turnView.getColumn(this.MAX_COLUMNS);
                    if (this.board.isFilledColumn(inputColumn)) {
                        console.writeln("This column has not empty holes, select another column");
                    }
                } while (this.board.isFilledColumn(inputColumn));
                this.board.putToken(inputColumn, this.turnView.getColor());
                this.turnView.nextTurn();
            } while (!this.board.isEndGame());
            this.show();
            console.writeln(this.board.isFilled() === true ? "Game over" : "Player " + this.turnView.getColor() + " win!");//todo ojo color ganador
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
            let emptyRow = this.getNextEmptyRow(column);
            this.tokens[emptyRow][column] = token(color);
        },
        getNextEmptyRow: function (column) {
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
        isFourInLine: function () {
            return this.isHorizontal(colors().Red);//todo foreach colors
        },
        isHorizontal: function (color) {
            let counter = 0;
            for (let i = 0; i < this.tokens.length; i++) {
                for (let j = 0; j < this.tokens[i].length; j++) {
                    //para cada fila
                    if (typeof (this.tokens[i][j]) === 'object' && this.tokens[i][j].getColor() === color) {
                        counter++;
                    }
                    if (counter === 4) {
                        console.writeln("son 4: " + counter);
                        return true;
                    }
                    if (typeof (this.tokens[i][j]) === 'undefined') {
                        counter = 0;
                    }
                }
                counter = 0;
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
        color: colors().Red,
        getColor: function () {
            return this.color;
        },
        nextTurn: function () {
            if (this.color === colors().Red) {
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