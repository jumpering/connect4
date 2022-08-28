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
                this.yesNoDialog.read("Play again? (yes/no)");
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
            this.board.reset(this.MAX_ROWS, this.MAX_COLUMNS);//todo howto in board constructor?
            do {
                this.show();
                console.write("\nTurn " + this.turnView.getColor());
                let inputColumn;
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
            this.turnView.nextTurn();
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
        lastToken: undefined,
        tokens: [],
        inLineChecker: undefined,
        reset: function (maxRows, maxColumns) {
            this.tokens = new Array(maxRows);
            for (let i = 0; i < maxRows; i++) {
                this.tokens[i] = new Array(maxColumns);
            }
            this.inLineChecker = inLineChecker();
        },
        isFilledColumn: function (column) {
            return typeof (this.tokens[0][column]) === 'object';
        },
        putToken: function (column, color) {
            let inputCoordinate = coordinate(this.getFirstEmptyRowFromColumn(column), column);
            this.lastToken = token(inputCoordinate, color);
            this.tokens[this.lastToken.getRow()][this.lastToken.getColumn()] = this.lastToken;
        },
        getFirstEmptyRowFromColumn: function (column) {
            for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (typeof (this.tokens[i][column]) === 'undefined') {
                    return i;
                }
            }
        },
        isEndGame: function () {
            return this.isFilled() || this.isInLineToken(this.lastToken);
        },
        isFilled: function () {
            let countTokens = 0;
            for (let i = 0; i < this.tokens.length; i++) {
                for (let j = 0; j < this.tokens[i].length; j++) {
                    if (typeof (this.tokens[i][j]) === 'object') {
                        countTokens++;
                    }
                }
            }
            return countTokens === this.tokens.length * this.tokens[0].length;
        },
        isInLineToken: function (token) {
            return this.inLineChecker.isInLineToken(this.tokens, token);
        },
        getTokens: function () {
            return this.tokens;
        }
    }
}

function inLineChecker() {
    return {
        IN_LINE_NUMBER_OF_TOKENS: 4,
        tokens: [],
        isInLineToken: function (tokens, token) {
            this.tokens = tokens;
            let inLineToken = false;
            inLineToken ||= this.isInLineHorizontal(token);
            inLineToken ||= this.isInLineVertical(token);
            inLineToken ||= this.isInLineDiagonal(token);
            inLineToken ||= this.isInLineReverseDiagonal(token);
            return inLineToken;
        },
        isInLineHorizontal: function (token) { //todo repeated code?
            let counterColors = 0;
            let inLine = false;
            for (let i = 0; i < this.tokens[0].length; i++) {
                if (typeof (this.tokens[token.getRow()][i]) === 'object' && this.tokens[token.getRow()][i].getColor() === token.getColor()) {
                    counterColors++;
                } else {
                    counterColors = 0;
                }
                inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
            }
            return inLine;
        },
        isInLineVertical: function (token) { //todo repeated code?
            let counterColors = 0;
            let inLine = false;
            for (let i = 0; i < this.tokens.length; i++) {
                if (typeof (this.tokens[i][token.getColumn()]) === 'object' && this.tokens[i][token.getColumn()].getColor() === token.getColor()) {
                    counterColors++;
                } else {
                    counterColors = 0;
                }
                inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
            }
            return inLine;
        },
        isInLineDiagonal: function (token) { //todo repeated code, only works to right
        let counterColors = 0;
        let inLine = false;
        let row = token.getRow();
        let column = token.getColumn();
        let color = token.getColor();
         for (let i = 0; i < this.IN_LINE_NUMBER_OF_TOKENS; i++) {
            if((row + i) >= 0 && (row + i) < 6 && (column - i) >= 0 && (column - i) < 7){
                if(typeof (this.tokens[row + i][column - i]) === 'object' && this.tokens[row + i][column - i].getColor() === color){
                    counterColors++;
                } else {
                    counterColors = 0;
                }
            }
            inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;   
            }
            return inLine;
        },
        isInLineReverseDiagonal: function (token) { //todo
            let counterColors = 0;
            let inLine = false;

            return inLine;
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
        }
    }
}

