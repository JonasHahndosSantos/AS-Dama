// Pilihan Jenis Game
let pilihanGame, levelHitam, levelPutih, allMovesNow, waktuMulaiGame, lamanyaPermainan;
const pilihanGameForm = document.getElementById('pilihan-game');
const levelHitamForm = document.getElementById('level-hitam');
const levelPutihForm = document.getElementById('level-putih');
const tombolMulai = document.getElementById('tombol-mulai');
const tombolMenyerah = document.getElementById('tombol-menyerah');
const tombolhentikan = document.getElementById('tombol-hentikan');
const giliran = document.getElementById('giliran');
const pemenang = document.getElementById('pemenang');
const listHistory = document.getElementById('list-history');
const lamaBermain = document.querySelector('.lama-bermain');

// Variabel Untuk Game
let turn, backMove, hasHighlight, squareHighlighted, history, positionNow, twoComputer, jumlahNode, timeOut;
const tagBoard = "board";
const turnComputer = "black";
const initialPosition = '1p1p1p1p/p1p1p1p1/1p1p1p1p/8/8/P1P1P1P1/1P1P1P1P/P1P1P1P1';
// const initialPosition = "1Q5Q/8/7P/8/8/p7/8/q5q1";

// Função para verificar se o botão de início do jogo deve ser habilitado ou desabilitado.
const checkTombolMulai = () => {
    if (levelHitam && pilihanGame == "lawan") // Se o nível da IA para o jogador negro está definido e o jogo é "contra outra pessoa".
        tombolMulai.disabled = false; // Ativa o botão de início.
    else if (pilihanGame == "komputer" && levelHitam && levelPutih) // Se o jogo é contra o computador e os níveis da IA para ambos os lados estão definidos.
        tombolMulai.disabled = false; // Ativa o botão de início.
    else
        tombolMulai.disabled = true; // Caso contrário, desativa o botão de início.
};

// Variável que armazena o tipo de jogo selecionado: contra outra pessoa ("lawan") ou contra a IA ("komputer").
pilihanGameForm.addEventListener('change', () => { // Adiciona um listener de evento para mudanças na seleção do tipo de jogo.
    pilihanGame = pilihanGameForm.value; // Atualiza a variável com o valor selecionado no formulário.

    if (pilihanGame == 'lawan') { // Se o jogo for contra outra pessoa.
        levelHitamForm.classList.remove('d-none'); // Mostra a seleção de nível da IA para peças negras.
        levelPutihForm.classList.add('d-none'); // Esconde a seleção de nível da IA para peças brancas.
    } else if (pilihanGame == 'komputer') { // Se o jogo for contra o computador.
        levelHitamForm.classList.remove('d-none'); // Mostra a seleção de nível da IA para peças negras.
        levelPutihForm.classList.remove('d-none'); // Mostra a seleção de nível da IA para peças brancas.
    } else { // Se nenhum tipo de jogo for selecionado.
        levelHitamForm.classList.add('d-none'); // Esconde a seleção de nível da IA para peças negras.
        levelPutihForm.classList.add('d-none'); // Esconde a seleção de nível da IA para peças brancas.
        tombolMulai.disabled = true; // Desativa o botão de início.
    }
    checkTombolMulai(); // Chama a função para atualizar o estado do botão de início.
});

// Adiciona um listener para mudanças na seleção do nível da IA para peças negras.
levelHitamForm.addEventListener('change', () => {
    levelHitam = parseInt(levelHitamForm.value); // Atualiza o nível da IA baseado no valor selecionado.
    checkTombolMulai(); // Atualiza o estado do botão de início.
});

// Adiciona um listener para mudanças na seleção do nível da IA para peças brancas.
levelPutihForm.addEventListener('change', () => {
    levelPutih = parseInt(levelPutihForm.value); // Atualiza o nível da IA baseado no valor selecionado.
    checkTombolMulai(); // Atualiza o estado do botão de início.
});

// Função para baixar o histórico de movimentos do jogo como um arquivo JSON.
const downloadHistory = () => {
    var a = document.createElement("a"); // Cria um elemento de link (<a>).
    var file = new Blob([JSON.stringify(history)], { type: 'application/json' }); // Cria um arquivo JSON com os dados do histórico.
    a.href = URL.createObjectURL(file); // Define a URL para o arquivo criado.
    a.download = "history.json"; // Nome do arquivo que será baixado.
    a.click(); // Simula o clique no link para iniciar o download.
};

