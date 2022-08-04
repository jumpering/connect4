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
        MAX_COLUMNS:  9, 
        board: board(),
        turnView: turnView(),
        init: function () {
            console.writeln("Connect4 title");
            this.board.fillAllTokensWithHoles(this.MAX_ROWS, this.MAX_COLUMNS);//todo howto in board constructor
            do {
                this.show();
                do {
                    token = this.turnView.getToken(this.MAX_ROWS, this.MAX_COLUMNS);
                } while (!this.board.isHole(token));
                this.board.putToken(token);
                this.turnView.nextTurn();
            } while (this.board.isEndGame());
            this.board.isComplete() === true ? "Game over" : "Player " + this.turnView.getColor() + " win!";
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
                if (tokens[i].getColumn() === this.MAX_COLUMNS){
                    console.writeln("");
                }
            }
        }
    }
}

function board() {
    return {
        tokens: [],
        fillAllTokensWithHoles: function (maxRows, maxColumns) {
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
        },
        isEndGame: function (){
            //todo 
        },
        isComplete: function (){
            const TOTAL_HOLES = 63; //todo must be MAX_ROWS * MAX_COLUMNS
            let counter = 0;
            for (let i= 0; i < this.tokens.length(); i++){
                if(!this.tokens[i].isHole()){
                    counter++;
                }
            }
            return counter === TOTAL_HOLES;
        }
    }
}

function turnView() {
    return{
        turn: turn(),
        getToken: function (maxRows, maxColumns){
            let color = this.turn.getColor;
            let row = this.getValidValue("row", maxRows);
            let column = this.getValidValue("column", maxColumns);
            let coordinate = coordinate(row, column);
            return token(color, coordinate);
        },
        getValidValue: function (name, maxValue){
            let value = 0;
            const error = value < 0 && value > maxValue;
            do{
                value = console.readString("Insert " + name + ": ");
                if (error){
                    console.writeln("Insert value between 0 and " + maxValue);
                }
            }while (error);
            return value;
        }
    }
}

function turn(){
    return{
        color: color.Red,
        getColor: function (){
            return this.color;
        },
        nextTurn: function (){
            //todo
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

function color(){ //todo howto make enum?
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