function token(coordinate, color) {//todo innecesary class?
    return {
        color: color,
        coordinate: coordinate,
        getColor: function () {
            return this.color;
        },
        getRow: function () {
            return this.coordinate.getRow();
        },
        getColumn: function () {
            return this.coordinate.getColumn();
        }
    }
}

function colors() { //todo howto enum?
    return {
        Red: "Red",
        Yellow: "Yellow",
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

// function inLine() { //version analiza todo el board
//     return {
//         IN_LINE_NUMBER_OF_TOKENS: 4,
//         tokens: [],
//         isInLineTokens: function (tokens) {
//             this.tokens = tokens;
//             let inLineTokens = false;
//             for (const color in colors()) {
//                 inLineTokens ||= this.isInLineHorizontal(color);
//                 inLineTokens ||= this.isInLineVertical(color);
//                 inLineTokens ||= this.isInLineDiagonal(color);
//                 inLineTokens ||= this.isInLineReverseDiagonal(color);
//             }
//             return inLineTokens;
//         },
//         isInLineHorizontal: function (color) { //repeated code
//             let counterColors = 0;
//             let inLine = false;
//             for (let i = 0; i < this.tokens.length; i++) {
//                 for (let j = 0; j < this.tokens[i].length; j++) {
//                     if (this.isColorOnPosition(i, j, color)) {
//                         counterColors++;
//                     } else {
//                         counterColors = 0;
//                     }
//                     inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
//                 }
//                 counterColors = 0;
//             }
//             return inLine;
//         },
//         isInLineVertical: function (color) { //repeated code
//             let counterColors = 0;
//             let inLine = false;
//             for (let i = 0; i < this.tokens[0].length; i++) {
//                 for (let j = 0; j < this.tokens.length; j++) {
//                     if (this.isColorOnPosition(j, i, color)) {
//                         counterColors++;
//                     } else {
//                         counterColors = 0;
//                     }
//                     inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
//                 }
//                 counterColors = 0;
//             }
//             return inLine;
//         },
//         isInLineDiagonal: function (color) { //todo repeated code, magic numbers, hardcoded
//             let counterColors = 0;
//             let inLine = false;
//             for (let i = 0, row = 6, column = 0; i < 6; i++, row = 6 - i, column = 0, counterColors = 0) {
//                 for (let j = i; j < 6; j++) {
//                     if (this.isColorOnPosition(--row, column++, color)) {
//                         counterColors++;
//                     } else {
//                         counterColors = 0;
//                     }
//                     inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
//                 }
//             }
//             for (let i = 0, row = 0, column = 6; i < 6; i++, row = 0 + i, column = 6) {
//                 for (let j = i; j < 6; j++) {
//                     if (this.isColorOnPosition(row++, column--, color)) {
//                         counterColors++;
//                     } else {
//                         counterColors = 0;
//                     }
//                     inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
//                 }
//             }
//             return inLine;
//         },
//         isInLineReverseDiagonal: function (color) { //todo repeated code, magic numbers, hardcoded
//             let counterColors = 0;
//             let inLine = false;
//             for (let i = 0, row = 0, column = 0; i < 6; i++, row = 0 + i, column = 0, counterColors = 0) {
//                 for (let j = i; j < 6; j++) {
//                     if (this.isColorOnPosition(row++, column++, color)) {
//                         counterColors++;
//                     } else {
//                         counterColors = 0;
//                     }
//                     inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
//                 }
//             }
//             for (let i = 0, row = 6, column = 6; i < 6; i++, row = 6 - i, column = 6, counterColors = 0) {
//                 for (let j = i; j < 6; j++) {
//                     if (this.isColorOnPosition(--row, column--, color)) {
//                         counterColors++;
//                     } else {
//                         counterColors = 0;
//                     }
//                     inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
//                 }
//             }
//             return inLine;
//         },
//         isColorOnPosition(row, column, color) {
//             return typeof (this.tokens[row][column]) === 'object' && this.tokens[row][column].getColor() === color;
//         },
//     }
// }