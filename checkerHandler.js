// Utilitários gerais
const getNextChar = (c, move = 1) => String.fromCharCode(c.charCodeAt(0) + move);
// Função para obter o próximo caractere na sequência ASCII. Útil para mover entre colunas no tabuleiro de xadrez (ex.: de 'a' para 'b').

const combineHurufAngka = (huruf, angka) => {
    return huruf.reduce((arr, h) => {
        angka.forEach(a => {
            arr.push(h + a); // Combina letras (colunas) e números (linhas) para formar coordenadas no tabuleiro.
        });
        return arr;
    }, []);
};
// Combina arrays de letras e números para formar coordenadas (ex.: ['a', 'b'], [1, 2] → ['a1', 'a2', 'b1', 'b2']).

// Funções para colorir casas no tabuleiro
const greySquare = square => $(`#${tagBoard} .square-${square}`).addClass('gray');
// Adiciona uma classe CSS 'gray' para colorir a casa especificada em cinza.

const highlightSquare = square => $(`#${tagBoard} .square-${square}`).addClass("highlight");
// Adiciona uma classe CSS 'highlight' para destacar a casa especificada.

const removeGreySquares = () => $(`#${tagBoard} .square-55d63`).removeClass('gray');
// Remove a classe 'gray' de todas as casas.

const removeHighlightSquare = () => $(`#${tagBoard} .highlight`).removeClass('highlight');
// Remove a classe 'highlight' de todas as casas.

// Funções de lógica para movimentação no tabuleiro

const canMove = (piece) => {
    if (!turn || twoComputer) return false;
    // Verifica se é a vez de um jogador humano. Retorna falso se for a vez da IA.

    if ((turn === 'white' && piece.search(/^w/) === -1) ||
        (turn === 'black' && piece.search(/^b/) === -1)) {
        return false;
    }
    // Verifica se a peça pertence ao jogador atual (peças brancas começam com 'w', pretas com 'b').

    return true; // Retorna verdadeiro se a peça pode ser movida.
};

const isEmptySquare = (square, board) => {
    if (!(square in board)) return true;
    return false;
};
// Verifica se uma casa no tabuleiro está vazia. Retorna verdadeiro se a casa não contém nenhuma peça.

const isValidMove = (from, to, moves) => {
    const move = moves.filter(m => m.from == from && m.to == to);
    return move.length > 0;
};
// Verifica se um movimento é válido com base nos movimentos possíveis (`moves`). Retorna verdadeiro se o movimento está na lista.

const eat = (removeSquare, currPos) => {
    delete currPos[removeSquare];
    return currPos;
};
// Remove a peça da posição especificada no tabuleiro (`removeSquare`) ao capturá-la.

// Função para calcular movimentos horizontais do rei (ou peças similares)
const getMovesKingLeftRight = (batas, i, j, k, pieces, currBoard, plus) => {
    let newS; // Armazena a nova casa calculada.
    let newSquare = []; // Lista de casas válidas para o movimento.
    let jRemove = undefined; // Armazena a peça que será capturada à esquerda.
    let kRemove = undefined; // Armazena a peça que será capturada à direita.

    while (batas(i) && (j >= 1 || k <= 8)) {
        // Loop para calcular movimentos horizontais enquanto estiver dentro dos limites do tabuleiro.

        if (j >= 1) {
            newS = i + j; // Calcula a nova posição à esquerda.
            if (isEmptySquare(newS, currBoard)) {
                const tmp = { to: newS }; // Adiciona a casa como destino válido.
                if (jRemove) {
                    tmp["remove"] = jRemove; // Registra a peça que será capturada.
                    tmp["removePiece"] = currBoard[jRemove];
                }
                newSquare.push(tmp);
            } else {
                if (currBoard[newS][0] == pieces[0]) j = 0; // Para o cálculo se encontrar uma peça aliada.
                if (!jRemove) jRemove = newS; // Registra a peça inimiga para possível captura.
                else j = 0;
            }
            j--; // Move para a próxima casa à esquerda.
        }

        if (k <= 8) {
            newS = i + k; // Calcula a nova posição à direita.
            if (isEmptySquare(newS, currBoard)) {
                const tmp = { to: newS }; // Adiciona a casa como destino válido.
                if (kRemove) {
                    tmp["remove"] = kRemove; // Registra a peça que será capturada.
                    tmp["removePiece"] = currBoard[kRemove];
                }
                newSquare.push(tmp);
            } else {
                if (currBoard[newS][0] == pieces[0]) k = 9; // Para o cálculo se encontrar uma peça aliada.
                if (!kRemove) kRemove = newS; // Registra a peça inimiga para possível captura.
                else k = 9;
            }
            k++; // Move para a próxima casa à direita.
        }

        i = getNextChar(i, plus); // Avança para a próxima linha no tabuleiro.
    }
    return newSquare; // Retorna a lista de movimentos válidos.
};


