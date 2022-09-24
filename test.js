const { Console } = require("console-mpds");
const console = new Console();

connect4().init();

function connect4() {
    const gameView = createGameView();
    const game = createGame(gameView);
    return {
        init() {
            createYesNoDialogView = createYesNoDialogView();
            do {
                this.game.play();
                this.createYesNoDialogView.read(messages().PLAY_AGAIN);
            } while (this.createYesNoDialogView.isAffirmative());
        }
    }
}

function createGame(gameView) {
    const board = createBoard(gameView.getBoardView());
    const turn = createTurn();
    return {
        play() {
            board.reset();
            gameView.showTitle();
            let finished;
            do{ 
                board.show();        
                turn.show(gameView.getTurnView());
                let column = board.getColumn();
                board.putTurnColorOnColumn(column, turn.getColor());
                finished = board.isWinner() || board.isTied();
                if (!finished){
                    turn.change();
                }
            }while(!finished);
            board.show();
            this.showResult();
        },

        showResult(){
            if(board.isWinner()){
                gameView.showWinnerMessage(turn.getColor());
            }else{
                gameView.showTiedGameMessage();
            }       
         }
    }
}

function createBoard(boardView){
    const MAX_ROWS = 6;
    const MAX_COLUMNS = 7;
    color --> colors[][]
    //square -->
    
    return {

        reset(){
            
        }

        show(){

        },

        getColumn(){

        },
        
        update(column, color){
            //getCoordinate(column) //5,column
            getFirstEmptyRow(column) //5
            array[5][column]

        }
    }
}

function createGameView() {
    const boardView = createBoardView();
    const turnView = createTurnView();
    return {
        getBoardView(){
            return boardView;
        },
        getTurnView(){
            return turnView;
        }
    }
}

function createTurn() {
    return {
        show(turnView) {

        }
    }
}







function createYesNoDialogView() {
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