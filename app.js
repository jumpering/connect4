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
            console.writeln("Connect4 title");
            do {
                this.show();
                token = "";
                do {
                    token = this.turnView.getToken();
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
    const MAX_ROWS = 7;
    const MAX_COLUMNS = 9;
    return {
        tokens: [],
        tokens: this.fillEmptyTokens(),
        fillEmptyTokens: function () {
            let tokens = [];
            for (let i = 0; i < MAX_ROWS; i++) {
                for (let j = 0; j < MAX_COLUMNS; j++) {
                    let coordinateA = coordinate(i, j);
                    let tokenA = token(coordinate);
                    tokens.push(tokenA);
                }
            }
            return tokens;
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
        getMaxColumns: function (){
            return this.MAX_COLUMNS;
        },
        getTokens: function (){
            return this.tokens;
        }
    }
}

function turnView() {//todo necesita max_rows y max_columns para limitar el getToken
    return{
        turn: turn(),
        getToken: function (){
            let color = this.turn.getColor;
            let row = console.readString("Insert row: ");
            let column = console.readString("Insert column: ");
            let coordinate = coordinate(row, column);
            return token(color, coordinate); //todo relación con token con la vista?¿
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