// Avalia o valor de um movimento
const evaluateMove = (move, penambah = 0) => {
    let sum = 0;

    // Se o movimento captura uma peça
    if ('remove' in move) {
        // Adiciona valor dependendo do tipo de peça capturada (peão ou peça maior)
        if (move["removePiece"][1].toLowerCase() == "p")
            sum += 20 + penambah; // Peão capturado
        else
            sum += 60 + penambah; // Peça maior capturada
    }

    // Adiciona valor extra se o movimento promove uma peça
    if ('promote' in move)
        sum += 40;

    // Se há capturas adicionais, avalia recursivamente os movimentos subsequentes
    if ('nextEat' in move) {
        sum += evaluateMove(move.nextEat);
    }

    return sum; // Retorna o valor total do movimento
};

// Algoritmo Minimax com poda alfa-beta para decidir o melhor movimento
const minmax = (position, depth, alpha, beta, isMaximizingPlayer, sum, turn, color) => {
    jumlahNode++; // Contador para rastrear o número de nós avaliados

    // Obtém todos os movimentos possíveis do jogador atual
    let moves = getAllMoves(turn, position)
        .reduce((arr, m) => {
            spreadNextEat(m) // Espalha movimentos com capturas em cadeia
                .forEach(m2 => arr.push(m2));
            return arr;
        }, []);

    // Ordena movimentos aleatoriamente para variar as decisões em caso de empate
    moves.sort(function (a, b) {
        return Math.random() - Math.random();
    });

    // Caso base: se a profundidade for 0 ou não houver mais movimentos possíveis
    if (depth == 0 || moves.length == 0)
        return [null, sum];

    // Variáveis para armazenar os valores máximo e mínimo
    let maxValue = Number.NEGATIVE_INFINITY;
    let minValue = Number.POSITIVE_INFINITY;
    let bestMove;
    let move;

    // Itera por todos os movimentos possíveis
    for (let i = 0; i < moves.length; i++) {
        move = moves[i];
        let newSum;
        let newPos = position; // Nova posição do tabuleiro
        let newMove = { ...move }; // Copia o movimento atual
        let newTurn;

        // Realiza capturas em cadeia, se houver
        while ("nextEat" in newMove) {
            newPos = movePiece(newMove, newPos); // Move a peça
            newMove = newMove.nextEat; // Avança para o próximo movimento
        }

        // Move a peça para a posição final
        newPos = movePiece(newMove, newPos);

        // Atualiza o valor da soma com base no movimento e no jogador atual
        if (turn == color) {
            newSum = sum + evaluateMove(move, depth); // Movimento do jogador maximizador
        } else {
            newSum = sum - evaluateMove(move, depth); // Movimento do jogador minimizador
        }

        // Ajusta o valor com base em movimentos iniciais de peões
        if (move['piece'][1].toLowerCase() == "p") {
            if (move['from'][1] == 1 && turn == color && turn == "white")
                newSum -= 10; // Penalidade para peões brancos no início
            else
                newSum += 10;

            if (move['from'][1] == 8 && turn == color && turn == "black")
                newSum -= 10; // Penalidade para peões pretos no início
            else
                newSum += 10;
        }

        // Alterna o turno para o próximo jogador
        if (turn == "white") newTurn = "black";
        else newTurn = "white";

        // Avalia recursivamente os movimentos subsequentes
        const [childBestMove, childValue] = minmax(
            newPos, depth - 1, alpha, beta, !isMaximizingPlayer,
            newSum, newTurn, color
        );

        // Atualiza os valores máximos/mínimos e o melhor movimento com base no jogador atual
        if (isMaximizingPlayer) {
            if (childValue > maxValue) {
                maxValue = childValue;
                bestMove = move; // Atualiza o melhor movimento para o maximizador
            }

            if (childValue > alpha) alpha = childValue; // Atualiza alfa
        } else {
            if (childValue < minValue) {
                minValue = childValue;
                bestMove = move; // Atualiza o melhor movimento para o minimizador
            }
            if (childValue < beta) beta = childValue; // Atualiza beta
        }

        // Realiza poda alfa-beta, interrompendo a busca se possível
        if (alpha >= beta) {
            break;
        }
    }

    // Retorna o melhor movimento e seu valor avaliado
    if (isMaximizingPlayer) {
        return [bestMove, maxValue];
    } else {
        return [bestMove, minValue];
    }
};
