(function () {

    "use strict";

    var pieceKinds = ["road", "wall", "cap stone"];

    function isWall(pieceKind) {
        return pieceKind == "wall" || pieceKind == "cap stone";
    }
    function isRoad(pieceKind) {
        return pieceKind == "road" || pieceKind == "cap stone";
    }

    var State = {};

    State.initialize = function () {
        var boardSize = 4;

        var board = new Array(boardSize);
        for (var i = 0; i < boardSize; i++) {
            board[i] = new Array(boardSize);
            for (var j = 0; j < boardSize; j++) {
                board[i][j] = [];
            }
        }

        var gameOn = true;

        /** Players are either 0 or 1.  Game starts with 0. */

        var currentPlayer = 0;

        var turn = 0;

        function inBounds(x, y) {
            return 0 <= x && x < boardSize && 0 <= y && y < boardSize;
        }

        function checkVictoryForAt(player, x, y, goal) {
            console.log("Checking for player", player, ", starting at", x, y);

            var visited = new Set();

            function isVisited(x, y) {
                return visited.has(x + boardSize * y);
            }

            function visit(x, y) {
                visited.add(x + boardSize * y);
            }

            function loop(x, y) {
                console.log("Visiting new node", x, y);
                var curStack = board[x][y];
                if (curStack.length == 0) {
                    console.log("Position is empty");
                    return false;
                }
                var topPiece = curStack[curStack.length - 1];
                if (!isRoad(topPiece.kind) || topPiece.player != player) {
                    console.log("Cannot walk here");
                    return false;
                }
                if (goal(x, y)) {
                    console.log("Found it!");
                    return true;
                }

                visit(x, y);

                var adjs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

                for (var v = 0; v < adjs.length; v++) {
                    var next_x = x + adjs[v][0];
                    var next_y = y + adjs[v][1];

                    if (!inBounds(next_x, next_y) || isVisited(next_x, next_y)) {
                        continue;
                    } else if (loop(next_x, next_y, goal)) return true;
                    console.log("Position", next_x, next_y, "didn't work; back to", x, y);
                }

                console.log("Giving up on", x, y);

                return false;

            }

            return loop(x, y);
        }

        function checkVictoryFor(player) {
            for (var i = 0; i < boardSize; i++) {
                function reachedRight (x, y) { return x == boardSize - 1; }
                if (checkVictoryForAt(player, 0, i, reachedRight)) return true;
                function reachedBottom (x, y) { return y == boardSize - 1; }
                if (checkVictoryForAt(player, i, 0, reachedBottom)) return true;
            }
        }

        function checkVictory() {
            if (checkVictoryFor(currentPlayer)) return currentPlayer;
            if (checkVictoryFor(1 - currentPlayer)) return 1 - currentPlayer;
            return -1;
        }

        function doPlacePiece(pieceKind, i, j) {
            if (!pieceKinds.includes(pieceKind)) {
                return {
                    error: "The value " + pieceKind
                        + " is not a valid piece"
                };
            }
            if (!inBounds(i, j)) {
                return {
                    error: "The position (" + i + ", "
                        + j + ") is not valid"
                };
            }
            if(board[i][j].length == 0) {
                var player = turn == 0 ? 1 - currentPlayer : currentPlayer;
                board[i][j].push({kind: pieceKind, player: player});
                return "success";
            } else {
                return {
                    error: "There is already a piece at this position"
                };
            }
        }

        var gameOn = true;

        function buildMove(callback) {

            return function () {

                if (!gameOn) {
                    console.log("The game ended. Why are you still here?");
                    return;
                }

                var result = callback.apply(null, arguments);

                if (result == "success") {
                    var victory = checkVictory();
                    if (victory == -1) {
                        if (currentPlayer == 1) turn++;
                        currentPlayer = 1 - currentPlayer;
                    } else {
                        gameOn = false;
                        console.log("Player ", victory, "has won!!!!!!!!1111");
                    }
                } else {
                    console.log(result.error);
                }
            }

        }

        var placePiece = buildMove(doPlacePiece);

        function pieceToString(piece) {
            return '<td class="cell player-' + piece.player + '">'
                + piece.kind[0] + "</td>";
        }

        function updateUI() {
            var boardDiv = $("#board");
            boardDiv.empty();
            for (var i = 0; i < boardSize; i++) {
                var row = $("<tr></tr>");
                for (var j = 0; j < boardSize; j++) {
                    var curStack = board[i][j];
                    if (curStack.length == 0) {
                        row.append('<td class="cell empty"></td>');
                        continue;
                    }
                    var topPiece = curStack[curStack.length - 1];
                    row.append(pieceToString(topPiece));
                }
                $("#board").append(row);
            }
            $("#current-player").text(currentPlayer);
        }

        return {
            updateUI: updateUI,
            placePiece: placePiece,
            checkVictory: checkVictory
        };

    }

    var game = null;

    function test1(game) {
        var moves = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [1, 2],
            [0, 2]
        ];
        moves.forEach(function (move) {
            game.placePiece("road", move[0], move[1]);
        });
    }

    function test2(game) {
        var moves = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [1, 2],
            [0, 2],
            [1, 3]
        ];
        moves.forEach(function (move) {
            game.placePiece("road", move[0], move[1]);
        });
    }

    function test3(game) {
        var moves = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [1, 2],
            [0, 2],
            [2, 2],
            [0, 3],
            [2, 3]
        ];
        moves.forEach(function (move) {
            game.placePiece("road", move[0], move[1]);
        });
    }

    window.OpenTak = {
        start: function () {
            game = State.initialize();
            game.updateUI();
            var pieceKindInput = $("select[name=piece-kind]");
            var rowInput = $("input[name=row]");
            var colInput = $("input[name=column]");
            var playButton = $("#play");
            playButton.on("click", function () {
                var pieceKind = pieceKindInput.val();
                var row = parseInt(rowInput.val());
                var col = parseInt(colInput.val());
                console.log(game.placePiece(pieceKind, row, col));
                game.updateUI();
            });
            test3(game);
            game.updateUI();
        },

        getGame: function () { return game; }
    }

})();
