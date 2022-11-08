const { Console } = require("console-mpds");
const console = new Console();

class ClosedInterval {

    #min;
    #max;

    constructor(min, max) {
        this.#min = min;
        this.#max = max;
    }

    isIncluded(value) {
        return this.#min <= value && value <= this.#max;
    }

    toString() {
        return `[` + this.#min + `, ` + this.#max + `]`;
    }

    equals(closedInterval) {
        if (this === closedInterval)
            return true;
        if (closedInterval === null)
            return false;
        return this.#min === closedInterval.#min && this.#max === closedInterval.#max
    }

}

class ColorView {

    #color;

    constructor(color) {
        this.#color = color;
    }

    write() {
        let color = this.#color.toString();
        console.write(color[0]);
    }
}

class Color {

    static RED = new Color(`Red`);
    static YELLOW = new Color(`Yellow`);
    static NULL = new Color(` `);
    #string;

    constructor(string) {
        this.#string = string;
    }

    static get(ordinal) {
        return Color.values()[ordinal];
    }

    static values() {
        return [Color.RED, Color.YELLOW, Color.NULL];
    }

    isNull() {
        return this === Color.NULL;
    }

    toString() {
        return this.#string;
    }

}

class Coordinate {

    static ORIGIN = new Coordinate(0, 0);
    static NUMBER_ROWS = 6;
    static #ROWS = new ClosedInterval(0, Coordinate.NUMBER_ROWS - 1);
    static NUMBER_COLUMNS = 7;
    static #COLUMNS = new ClosedInterval(0, Coordinate.NUMBER_COLUMNS - 1);

    #row;
    #column;

    constructor(row, column) {
        this.#row = row;
        this.#column = column;
    }

    shifted(coordinate) {
        return new Coordinate(this.#row + coordinate.#row,
            this.#column + coordinate.#column);
    }

    isValid() {
        return Coordinate.#isRowValid(this.getRow())
            && Coordinate.isColumnValid(this.getColumn());
    }

    static isColumnValid(column) {
        return Coordinate.#COLUMNS.isIncluded(column);
    }

    static #isRowValid(row) {
        return Coordinate.#ROWS.isIncluded(row);
    }

    getRow() {
        return this.#row;
    }

    getColumn() {
        return this.#column;
    }

    equals(coordinate) {
        if (this == coordinate)
            return true;
        if (coordinate == null)
            return false;
        return this.#column === coordinate.#column && this.#row === coordinate.#row;
    }

    toString() {
        return `Coordinate [row= ${this.#row} column= ${this.#column}]`;
    }

}

class Direction {
    static NORTH = new Direction(1, 0);
    static NORTH_EAST = new Direction(1, 1);
    static EAST = new Direction(0, 1);
    static SOUTH_EAST = new Direction(-1, 1);
    static SOUTH = new Direction(-1, 0);
    static SOUTH_WEST = new Direction(-1, -1);
    static WEST = new Direction(0, -1);
    static NORTH_WEST = new Direction(1, -1);

    #coordinate;

    constructor(row, column) {
        this.#coordinate = new Coordinate(row, column);
    }

    getOpposite() {
        for (let direction of Direction.values()) {
            if (direction.#coordinate.shifted(this.#coordinate).equals(Coordinate.ORIGIN)) {
                return direction;
            }
        }
        return null;
    }

    static values() {
        return [Direction.NORTH, Direction.NORTH_EAST, Direction.EAST, Direction.SOUTH_EAST,
        Direction.SOUTH, Direction.SOUTH_WEST, Direction.WEST, Direction.NORTH_WEST];
    }

    getCoordinate() {
        return this.#coordinate;
    }

}

class Message {
    static TITLE = new Message(`--- CONNECT 4 ---`);
    static HORIZONTAL_LINE = new Message(`-`);
    static VERTICAL_LINE = new Message(`|`);
    static TURN = new Message(`Turn: `);
    static ENTER_COLUMN_TO_DROP = new Message(`Enter a column to drop a token: `);
    static INVALID_COLUMN = new Message(`Invalid columnn!!! Values [1-7]`);
    static COMPLETED_COLUMN = new Message(`Invalid column!!! It's completed`);
    static PLAYER_WIN = new Message(`#colorS WIN!!! : -)`);
    static PLAYERS_TIED = new Message(`TIED!!!`);
    static RESUME = new Message(`Do you want to continue`);

    #string;

    constructor(string) {
        this.#string = string;
    }

