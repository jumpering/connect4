const { Console } = require("console-mpds");
const console = new Console();

connect4().playGame();

function connect4() {
    const game = createGame(createGameView());
    return {
        playGame() {
            yesNoDialogView = createYesNoDialogView();
            do {
                game.playMatch();
                this.yesNoDialogView.read(messageView().PLAY_AGAIN);
            } while (this.yesNoDialogView.isAffirmative());
        }
    }
}

function createGame(gameView) {
    const board = createBoard(gameView.getBoardView());
    const turn = createTurn(gameView.getTurnView());
    return {
        playMatch() {
            board.reset();
            gameView.showTitle();
            let finished;
            do {
                board.show();
                turn.show(gameView.getTurnView());
                let coordinate = board.getCoordinate();
                board.update(coordinate, turn.getColor());
                finished = board.isWinner(coordinate) || board.isTied();
                if (!finished) {
                    turn.change();
                }
            } while (!finished);
            board.show();
            this.showResult();
        },

        showResult() {
            if (board.isTied()) {
                gameView.showTiedGameMessage();
            } else {
                gameView.showWinnerMessage(turn.getColor());
            }
        }
    }
}

function createGameView() {
    return {
        getBoardView() {
            return createBoardView();
        },

        getTurnView() {
            return createTurnView();
        },

        showTiedGameMessage() { },

        showWinnerMessage() { }
    }
}

function createBoard(boardView) {
    const MAX_ROWS = 6;
    const MAX_COLUMNS = 7;
    return {
        colors: [],
        reset: function () {
            this.colors = new Array(MAX_ROWS);
            for (let i = 0; i < MAX_ROWS; i++) {
                this.colors[i] = new Array(MAX_COLUMNS);
            }
        },

        show() { },

        getCoodinate() { },

        update(coordinate, color) { }
    }
}

function createBoardView() {}

function createTurn(turnView) {
    return {
        currentColor: colors().Red,

        show() {
            //turnView...
        },
        change() { }
    }
}

function createTurnView() { }

function createYesNoDialogView() {
    return {
        YES: messageView().YES,
        NO: messageView().NO,
        response: "",
        error: true,
        read: function (message) {
            do {
                this.response = console.readString(message);
                this.error = this.response != this.YES && this.response != this.NO;
                if (this.error) {
                    console.writeln(messageView().RESPONSE_MUST_BE + this.YES + messageView().OR + this.NO);
                }
            } while (this.error);
            return this.response;
        },
        isAffirmative: function () {
            return this.response === this.YES;
        }
    }
}

function messageView() {
    return {
        TITLE: "\n      Connect4\n",
        TURN_BY: "\nTurn ",
        COLUMN_NOT_EMPTY: "This column has not empty holes, select another column",
        INSERT_COLUMN: " insert column: ",
        TIED_GAME: "Game over",
        PLAYER: "Player ",
        WIN_GAME: " win!",
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