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
        board: board(),
        turnView: turnView(),
        init: function () {
            const MAX_ROWS = 7;
            const MAX_COLUMNS =  9;
            console.writeln("Connect4 title");
            this.board.fillEmptyTokens(MAX_ROWS, MAX_COLUMNS);//todo howto in board constructor
            do {
                this.show();
                do {
                    token = this.turnView.getToken(MAX_ROWS, MAX_COLUMNS);
                } while (!this.board.isHole(token));
                this.board.putToken(token);
                this.turnView.nextTurn();
            } while (this.board.isEndGame());
            this.board().isFullBoard() === true ? "Game over" : "Player " + this.turnView.getColor() + " win!";
        },
        show: function () {
            let tokens = this.board.getTokens();
            for (let i = 0; i < tokens.length(); i++) {
                currentColor = tokens[i].getColor();
                hole = tokens[i].isHole();
                if (currentColor === colors().Red) {
                    console.write(" R ");
                }
                if (currentColor === colors().Yellow) {
                    console.write(" Y ");
                }
                if (hole === true) {
                    console.write(" o ");
                }
                if (tokens[i].getColumn() === this.Board.getMaxColumns){
                    console.writeln("");
                }
            }
        }
    }
}

function board() {
    return {
        tokens: [],
        fillEmptyTokens: function (maxRows, maxColumns) {
            for (let i = 0; i < maxRows; i++) {
                for (let j = 0; j < maxColumns; j++) {
                    let coordinate = coordinate(i, j);
                    let token = token(coordinate);
                    this.tokens.push(token);
                }
            }
            return this.tokens;
        },
        isHole: function (token) {
            tokenHole = false;
            for (let i = 0; i < tokens.length(); i++) {
                if (tokens[i].getCoordinate() === token.getCoordinate()) {
                    tokenHole = token.isHole();
                }
                return tokenHole;
            }
        },
        getTokens: function (){
            return this.tokens;
        }
    }
}

function turnView() {
    return{
        turn: turn(),
        getToken: function (maxRows, maxColumns){
            let color = this.turn.getColor;
            let row = 0;
            const errorRow = row < 0 && row > maxRows;
            do{
                row = console.readString("Insert row: ");
                if (errorRow){
                    console.writeln("Insert value between 0 and " + maxRows);
                }
            }while (errorRow);
            let column = 0;
            const errorColumn = column < 0 && column > maxColumns;
            do{
                column = console.readString("Insert column: ");
                if (errorColumn){
                    console.writeln("Insert value between 0 and " + maxColumns);
                }
            }while (errorColumn);
            let coordinate = coordinate(row, column);
            return token(color, coordinate);
        }
    }
}

function turn(){
    return{
        currentColor: color.Red,
        getColor: function (){
            return this.currentColor;
        }
    }
}

function coordinate(row, column){
    return{
        row: row,
        column: column,
    }
}

function token(color, coordinate){
    return{
        coordinate: coordinate,
        color: color,
        hole: true,

        setColor: function (color){
            this.color = color;
        },
        getColor: function (){
            return this.color;
        },
        isHole: function (){
            return this.hole;
        },
        setHole: function (boolean){
            this.hole = boolean;
        }
        
    }
}

function color(){ //todo how to make enum?
    Red,
    Yellow
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