// Função para encerrar o jogo e exibir mensagens apropriadas.
const hentikanGame = (adaPemenang = false) => { 
    tombolMenyerah.classList.add('d-none'); // Esconde o botão de "desistir".
    tombolhentikan.classList.add('d-none'); // Esconde o botão de "parar jogo".
    turn = null; // Define o turno como nulo, indicando que o jogo terminou.
    tombolMulai.disabled = false; // Habilita novamente o botão de início.

    if (adaPemenang) { // Se houver um vencedor.
        Swal.fire('Permainan selesai'); // Mostra uma mensagem "Jogo concluído".
    } else { // Se o jogo foi interrompido sem vencedor.
        Swal.fire('Permainan dihentikan'); // Mostra uma mensagem "Jogo interrompido".
    }

    lamanyaPermainan = (new Date().getTime()) - waktuMulaiGame; // Calcula a duração do jogo em milissegundos.
    lamaBermain.textContent = `(Permainan berlangsung selama ${lamanyaPermainan / 1000} detik)`; // Exibe a duração do jogo em segundos.

    pilihanGameForm.disabled = false; // Habilita novamente o formulário de seleção do tipo de jogo.
    levelHitamForm.disabled = false; // Habilita novamente o formulário de seleção do nível para peças negras.
    levelPutihForm.disabled = false; // Habilita novamente o formulário de seleção do nível para peças brancas.

    clearTimeout(timeOut); // Cancela qualquer temporizador ativo no jogo.
};


// Adiciona um evento de clique ao botão de "Menyerah" (Desistir)
tombolMenyerah.addEventListener('click', () => {
    // Exibe um pop-up de alerta usando Swal (SweetAlert2)
    Swal.fire({
        title: 'Você tem certeza de desistir?', // Título da mensagem
        icon: 'warning', // Ícone do alerta (aviso)
        showCancelButton: true, // Exibe o botão de cancelamento
        confirmButtonColor: '#3085d6', // Cor do botão de confirmação
        cancelButtonColor: '#d33', // Cor do botão de cancelamento
        confirmButtonText: 'Sim :(', // Texto no botão de confirmação
        cancelButtonText: 'Não!' // Texto no botão de cancelamento
    }).then((result) => {
        // Verifica se o botão de confirmação foi clicado
        if (result.isConfirmed) {
            hentikanGame(); // Chama a função para interromper o jogo
            // Atualiza o elemento HTML para mostrar o vencedor
            pemenang.innerHTML = `Bidak Hitam (AI Depth ${levelHitam})`;
        }
    });
});

// Adiciona um evento de clique ao botão de "Hentikan" (Parar o jogo)
tombolhentikan.addEventListener('click', () => {
    // Exibe um pop-up de alerta usando Swal (SweetAlert2)
    Swal.fire({
        title: 'Tem certeza de que deseja parar o jogo?', // Título da mensagem
        icon: 'warning', // Ícone do alerta (aviso)
        showCancelButton: true, 
        confirmButtonColor: '#3085d6', 
        cancelButtonColor: '#d33', 
        confirmButtonText: 'Sim', 
        cancelButtonText: 'Não!' 
    }).then((result) => {
        // Verifica se o botão de confirmação foi clicado
        if (result.isConfirmed) {
            hentikanGame(); // Chama a função para interromper o jogo
        }
    });
});


