var boardSize = 4;

var board = new Array(boardSize);

for (i = 0; i < boardSize; i++) {
  board[i] = new Array(boardSize);
  for (j = 0; j < boardSize; j++) {
    board[i][j] = [];
  }
}

var pieceKinds = ["road", "wall", "cap stone"];
function isWall(pieceKind) {
    return pieceKind == "wall" || pieceKind == "cap stone";
}
function isRoad(pieceKind) {
    return pieceKind == "road" || pieceKind == "cap stone";
}

function play(player, pieceKind, i, j) {
    if (player != 0 || player != 1) {
        return {error: "The value " + player.toString() + " is not a valid player"};
    }
    if (! pieceKinds.includes(pieceKind)) {
        return {error: "The value " + pieceKind + " is not a valid piece"};
    }
    if(board[i][j].length == 0) {
        board[i][j].push({kind: pieceKind, player: player});
        return true;
    } else {
        return false;
    }
}
