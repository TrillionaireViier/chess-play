import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function App() {
  const [game, setGame] = useState(new Chess());
  const [balance, setBalance] = useState(100.0);
  const [bet, setBet] = useState(5.0);
  const [inGame, setInGame] = useState(false);
  const [statusText, setStatusText] = useState('Welcome! Ready to play for $?');

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) {
      handleGameOver();
      return;
    }
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const newGame = new Chess(game.fen());
    newGame.move(possibleMoves[randomIndex]);
    setGame(newGame);
    checkGameOver(newGame);
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (!inGame) return false;

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // always promote to a queen for example simplicity
      });

      if (move === null) return false; // illegal move

      setGame(newGame);
      
      if (!checkGameOver(newGame)) {
        setTimeout(makeRandomMove, 200);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function checkGameOver(currentGame: Chess) {
    if (currentGame.in_checkmate()) {
      if (currentGame.turn() === 'w') {
        setStatusText('You lost the bet. Bot wins by Checkmate!');
      } else {
        setStatusText('You win by Checkmate! Bet doubled.');
        setBalance(b => b + bet * 2);
      }
      setInGame(false);
      return true;
    } else if (currentGame.in_draw() || currentGame.in_stalemate() || currentGame.in_threefold_repetition()) {
      setStatusText('Draw. Bet returned.');
      setBalance(b => b + bet);
      setInGame(false);
      return true;
    }
    return false;
  }

  function handleGameOver() {
    setInGame(false);
  }

  function startGame() {
    if (balance < bet) {
      setStatusText('Insufficient balance!');
      return;
    }
    setBalance(b => b - bet);
    setGame(new Chess());
    setInGame(true);
    setStatusText(`Game started. Bet: $${bet}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-10 font-sans">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        Alvara Chess Arena
      </h1>
      <p className="text-gray-400 mb-8">Play against AI for real stakes.</p>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl px-4">
        {/* Left Panel - Matchmaking & Stats */}
        <div className="flex-1 bg-[#151515] p-6 rounded-2xl border border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <span className="text-gray-400 uppercase tracking-widest text-sm">Your Balance</span>
            <span className="text-2xl font-semibold text-emerald-400">${balance.toFixed(2)}</span>
          </div>

          {!inGame ? (
            <div className="flex flex-col gap-4 mt-auto">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Set Bet Amount</label>
                <div className="flex gap-2">
                  <button onClick={() => setBet(5)} className={`flex-1 py-2 rounded-lg border ${bet === 5 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>$5</button>
                  <button onClick={() => setBet(10)} className={`flex-1 py-2 rounded-lg border ${bet === 10 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>$10</button>
                  <button onClick={() => setBet(25)} className={`flex-1 py-2 rounded-lg border ${bet === 25 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>$25</button>
                  <button onClick={() => setBet(balance)} className="flex-1 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 uppercase text-xs font-bold">All In</button>
                </div>
              </div>
              
              <button 
                onClick={startGame}
                className="w-full mt-4 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-colors uppercase tracking-widest"
              >
                Find Match & Play
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-auto">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="text-sm text-emerald-400 mb-1">Match in progress</div>
                <div className="text-2xl font-bold">Prize Pool: ${(bet * 2).toFixed(2)}</div>
              </div>
              <button 
                onClick={() => { setInGame(false); setStatusText('You resigned. Lost bet.'); }}
                className="w-full py-3 bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10 font-bold rounded-xl transition-colors uppercase text-sm tracking-widest"
              >
                Resign
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Chess Board */}
        <div className="flex-[2] bg-[#151515] p-6 rounded-2xl border border-white/5 flex flex-col items-center">
          <div className="w-full max-w-[500px] mb-6 flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500"></div>
              <span>AI Engine (1500 Elo)</span>
            </div>
            <div className="bg-black/50 px-3 py-1 rounded text-gray-400">05:00</div>
          </div>

          <div className="w-full max-w-[500px] rounded-sm overflow-hidden shadow-2xl">
            <Chessboard 
              position={game.fen()} 
              onPieceDrop={onDrop}
              boardOrientation="white"
              customDarkSquareStyle={{ backgroundColor: 'var(--color-board-dark)' }}
              customLightSquareStyle={{ backgroundColor: 'var(--color-board-light)' }}
            />
          </div>

          <div className="w-full max-w-[500px] mt-6 flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400"></div>
              <span>You (Guest)</span>
            </div>
            <div className="bg-black/50 px-3 py-1 rounded text-gray-400">05:00</div>
          </div>
        </div>
      </div>
      
      {/* Game Status Banner */}
      <div className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
        {statusText}
      </div>
    </div>
  );
}

export default App;
