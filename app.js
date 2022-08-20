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
            this.board.reset(this.MAX_ROWS, this.MAX_COLUMNS);//todo howto in board constructor?
            do {
                this.show();
                this.turnView.nextTurn();
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
            console.writeln("maxRows: " + maxRows );
            this.tokens = new Array(maxRows)
            for (let i = 0; i < maxRows; i++) {
                this.tokens[i] = new Array(maxColumns);
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
            return this.isFilled() || this.isOnLineTokens();
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
            return countTokens === 42;//todo magic number
        },
        isOnLineTokens: function () {
            const IN_LINE = 4;
            let onLineTokens = false;
            for (const color in colors()) {
                onLineTokens ||= this.isHorizontal(color, IN_LINE);
                onLineTokens ||= this.isVertical(color, IN_LINE); 
                onLineTokens ||= this.isDiagonal(color, IN_LINE);
                onLineTokens ||= this.isReverseDiagonal(color, IN_LINE);
              }
              return onLineTokens;
        },
        isHorizontal: function (color, inlineNumberOfTokens) { //repeated code and magic numbers
            let counterPositions = 0;
            for (let i = 0; i < this.tokens.length; i++) {
                for (let j = 0; j < this.tokens[i].length; j++) {
                    if (typeof (this.tokens[i][j]) === 'object' && this.tokens[i][j].getColor() === color) {
                        counterPositions++;
                    }
                    if (typeof (this.tokens[i][j]) === 'undefined' || this.tokens[i][j].getColor() !== color) {
                        counterPositions = 0;
                    }
                    if (counterPositions === inlineNumberOfTokens) {
                        return true;
                    }
                }
                counterPositions = 0;
            }
            return false;
        },
        isVertical: function (color, inlineNumberOfTokens) { //repeated code and magic numbers
            let counterPositions = 0;
            for (let i = 0; i < 6; i++) {
                let row = this.getFirstEmptyRowFromColumn(i);
                console.writeln(row);
                for (let j = row; j < 5; j++) {
                    if (this.tokens[j + 1][i].getColor() === color) {
                        counterPositions++;
                    }
                    if (this.tokens[j + 1][i].getColor() !== color) {
                        counterPositions = 0;
                    }
                    if (counterPositions === inlineNumberOfTokens) {
                        return true;
                    }
                }
                counterPositions = 0;
            }
            return false;
        },
        isDiagonal: function (color,inlineNumberOfTokens) { //repeated code and magic numbers
            let counterPositions = 0;
            let counterColors = 0;
            for (let i = 0; i <= counterPositions, counterPositions < 6; i++) {
                for (let j = counterPositions; counterPositions <= 0, j >= 0; j--) {
                    for (let k = 0; counterPositions <= 0, k <= counterPositions; k++) {
                        let row = j--;
                        if(typeof (this.tokens[row][k]) === 'object' && this.tokens[row][k].getColor() === color){
                            counterColors++;
                        } else{
                            counterColors = 0;
                        } 
                        if (counterColors === inlineNumberOfTokens){
                            return true;
                        }  
                    }
                }
                counterPositions++;
            }
            counterPositions = 0;
            counterColors = 0;
            for (let i = 0; i <= counterPositions, counterPositions < 6; i++) {
                for (let j = counterPositions; counterPositions < 6, j <= counterPositions; j++) {
                    for (let k = 6; counterPositions < 0, k > counterPositions; k--) {
                        let row = j++;
                        if(typeof (this.tokens[row][k]) === 'object' && this.tokens[row][k].getColor() === color){
                            counterColors++;
                        } else{
                            counterColors = 0;
                        }
                        if (counterColors === inlineNumberOfTokens){
                            return true;
                        } 
                    }
                }
                counterPositions++;
            }
            return false;
        },
        isReverseDiagonal: function (color,inlineNumberOfTokens) {
            let counterPositions = 0;
            let counterColors = 0;
            for (let i = 0; i <= counterPositions, counterPositions < 6; i++) {
                let column = 6;
                for (let j = counterPositions; counterPositions <= 0, j >= 0; j--) {
                    for (let k = 0; counterPositions <= 0, k <= counterPositions; k++) {
                        let row = j--;
                        if(typeof (this.tokens[row][k]) === 'object' && this.tokens[row][k].getColor() === color){
                            counterColors++;
                        } else{
                            counterColors = 0;
                        } 
                        if (counterColors === inlineNumberOfTokens){
                            return true;
                        }  
                        column--;
                    }
                }
                counterPositions++;
            }
            counterPositions = 0;
            counterColors = 0;
            for (let i = 0; i <= counterPositions, counterPositions < 6; i++) {
                let column = 0;
                for (let j = counterPositions; counterPositions < 6, j <= counterPositions; j++) {
                    for (let k = 6; counterPositions < 0, k > counterPositions; k--) {
                        let row = j++;
                        if(typeof (this.tokens[row][k]) === 'object' && this.tokens[row][k].getColor() === color){
                            counterColors++;
                        } else{
                            counterColors = 0;
                        }
                        if (counterColors === inlineNumberOfTokens){
                            return true;
                        } 
                        column++;
                    }
                }
                counterPositions++;
            }
            return false;
        },
        getTokens: function () {
            return this.tokens;
        }
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