    write() {
        console.write(this.#string);
    }

    writeln() {
        console.writeln(this.#string);
    }

    toString() {
        return this.#string;
    }

}

class BoardView {

    #board;
    #colorView;

    constructor(board) {
        this.#board = board;
        Message.TITLE.writeln();
    }

    writeln() {
        this.writeHorizontal();
        for (let i = Coordinate.NUMBER_ROWS - 1; i >= 0; i--) {
            Message.VERTICAL_LINE.write();
            for (let j = 0; j < Coordinate.NUMBER_COLUMNS; j++) {
                let colorView = new ColorView(this.#board.getColor(new Coordinate(i, j)));
                colorView.write();

                Message.VERTICAL_LINE.write();
            }
            console.writeln();
        }
        this.writeHorizontal();
    }

    writeHorizontal() {
        for (let i = 0; i < 4 * Coordinate.NUMBER_COLUMNS; i++) {
            Message.HORIZONTAL_LINE.write();
        }
        Message.HORIZONTAL_LINE.writeln();
    }

}

class Board {

    #colors;
    #lastDrop;

    constructor() {
        this.#colors = [];
        for (let i = 0; i < Coordinate.NUMBER_ROWS; i++) {
            this.#colors[i] = [];
        }
        this.reset();
    }

    reset() {
        for (let i = 0; i < Coordinate.NUMBER_ROWS; i++) {
            for (let j = 0; j < Coordinate.NUMBER_COLUMNS; j++) {
                this.#colors[i][j] = Color.NULL;
            }
        }
    }

    dropToken(column, color) {
        this.#lastDrop = new Coordinate(0, column);
        while (!this.isEmpty(this.#lastDrop)) {
            this.#lastDrop = this.#lastDrop.shifted(Direction.NORTH.getCoordinate());
        }
        this.#colors[this.#lastDrop.getRow()][this.#lastDrop.getColumn()] = color;
    }

    isComplete(column) {
        if (column !== undefined) {
            return !this.isEmpty(new Coordinate(Coordinate.NUMBER_ROWS - 1, column));
        }
        for (let i = 0; i < Coordinate.NUMBER_COLUMNS; i++) {
            if (!this.isComplete(i)) {
                return false;
            }
        }
        return true;
    }

    isFinished() {
        return this.isComplete() || this.isWinner();
    }

    isWinner() {
        if (this.#lastDrop === undefined) {
            return false;
        }
        for (let direction of [Direction.NORTH, Direction.NORTH_EAST, Direction.EAST, Direction.SOUTH_EAST]) {
            let coordinates = this.getCoordinates(direction);
            if (this.isConnect4(coordinates)) {
                return true;
            }
            for (let i = 0; i < 4 - 1; i++) {
                coordinates = this.getShifted(coordinates, direction.getOpposite());
                if (this.isConnect4(coordinates)) {
                    return true;
                }
            }
        }
        return false;
    }

    getCoordinates(direction) {
        let coordinates = [];
        coordinates[0] = this.#lastDrop;
        for (let i = 1; i < 4; i++) {
            coordinates[i] = coordinates[i - 1].shifted(direction.getCoordinate());
        }
        return coordinates;
    }

    isConnect4(coordinates) {
        if (!coordinates[0].isValid()) {
            return false;
        }
        for (let i = 1; i < coordinates.length; i++) {
            if (!coordinates[i].isValid()) {
                return false;
            }
            if (this.getColor(coordinates[i - 1]) != this.getColor(coordinates[i])) {
                return false;
            }
        }
        return true;
    }

    getShifted(coordinates, direction) {
        let shiftedCoordinates = [];
        for (let i = 0; i < coordinates.length; i++) {
            shiftedCoordinates[i] = coordinates[i].shifted(direction.getCoordinate());
        }
        return shiftedCoordinates;
    }

    isOccupied(coordinate, color) {
        return this.getColor(coordinate) == color;
    }

    isEmpty(coordinate) {
        return this.isOccupied(coordinate, Color.NULL);
    }

    getColor(coordinate) {
        return this.#colors[coordinate.getRow()][coordinate.getColumn()];
    }

}

class PlayerView {

    #column;

    play(player) {
        Message.TURN.write();
        let color = player.getColor();
        let colorView = new ColorView(color);
        colorView.write();
        player.accept(this);
        player.dropToken(this.column);
    }

    visitRadomPlayer(randomPlayer) {
        this.column = randomPlayer.getColumn();
    }

    visitHumanPlayer(humanPlayer) {
        let valid;
        do {
            this.column = console.readNumber(Message.ENTER_COLUMN_TO_DROP.toString()) - 1;
            valid = humanPlayer.isColumnValid(this.column);
            switch (humanPlayer.getValidColumnCode()) {
                case 1:
                    Message.INVALID_COLUMN.writeln();
                    break;

                case 2:
                    Message.COMPLETED_COLUMN.writeln();
                    break;
            }
        } while (!humanPlayer.isColumnValid(this.column));
    }

    writeResult() {
        let message = Message.PLAYER_WIN.toString();
        console.writeln(message);
    }

}

class Player {

    #color;
    #board;

    constructor(color, board) {
        this.#color = color;
        this.#board = board;
    }

    accept(visitor) { }

    isComplete(column) {
        return this.#board.isComplete(column);
    }

    dropToken(column) {
        this.#board.dropToken(column, this.#color);
    }

    getColor() {
        return this.#color;
    }

}

class HumanPlayer extends Player {

    #validCode;

    constructor(color, board) {
        super(color, board);
    }

    isColumnValid(column) {//hace dos cosas, retorna y cambia estado (atributo)
        let valid = Coordinate.isColumnValid(column);
        if (!valid) {
            this.#validCode = 1;
            return false;
        } else {
            valid = !this.isComplete(column);
            if (!valid) {
                this.#validCode = 2;
                return false;
            }
        }
        return true;
    }



    getValidColumnCode() {
        return this.#validCode;

    }

    accept(visitor) { //ojo ciclo, y modelo conoce a vista
        visitor.visitHumanPlayer(this);
    }

}

class RandomPlayer extends Player {

    constructor(color, board) {
        super(color, board);
    }

    getColumn() {
        return Math.floor(Math.random() * 7);
    }

    accept(visitor) { //ojo ciclo, y modelo conoce a vista
        visitor.visitRadomPlayer(this);
    }

}

class TurnView {

    #playerView;
    #turn;

    constructor(turn) {
        this.#playerView = new PlayerView();
        this.#turn = turn;
    }

    setPlayerConfig() {
        let playerConfigOption = console.readNumber("1 - human vs random \n2 - human vs human \n Insert game mode: ");
        this.#turn.reset(playerConfigOption);

    }

    play() {
        this.#playerView.play(this.#turn.getPlayer());
        this.#turn.next();
    }

    writeResult() {
        if (this.#turn.isWinner()) {
            let message = Message.PLAYER_WIN.toString();
            message = message.replace(`#color`, this.#turn.getColor().toString());
            console.writeln(message);
        } else {
            Message.PLAYERS_TIED.write();
        }
    }

}

class Turn {

    static #NUMBER_PLAYERS = 2;
    #players;
    #activePlayer;
    #board;

    constructor(board) {
        this.#board = board;
        this.#players = [];
    }

    reset(playerConfig) {
        if (playerConfig === 1) {
            this.#players[0] = new HumanPlayer(Color.get(0), this.#board);
            this.#players[1] = new RandomPlayer(Color.get(1), this.#board);
        }

        if (playerConfig === 2) {
            for (let i = 0; i < Turn.#NUMBER_PLAYERS; i++) {
                this.#players[i] = new HumanPlayer(Color.get(i), this.#board);
            }
        }
        this.#activePlayer = 0;
    }

    next() {
        if (!this.#board.isFinished()) {
            this.#activePlayer = (this.#activePlayer + 1) % Turn.#NUMBER_PLAYERS;
        }

    }

    getPlayer() {
        return this.#players[this.#activePlayer];
    }

    writeResult() {
        this.#players[this.#activePlayer].writeResult();
    }

    isWinner() {
        return this.#board.isWinner();
    }

    getColor() {
        return this.#players[this.#activePlayer].getColor();
    }

}

class YesNoDialog {

    static #AFFIRMATIVE = `y`;
    static #NEGATIVE = `n`;
    static #SUFFIX = `? (` +
        YesNoDialog.#AFFIRMATIVE + `/` +
        YesNoDialog.#NEGATIVE + `): `;
    static #MESSAGE = `The value must be ${YesNoDialog.#AFFIRMATIVE} or ${YesNoDialog.#NEGATIVE}`;
    #answer;

    read(message) {
        let ok;
        do {
            console.write(message);
            this.#answer = console.readString(YesNoDialog.#SUFFIX);
            ok = this.isAffirmative() || this.isNegative();
            if (!ok) {
                console.writeln(YesNoDialog.#MESSAGE);
            }
        } while (!ok);
    }

    isAffirmative() {
        return this.getAnswer() === YesNoDialog.#AFFIRMATIVE;
    }

    isNegative() {
        return this.getAnswer() === YesNoDialog.#NEGATIVE;
    }

    getAnswer() {
        return this.#answer.toLowerCase()[0];
    }
}

class Connect4 {

    #boardView;
    #turnView;
    #board;
    #turn;

    constructor() {
        this.#board = new Board();
        this.#turn = new Turn(this.#board);
        this.#boardView = new BoardView(this.#board);
        this.#turnView = new TurnView(this.#turn);
    }

    playGames() {
        do {
            this.playGame();
        } while (this.isResumed());
    }

    playGame() {
        this.#turnView.setPlayerConfig();
        this.#boardView.writeln();
        do {
            this.#turnView.play();
            this.#boardView.writeln();
        } while (!this.#board.isFinished());
        this.#turnView.writeResult();
    }

    isResumed() {
        let yesNoDialog = new YesNoDialog();
        yesNoDialog.read(Message.RESUME.toString());
        if (yesNoDialog.isAffirmative()) {
            this.#board.reset();
            this.#turn.reset();
        }
        return yesNoDialog.isAffirmative();
    }

}

new Connect4().playGames();