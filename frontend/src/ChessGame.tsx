
import { useEffect, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './ChessGame.css';

type EngineMessage = {
  type: 'bestmove' | 'info' | 'error';
  move?: string;
  score?: string;
  depth?: number;
  text?: string;
};

function ChessGame({ onBack }: { onBack: () => void }) {
  const [game, setGame] = useState(() => new Chess());
  const [moves, setMoves] = useState<string[]>([]);
  const [message, setMessage] = useState('Đến lượt bạn, quân Trắng.');
  const [hint, setHint] = useState('');
  const [engineReady, setEngineReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [difficulty, setDifficulty] = useState('10');
  const [autoPlay, setAutoPlay] = useState(true);

  const engineRef = useRef<Worker | null>(null);
  const gameRef = useRef(game);
  const requestRef = useRef<'ai' | 'hint' | null>(null);
  const gameOver = game.isGameOver();

  useEffect(() => {
    const worker = new Worker('/stockfish/stockfish-19-lite-single.js');
    engineRef.current = worker;

    worker.onmessage = (event: MessageEvent<string>) => {
      const line = String(event.data).trim();

      if (line === 'uciok') {
        worker.postMessage('isready');
        return;
      }

      if (line === 'readyok') {
        setEngineReady(true);
        return;
      }

      if (line.startsWith('info ')) {
        const depth = line.match(/\bdepth\s+(\d+)/);
        const score = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);

        if (requestRef.current === 'hint' && (depth || score)) {
          const details = [
            depth ? `Độ sâu: ${depth[1]}` : '',
            score
              ? score[1] === 'mate'
                ? `Đánh giá: chiếu hết trong ${score[2]} nước`
                : `Đánh giá: ${(Number(score[2]) / 100).toFixed(2)}`
              : '',
          ].filter(Boolean).join(' · ');

          if (details) {
            setHint(`Stockfish đang phân tích... ${details}`);
          }
        }
        return;
      }

      if (line.startsWith('bestmove ')) {
        const bestMove = line.split(/\s+/)[1];
        const request = requestRef.current;
        requestRef.current = null;
        setThinking(false);

        if (!bestMove || bestMove === '(none)') {
          setHint('Không tìm thấy nước đi hợp lệ.');
          return;
        }

        if (request === 'hint') {
          setHint(`Stockfish đề xuất: ${bestMove.slice(0, 2)} → ${bestMove.slice(2, 4)}.`);
          return;
        }

        if (request === 'ai') {
          const current = gameRef.current;

          if (current.isGameOver() || current.turn() !== 'b') {
            return;
          }

          const nextGame = new Chess(current.fen());

          try {
            nextGame.move({
              from: bestMove.slice(0, 2) as Square,
              to: bestMove.slice(2, 4) as Square,
              promotion: bestMove[4] || 'q',
            });
            updateGame(nextGame);
          } catch {
            setMessage('Không thể thực hiện nước đi từ engine. Hãy thử ván mới.');
          }
        }
        return;
      }

      if (line.startsWith('info string')) {
        setMessage(line);
      }
    };

    worker.onerror = () => {
      setMessage('Không thể tải Stockfish. Hãy kiểm tra tệp JS và WASM.');
      setThinking(false);
    };

    worker.postMessage('uci');

    return () => {
      worker.terminate();
      engineRef.current = null;
    };
  }, []);

  function updateGame(nextGame: Chess) {
    gameRef.current = nextGame;
    setGame(nextGame);
    setMoves(nextGame.history());
    setHint('');

    if (nextGame.isCheckmate()) {
      setMessage(
        nextGame.turn() === 'w'
          ? 'Chiếu hết! Quân Đen chiến thắng.'
          : 'Chiếu hết! Quân Trắng chiến thắng.',
      );
    } else if (nextGame.isDraw()) {
      setMessage('Ván cờ hòa.');
    } else if (nextGame.isCheck()) {
      setMessage(
        nextGame.turn() === 'w'
          ? 'Quân Trắng đang bị chiếu!'
          : 'Quân Đen đang bị chiếu!',
      );
    } else {
      setMessage(
        nextGame.turn() === 'w'
          ? 'Đến lượt bạn, quân Trắng.'
          : 'Stockfish đã đi. Đến lượt bạn.',
      );
    }

    if (nextGame.turn() === 'b' && !nextGame.isGameOver() && autoPlay) {
        requestAiMove(nextGame);
    }
  }

  function requestAiMove(position: Chess) {
    const worker = engineRef.current;

    if (!worker || !engineReady || position.isGameOver()) {
      return;
    }

    requestRef.current = 'ai';
    setThinking(true);
    setHint('');
    worker.postMessage('stop');
    worker.postMessage('position fen ' + position.fen());
    worker.postMessage(`go depth ${difficulty}`);
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (
      !targetSquare ||
      game.isGameOver() ||
      game.turn() !== 'w' ||
      thinking
    ) {
      return false;
    }

    const nextGame = new Chess(game.fen());

    try {
      nextGame.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: 'q',
      });
    } catch {
      return false;
    }

    updateGame(nextGame);
    return true;
  }

  function resetGame() {
    engineRef.current?.postMessage('stop');
    requestRef.current = null;
    setThinking(false);

    const nextGame = new Chess();
    gameRef.current = nextGame;
    setGame(nextGame);
    setMoves([]);
    setHint('');
    setMessage('Đến lượt bạn, quân Trắng.');
  }

  function undoMove() {
    if (moves.length === 0) {
      return;
    }

    engineRef.current?.postMessage('stop');
    requestRef.current = null;
    setThinking(false);

    const nextGame = new Chess(game.fen());
    nextGame.undo();

    if (nextGame.turn() === 'b' && nextGame.history().length > 0) {
      nextGame.undo();
    }

    gameRef.current = nextGame;
    setGame(nextGame);
    setMoves(nextGame.history());
    setHint('');
    setMessage(
      nextGame.turn() === 'w'
        ? 'Đến lượt bạn, quân Trắng.'
        : 'Đến lượt quân Đen.',
    );
  }

  function suggestMove() {
    const worker = engineRef.current;

    if (!worker || !engineReady || game.isGameOver() || thinking) {
      setHint('Stockfish đang khởi động hoặc đang suy nghĩ. Hãy thử lại sau.');
      return;
    }

    requestRef.current = 'hint';
    setThinking(true);
    setHint('Stockfish đang phân tích thế cờ...');
    worker.postMessage('stop');
    worker.postMessage('position fen ' + game.fen());
    worker.postMessage(`go depth ${difficulty}`);
  }

  const chessboardOptions = {
    id: 'onlinechess-board',
    position: game.fen(),
    boardOrientation: 'white' as const,
    allowDragging: !gameOver && game.turn() === 'w' && !thinking,
    showNotation: true,
    animationDurationInMs: 180,
    onPieceDrop,
    boardStyle: {
      borderRadius: '8px',
      boxShadow: '0 12px 45px rgba(0, 0, 0, 0.28)',
    },
  };

  return (
    <main className="chess-page">
      <header className="chess-topbar">
        <button className="back-button" onClick={onBack}>← Trang chủ</button>
        <div className="chess-brand">♞ Online<span>Chess</span></div>
        <span className="chess-mode-label">
          {engineReady ? '● STOCKFISH SẴN SÀNG' : '○ ĐANG TẢI ENGINE'}
        </span>
      </header>

      <section className="chess-layout">
        <div className="board-column">
          <div className="player-card">
            <div className="player-avatar">♚</div>
            <div><strong>Stockfish AI</strong><span>Quân Đen</span></div>
            <span className="player-badge">AI</span>
          </div>

          <div className="board-frame">
            <Chessboard options={chessboardOptions} />
          </div>

          <div className="player-card">
            <div className="player-avatar user-avatar">♔</div>
            <div><strong>Bạn</strong><span>Quân Trắng</span></div>
            <span className="player-badge white-badge">BẠN</span>
          </div>
        </div>

        <aside className="game-sidebar">
          <div className="sidebar-heading">
            <span className="section-label">YOUR MATCH</span>
            <h1>Ván cờ của bạn</h1>
            <p>Đấu trí với engine cờ vua Stockfish.</p>
          </div>

          <div className="turn-status">
            <span className={`turn-dot ${gameOver ? 'finished' : ''}`} />
            <div>
              <strong>Trạng thái ván đấu</strong>
              <p>{message}</p>
            </div>
          </div>

          <div className="history-panel">
            <div className="panel-title">
              <strong>📜 Lịch sử nước đi</strong>
              <span>{moves.length} nước</span>
            </div>
            {moves.length === 0 ? (
              <div className="empty-history">Hãy đi nước đầu tiên bằng quân Trắng!</div>
            ) : (
              <div className="move-list">
                {Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => (
                  <div className="move-row" key={index}>
                    <span>{index + 1}.</span>
                    <span>{moves[index * 2]}</span>
                    <span>{moves[index * 2 + 1] ?? '...'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="difficulty-label">
            Độ sâu tìm kiếm
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              disabled={thinking}
            >
              <option value="5">Dễ · 5</option>
              <option value="10">Trung bình · 10</option>
              <option value="15">Khó · 15</option>
            </select>
          </label>

          <label className="auto-play-toggle">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(event) => setAutoPlay(event.target.checked)}
            />
            Tự động trả lời bằng AI
          </label>

          <div className="game-actions">
            <button className="game-button secondary" onClick={undoMove} disabled={moves.length === 0 || thinking}>
              ↶ Đi lại
            </button>
            <button className="game-button primary" onClick={resetGame}>
              ↻ Ván mới
            </button>
          </div>

          <button className="game-button hint-button" onClick={suggestMove} disabled={!engineReady || gameOver || thinking}>
            ✦ Gợi ý nước đi
          </button>

          <div className="hint-box hint-output" aria-live="polite">
            {thinking
                ? 'Stockfish đang tính toán...'
                : hint || '\u00a0'}
          </div>

          <div className="ai-notice">
            <span>🤖</span>
            <div>
              <strong>Stockfish 19 Lite</strong>
              <p>Engine tìm nước đi và phân tích vị trí hiện tại ngay trong trình duyệt.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default ChessGame;