// Gerar movimentos do Rei
const getKingMoves = (square, pieces, currBoard) => {
    const [huruf, angka] = [...square]; // Divide a posição (ex.: "d4") em letra e número.
    let j = parseInt(angka) - 1; // Define o limite para movimentos à esquerda.
    let k = parseInt(angka) + 1; // Define o limite para movimentos à direita.
    let newSquare = []; // Lista de possíveis movimentos.

    // Calcula movimentos para a esquerda e direita (linha superior e inferior).
    getMovesKingLeftRight(i => i >= "a", getNextChar(huruf, -1), j, k, pieces, currBoard, -1)
        .forEach(m => newSquare.push(m));
    getMovesKingLeftRight(i => i <= "h", getNextChar(huruf, 1), j, k, pieces, currBoard, 1)
        .forEach(m => newSquare.push(m));

    // Formata os movimentos com informações adicionais, como cor e peça.
    return newSquare
        .reduce((arr, m) => {
            arr.push({
                ...m,
                color: pieces[0], // Cor da peça.
                piece: pieces,    // Tipo da peça (ex.: 'bP' para peão preto).
                from: square,     // Posição inicial.
            });
            return arr;
        }, []);
};

// Gerar movimentos do Peão
const getPawnMoves = (square, pieces, currBoard) => {
    const [huruf, angka] = [...square]; // Divide a posição em letra e número.
    const newAngka = []; // Lista de números para possíveis movimentos verticais.
    const newHuruf = []; // Lista de letras para possíveis movimentos diagonais.
    const warna = pieces[0]; // Cor da peça ('w' para branco, 'b' para preto).

    // Verifica movimentos verticais válidos.
    if (angka > 1 && (warna == "b" || (warna == "w" && backMove))) newAngka.push(angka - 1);
    if (angka < 8 && (warna == "w" || (warna == "b" && backMove))) newAngka.push(parseInt(angka) + 1);

    // Verifica movimentos diagonais válidos.
    if (huruf > 'a') newHuruf.push(getNextChar(huruf, -1));
    if (huruf < 'h') newHuruf.push(getNextChar(huruf, 1));

    // Combina movimentos horizontais e verticais e valida cada um.
    return combineHurufAngka(newHuruf, newAngka)
        .reduce((arr, s) => {
            const m = {
                color: pieces[0],
                piece: pieces,
                from: square,
                to: s
            };
            if (isEmptySquare(m.to, currBoard)) {
                if (!backMove) arr.push(m); // Adiciona o movimento se a casa está vazia.
            } else if (currBoard[m.to][0] != pieces[0]) {
                const eatMove = getMovesEat(square, m.to, pieces, currBoard); // Calcula capturas válidas.
                if (eatMove) arr.push(eatMove); // Adiciona movimentos de captura.
            }
            return arr;
        }, []);
};

// Gerar movimentos de captura para o Peão
const getMovesEat = (currSquare, nextSquare, pieces, currBoard) => {
    const [huruf, angka] = [...currSquare]; // Posição atual.
    const [h, a] = [...nextSquare]; // Posição do alvo.
    let newA; // Armazena a nova posição após captura.

    // Verifica direções válidas para captura com base na cor do peão.
    if (pieces[0] == "w") {
        if (a > angka && a < 8) newA = parseInt(a) + 1;
        else if (a < angka && backMove && a > 1) newA = parseInt(a) - 1;
    } else if (pieces[0] == "b") {
        if (a < angka && a > 1) newA = parseInt(a) - 1;
        else if (a > angka && backMove && a < 8) newA = parseInt(a) + 1;
    }

    // Calcula a nova posição após a captura.
    if (newA) {
        let newSquare;
        if (h > huruf && h < "h") newSquare = getNextChar(h, 1) + newA;
        else if (h < huruf && h > "a") newSquare = getNextChar(h, -1) + newA;

        // Verifica se a casa está vazia após a captura e retorna os detalhes do movimento.
        if (newSquare && isEmptySquare(newSquare, currBoard)) {
            return {
                color: pieces[0],
                piece: pieces,
                from: currSquare,
                to: newSquare,
                remove: nextSquare, // Posição da peça capturada.
                removePiece: currBoard[nextSquare] // Peça capturada.
            };
        }
    }
    return; // Retorna undefined se o movimento não for válido.
};


// Espalha movimentos de captura em sequência
const spreadNextEat = move => {
    // Verifica se o movimento possui movimentos adicionais de captura.
    if ("nextEat" in move) {
        const newMove = [];
        let nextEat = [];
        
        // Para cada movimento adicional, aplica recursivamente e armazena os resultados.
        move.nextEat.forEach(m => {
            spreadNextEat(m)
                .forEach(m2 => nextEat.push(m2));
        });

        // Remove o atributo "nextEat" do movimento original e cria novas combinações.
        delete move.nextEat;
        nextEat.forEach(m => {
            newMove.push({
                ...move,
                nextEat: m
            });
        });
        return newMove;
    }
    return [move]; // Retorna o movimento se não houver capturas adicionais.
};

