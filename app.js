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
                this.yesNoDialog.read(messages().PLAY_AGAIN);
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
            console.writeln(messages().TITLE);
            this.board.reset(this.MAX_ROWS, this.MAX_COLUMNS);
            this.turnView.setInitColor(colors.Red);
            do {
                this.turnView.nextTurn();
                this.show();
                let turnInputColumn;
                do {
                    turnInputColumn = this.turnView.getInputColumn(this.MAX_COLUMNS);
                    if (this.board.isFilledColumn(turnInputColumn)) {
                        console.writeln(messages().COLUMN_NOT_EMPTY);
                    }
                } while (this.board.isFilledColumn(turnInputColumn));
                this.board.putToken(turnInputColumn, this.turnView.getColor());
            } while (!this.board.isEndGame());
            this.show();
            console.writeln(this.showEndGame());
        },
        show: function () {
            let tokens = this.board.getTokens();
            console.writeln(messages().BOARD_HEADER);
            for (let i = 0; i < tokens.length; i++) {
                for (let j = 0; j < tokens[i].length; j++) {
                    if (typeof (tokens[i][j]) === 'undefined') {
                        console.write(messages().BOARD_HOLE);
                    }
                    if (typeof (tokens[i][j]) === 'object') {
                        if (tokens[i][j].getColor() === colors().Red) {
                            console.write(messages().BOARD_RED);
                        }
                        if (tokens[i][j].getColor() === colors().Yellow) {
                            console.write(messages().BOARD_YELLOW);
                        }
                    }
                }
                console.writeln("");
            }
        },
        showEndGame: function () {
            if (this.board.isFilled()) {
                return messages().GAME_OVER;
            }
            return messages().PLAYER + this.turnView.getColor() + messages().WIN;
        }
    }
}

function board() {
    return {
        lastToken: undefined,
        tokens: [],
        inLineChecker: inLineChecker(),
        reset: function (maxRows, maxColumns) {
            this.tokens = new Array(maxRows);
            for (let i = 0; i < maxRows; i++) {
                this.tokens[i] = new Array(maxColumns);
            }
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
            return  this.isInLineToken(this.lastToken) || this.isFilled();
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
        isInLineHorizontal: function (token) {
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
        isInLineVertical: function (token) {
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
        isInLineDiagonal: function (token) {
            let counterColors = 1;
            let inLine = false;
            let row = token.getRow();
            let column = token.getColumn();
            for (let i = 1; i < this.IN_LINE_NUMBER_OF_TOKENS; i++) {
                if ((row + i) >= 0 && (row + i) < this.tokens.length && (column - i) >= 0 && (column - i) < this.tokens[0].length) {
                    if (typeof (this.tokens[row + i][column - i]) === 'object' && this.tokens[row + i][column - i].getColor() === token.getColor()) {
                        counterColors++;
                    }
                }
                if ((row - i) >= 0 && (row - i) < this.tokens.length && (column + i) >= 0 && (column + i) < this.tokens[0].length) {
                    if (typeof (this.tokens[row - i][column + i]) === 'object' && this.tokens[row - i][column + i].getColor() === token.getColor()) {
                        counterColors++;
                    }
                }
                inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
            }
            return inLine;
        },
        isInLineReverseDiagonal: function (token) {
            let counterColors = 1;
            let inLine = false;
            let row = token.getRow();
            let column = token.getColumn();
            for (let i = 1; i < this.IN_LINE_NUMBER_OF_TOKENS; i++) {
                if ((row + i) >= 0 && (row + i) < this.tokens.length && (column + i) >= 0 && (column + i) < this.tokens[0].length) {
                    if (typeof (this.tokens[row + i][column + i]) === 'object' && this.tokens[row + i][column + i].getColor() === token.getColor()) {
                        counterColors++;
                    }
                }
                if ((row - i) >= 0 && (row - i) < this.tokens.length && (column - i) >= 0 && (column - i) < this.tokens[0].length) {
                    if (typeof (this.tokens[row - i][column - i]) === 'object' && this.tokens[row - i][column - i].getColor() === token.getColor()) {
                        counterColors++;
                    }
                }
                inLine ||= counterColors === this.IN_LINE_NUMBER_OF_TOKENS;
            }
            return inLine;
        },
    }
}

function turnView() {
    return {
        turn: turn(),
        getInputColumn: function (maxColumns) {
            let column = 0;
            let error = true;
            do {
                column = console.readNumber(messages().TURN_BY + this.getColor() + messages().INSERT_COLUMN);
                error = column < 0 || column > maxColumns - 1;
                if (error) {
                    console.writeln(messages().INSERT_VALUES_BETWEEN + (maxColumns - 1));
                }
            } while (error);
            return column;
        },
        getColor: function () {
            return this.turn.getColor();
        },
        nextTurn: function () {
            this.turn.nextTurn();
        },
        setInitColor: function (color){
            this.turn.setInitColor(color);
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
            this.color === colors().Red ? this.color = colors().Yellow : this.color = colors().Red;
        },
        setInitColor: function (color){
            this.color = color;
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

function token(coordinate, color) {
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

function colors() {
    return {
        Red: messages().RED,
        Yellow: messages().YELLOW,
    }
}

function yesNoDialog() {
    return {
        YES: messages().YES,
        NO: messages().NO,
        response: "",
        error: true,
        read: function (message) {
            do {
                this.response = console.readString(message);
                this.error = this.response != this.YES && this.response != this.NO;
                if (this.error) {
                    console.writeln(messages().RESPONSE_MUST_BE + this.YES + messages().OR + this.NO);
                }
            } while (this.error);
            return this.response;
        },
        isAffirmative: function () {
            return this.response === this.YES;
        }
    }
}

function messages() {
    return {
        TITLE: "\n      Connect4\n",
        TURN_BY: "\nTurn ",
        COLUMN_NOT_EMPTY: "This column has not empty holes, select another column",
        INSERT_COLUMN: " insert column: ",
        GAME_OVER: "Game over",
        PLAYER: "Player ",
        WIN: " win!",
        BOARD_HEADER: "\n 0  1  2  3  4  5  6\n -------------------",
        BOARD_HOLE: " · ",
        BOARD_RED: " R ",
        BOARD_YELLOW: " Y ",
        INSERT_VALUES_BETWEEN: "Insert value between 0 and ",
        PLAY_AGAIN: "Play again? (yes/no)",
        YES: "yes",
        NO: "no",
        RESPONSE_MUST_BE: "Response must be ",
        OR: " or ",
        RED: "Red",
        YELLOW: "Yellow"
    }
}