// Function for Event Handler
const onDrop = (source, target, piece, newPos, oldPos, orientation) => {
    // Verifica se a posição mudou após o movimento
    if (Chessboard.objToFen(newPos) !== Chessboard.objToFen(oldPos)) {
        // Cria uma cópia de todos os movimentos disponíveis no momento
        const moves = [...allMovesNow];
        // Se o movimento não for válido, retorna a peça para a posição original
        if (!isValidMove(source, target, moves))
            return 'snapback';
        // Filtra para encontrar o movimento atual
        const move = moves.filter(m => m.to == target && m.from == source)[0];
        const newPosition = movePiece(move, oldPos);

        // Atualiza a posição atual no tabuleiro
        positionNow = newPosition;
        board.position(newPosition, false);
        // Adiciona o movimento ao histórico
        history.push(move);
        // Remove os quadrados cinza (dicas de movimentos)
        removeGreySquares();
        // Verifica se há uma captura (remover uma peça)
        if (move['remove']) {
            if (!hasAnotherEat(target, piece)) 
                changeTurn(); // Muda o turno se não houver mais capturas disponíveis
            else 
                allMovesNow = getAllMoves(turn, positionNow).filter(m => m.from == target);
        } else {
            changeTurn(); // Muda o turno para o próximo jogador
        }

        // Atualiza o histórico exibido na interface
        listHistory.innerHTML = `<li class="list-group-item">Bidak Putih : ${move.from} ke ${move.to}` +
            listHistory.innerHTML;

        return 'trash'; // Retorna "lixo" para remover a peça da posição antiga
    }
};
// Função para verificar se uma peça pode ser movida ao iniciar o arraste
const onDragStart = (source, piece, position, orientation) => canMove(piece);
// Função para exibir os quadrados onde a peça pode se mover ao passar o mouse sobre ela
const onMouseoverSquare = (square, piece) => {
    if (piece && canMove(piece)) {
        const moves = allMovesNow.filter(m => m.from == square);
        if (moves.length > 0) {
            greySquare(square);
            moves.forEach(m => greySquare(m.to));
        }
    }
};
// Função para remover os quadrados cinza quando o mouse sai do quadrado
const onMouseoutSquare = () => {
    removeGreySquares();
};
// Função que é chamada quando um movimento inválido é tentado
const onSnapbackEnd = () => {
    Swal.fire('Invalid Move'); // Exibe um alerta informando que o movimento é inválido
};


const changeTurn = () => {
    // Alterna o turno entre as cores (branco e preto)
    if (turn == "white") {
        turn = "black";
        giliran.textContent = "Peão Preto"; // Atualiza a interface para indicar o turno das peças pretas
    } else if (turn == "black") {
        turn = "white";
        giliran.textContent = "Peão Branco"; // Atualiza a interface para indicar o turno das peças brancas
    }

    // Atualiza todos os movimentos disponíveis para o jogador atual
    allMovesNow = getAllMoves(turn, positionNow);

    // Remove destaques de quadrados no tabuleiro
    removeHighlightSquare();

    // Destaca os quadrados onde peças podem capturar outras
    allMovesNow.forEach(m => {
        if ("remove" in m) // Verifica se o movimento inclui captura
            highlightSquare(m.from);
    });

    // Verifica se o jogador atual não possui movimentos disponíveis
    if (allMovesNow.length == 0) {
        if (turn == "white") {
            pemenang.textContent = `Peão Preto(AI Depth ${levelHitam})`; // Declara as peças pretas como vencedoras
        } else if (turn == "black") {
            if (twoComputer) {
                pemenang.textContent = `Peão Branco(AI Depth ${levelPutih})`; // Declara o vencedor para modo AI vs AI
            } else {
                pemenang.textContent = "Peão Branco"; // Declara as peças brancas como vencedoras
            }
        }
        hentikanGame(true); // Finaliza o jogo
    } else if (turn == turnComputer || twoComputer) {
        // Se for a vez do computador (ou em modo AI vs AI), chama a função para o computador jogar
        timeOut = window.setTimeout(playComputer, 500);
    }
};

const playComputer = () => {
    jumlahNode = 0; // Contador de nós avaliados pelo algoritmo
    let move, value, lamaMikir;
    let perpindahan = "";
    const position = positionNow;
    const alpha = Number.NEGATIVE_INFINITY; // Inicialização do valor alpha para o algoritmo Minimax
    const beta = Number.POSITIVE_INFINITY; // Inicialização do valor beta para o algoritmo Minimax

    // Marca o início do tempo de processamento
    lamaMikir = new Date().getTime();

    if (turn == "white") {
        // Calcula o melhor movimento para o jogador branco usando Minimax
        [move, value] = minmax(positionNow, levelPutih, alpha, beta, true, 0, turn, turn);
        perpindahan += '<li class="list-group-item">Bidak Putih : ';
    } else {
        // Calcula o melhor movimento para o jogador preto usando Minimax
        [move, value] = minmax(positionNow, levelHitam, alpha, beta, true, 0, turn, turn);
        perpindahan += '<li class="list-group-item list-group-item-dark">Bidak Hitam : ';
    }

    // Calcula o tempo gasto no processamento
    lamaMikir = (new Date().getTime()) - lamaMikir;

    let newPos = { ...position }; // Clona a posição atual do tabuleiro

    move['jumlahNode'] = jumlahNode; // Armazena o número de nós avaliados
    move['waktu'] = lamaMikir; // Armazena o tempo de processamento

    // Executa múltiplas capturas (se aplicável)
    while ("nextEat" in move) {
        let nextEat = move["nextEat"];
        perpindahan += `${move.from} ke ${move.to} || `;
        delete move.nextEat; // Remove a referência para o próximo movimento
        newPos = movePiece(move, newPos); // Atualiza a posição
        board.position(newPos);
        history.push(move);
        move = nextEat;
    }

    // Atualiza a posição final após o movimento
    perpindahan += `${move.from} ke ${move.to} `;
    newPos = movePiece(move, newPos);
    positionNow = newPos;
    board.position(newPos);
    history.push(move);

    // Adiciona informações sobre o processamento ao histórico
    perpindahan += `(${jumlahNode} Node Evaluasi ${lamaMikir / 1000} detik)</li>`;
    listHistory.innerHTML = perpindahan + listHistory.innerHTML;

    // Reduz o nível da AI se muitos nós forem avaliados
    if (jumlahNode > 600000) {
        levelHitam -= 2;
        levelPutih -= 2;
        Swal.fire('Level AI Diturunkan'); // Exibe uma mensagem informando a redução de nível
    }

    changeTurn(); // Alterna para o próximo turno
};