// Obtém os movimentos possíveis de uma peça
const getMoves = (square, pieces = null, currBoard = null, recur = false) => {
    if (!currBoard) currBoard = positionNow; // Usa o estado atual do tabuleiro se nenhum for fornecido.

    // Obtém a peça na posição especificada, caso não tenha sido passada.
    if (!pieces) {
        pieces = currBoard[square];
        if (!pieces) return []; // Retorna vazio se não houver peça.
    }

    // Impede a interação com outras peças se há uma seleção ativa.
    if (!recur) {
        if (hasHighlight && squareHighlighted != square) return [];
    }

    let moves;

    // Determina o tipo de peça (peão ou rei) e obtém os movimentos correspondentes.
    if (pieces[1].toLowerCase() == "p") 
        moves = getPawnMoves(square, pieces, currBoard);
    else 
        moves = getKingMoves(square, pieces, currBoard);

    // Marca movimentos de promoção, se aplicável.
    moves.forEach(m => {
        if (isPromoted(m.to, pieces)) m['promote'] = pieces;
    });

    // Filtra para exibir apenas movimentos de captura, se houver destaque ativo.
    if (hasHighlight)
        return moves.filter(m => "remove" in m);

    return moves; // Retorna todos os movimentos disponíveis.
};

// Obtém movimentos com capturas em cadeia (movimentos recursivos)
const getMovesRecur = (square, pieces = null, currBoard = null) => {
    if (!currBoard) currBoard = positionNow; // Usa o estado atual do tabuleiro.

    if (!pieces) {
        pieces = currBoard[square]; // Obtém a peça, caso não tenha sido passada.
        if (!pieces) return [];
    }

    const moves = getMoves(square, pieces, currBoard, true); // Obtém movimentos básicos.

    moves.forEach(m => {
        if ("remove" in m) { // Se o movimento é uma captura:
            let newPos = movePiece(m, currBoard); // Atualiza a posição após a captura.
            let newPiece = m.piece;

            // Se houver promoção, substitui a peça capturada por uma dama.
            if ("promote" in m) {
                if (newPiece[0] == "w") newPiece = "wQ";
                else newPiece = "bQ";
            }

            // Verifica se há outra captura disponível a partir da nova posição.
            if (hasAnotherEat(m.to, newPiece, false, newPos)) {
                const nextEat = getMovesRecur(m.to, newPiece, newPos)
                    .filter(m2 => "remove" in m2);

                // Adiciona movimentos adicionais de captura.
                if (nextEat.length > 0) m["nextEat"] = nextEat;
            }
            squareHighlighted = undefined;
            backMove = false;
            hasHighlight = false;
        }
    });
    return moves; // Retorna todos os movimentos calculados.
};

// Verifica se há outra captura disponível para a peça
const hasAnotherEat = (square, pieces, highlightSquare2 = true, position = null) => {
    if (highlightSquare2) removeHighlightSquare(); // Remove destaques anteriores.

    backMove = true; // Permite movimentos reversos.
    squareHighlighted = square; // Destaca a posição atual.
    if (highlightSquare2) highlightSquare(square);
    hasHighlight = true; // Marca que há um destaque ativo.

    const moves = getMoves(square, pieces, position); // Obtém movimentos disponíveis.

    if (moves.length == 0) { // Se não houver movimentos, redefine o estado.
        squareHighlighted = undefined;
        backMove = false;
        hasHighlight = false;
        if (highlightSquare2) removeHighlightSquare();
        return false;
    }
    return true; // Retorna verdadeiro se houver capturas disponíveis.
};

// Verifica se a peça deve ser promovida
const isPromoted = (target, pieces) => {
    // Apenas peões podem ser promovidos.
    if (pieces[1].toLowerCase() != "p") return false;

    // Promoção ocorre na última linha do adversário.
    if (pieces[0] == "w" && target[1] == 8) return true;
    if (pieces[0] == "b" && target[1] == 1) return true;

    return false;
};

// Move uma peça no tabuleiro
const movePiece = (move, position) => {
    position = { ...position }; // Cria uma cópia do estado atual do tabuleiro.

    // Remove uma peça capturada, se aplicável.
    if ("remove" in move) delete position[move.remove];

    let piece = position[move.from]; // Obtém a peça a ser movida.
    delete position[move.from]; // Remove a peça da posição original.
    position[move.to] = piece; // Coloca a peça na nova posição.

    // Realiza a promoção, se aplicável.
    if ('promote' in move) {
        if (piece[0] == "w") piece = "wQ";
        else piece = "bQ";
        position[move.to] = piece;
    }

    return position; // Retorna o novo estado do tabuleiro.
};

// Obtém todos os movimentos possíveis para um jogador
const getAllMoves = (turn, position) => {
    let squarePieces = [];

    // Identifica todas as peças do jogador atual.
    for (let square in position) {
        if (position[square][0] == turn[0]) squarePieces.push(square);
    }

    let hasRemove = false; // Indica se há capturas disponíveis.

    // Calcula os movimentos de cada peça.
    let moves = squarePieces.reduce((arr, s) => {
        getMovesRecur(s, position[s], position).forEach(m => {
            arr.push(m);
            if ("remove" in m) hasRemove = true; // Marca capturas.
        });
        return arr;
    }, []);

    // Se há capturas disponíveis, retorna apenas elas.
    if (hasRemove) moves = moves.filter(m => "remove" in m);
    return moves; // Retorna todos os movimentos possíveis.
};