// Configuração do jogo
const config = {
    position: initialPosition, // Define a posição inicial do tabuleiro de xadrez.
    draggable: true, // Habilita o arraste das peças no tabuleiro.
    onDragStart: onDragStart, // Chama a função quando o jogador começa a arrastar uma peça.
    onDrop: onDrop, // Chama a função ao soltar uma peça em uma casa.
    onMouseoverSquare: onMouseoverSquare, // Chama a função quando o mouse passa sobre uma casa.
    onMouseoutSquare: onMouseoutSquare, // Chama a função ao mover o mouse para fora de uma casa.
    onSnapbackEnd: onSnapbackEnd // Chama a função caso a peça volte para sua posição original após um movimento inválido.
};

// Cria o tabuleiro de xadrez com as configurações definidas
const board = Chessboard(tagBoard, config);

// Obtém a posição atual do tabuleiro
positionNow = board.position();

// Evento para iniciar o jogo ao clicar no botão "Iniciar"
tombolMulai.addEventListener('click', () => {
    giliran.textContent = "Bidak Putih"; // Atualiza o texto para indicar que é a vez das peças brancas.
    tombolMulai.disabled = true; // Desabilita o botão de iniciar para evitar múltiplos cliques.

    // Configurações para o modo de jogo selecionado
    if (pilihanGame == "lawan") {
        tombolMenyerah.classList.remove('d-none'); // Exibe o botão de "Desistir".
        twoComputer = false; // Indica que o jogo será entre duas pessoas.
    } else if (pilihanGame == "komputer") {
        twoComputer = true; // Indica que o jogo será contra a IA.
        tombolhentikan.classList.remove('d-none'); // Exibe o botão de "Parar o Jogo".
    }

    // Limpa o histórico do jogo e define o vencedor como vazio
    listHistory.innerHTML = "";
    pemenang.innerHTML = "-";

    // Configuração inicial do jogo
    turn = "white"; // Define que o turno inicial é das peças brancas.
    history = []; // Reseta o histórico de movimentos.
    backMove = false; // Reseta a variável que controla retrocessos.
    hasHighlight = false; // Remove qualquer destaque no tabuleiro.
    squareHighlighted = null; // Reseta a casa destacada.
    board.position(initialPosition); // Restaura a posição inicial do tabuleiro.
    positionNow = board.position(); // Atualiza a posição atual do tabuleiro.
    allMovesNow = getAllMoves(turn, positionNow); // Obtém todos os movimentos possíveis para o turno atual.

    // Desabilita os formulários para evitar alterações durante o jogo
    pilihanGameForm.disabled = true;
    levelHitamForm.disabled = true;
    levelPutihForm.disabled = true;

    // Limpa o tempo de jogo e define o início do jogo
    lamaBermain.textContent = ""; // Reseta a exibição do tempo de jogo.
    waktuMulaiGame = new Date().getTime(); // Registra o momento de início do jogo.

    // Inicia a jogada da IA, caso seja um jogo de computador contra computador
    if (twoComputer) {
        timeOut = window.setTimeout(playComputer, 500); // Aguarda 500ms antes de iniciar a jogada da IA.
    }
});
