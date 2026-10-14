
import { useState } from 'react';
import ChessGame from './ChessGame';
import './App.css';

const modes = [
  {
    icon: '🌐',
    title: 'Chơi trực tuyến',
    description: 'Thách thức người chơi trên toàn thế giới.',
    tag: 'ONLINE',
    id: 'online',
  },
  {
    icon: '🤖',
    title: 'Chơi với AI',
    description: 'Luyện tập chiến thuật với đối thủ thông minh.',
    tag: 'AI ENGINE',
    id: 'ai',
  },
  {
    icon: '♟',
    title: 'Lịch sử ván đấu',
    description: 'Xem lại những ván cờ và cải thiện kỹ năng.',
    tag: 'HISTORY',
    id: 'history',
  },
];

function App() {
  const [activeMode, setActiveMode] = useState('ai');
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return <ChessGame onBack={() => setShowGame(false)} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="logo" href="#home">
          <span className="logo-symbol">♞</span>
          <span>Online<span className="blue">Chess</span></span>
        </a>

        <nav>
          <a className="nav-active" href="#home">Trang chủ</a>
          <a href="#modes">Chơi cờ</a>
          <a href="#features">Tính năng</a>
        </nav>

        <button className="avatar" aria-label="Hồ sơ người chơi">T</button>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-text">
            <div className="eyebrow">
              <span className="online-dot" />
              CHƠI CỜ · KẾT NỐI · PHÁT TRIỂN
            </div>

            <h1>
              Thử thách
              <br />
              trí tuệ với
              <br />
              <span className="blue">OnlineChess.</span>
            </h1>

            <p>
              Nền tảng cờ vua hiện đại, nơi bạn có thể đấu với AI,
              khám phá chiến thuật và từng bước nâng cao trình độ.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-button"
                onClick={() => setShowGame(true)}
              >
                ♟ Chơi ngay <span>↗</span>
              </button>
              <a className="outline-button" href="#features">Khám phá</a>
            </div>

            <div className="stats">
              <div><strong>64</strong><span>Ô cờ chiến thuật</span></div>
              <div><strong>24/7</strong><span>Sẵn sàng luyện tập</span></div>
              <div><strong>AI</strong><span>Đối thủ thông minh</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glow" />
            <div className="orbital orbital-one" />
            <div className="orbital orbital-two" />
            <div className="hero-king">♚</div>
            <span className="floating-knight">♞</span>
            <span className="floating-pawn">♟</span>
            <div className="visual-label">
              <span className="online-dot" />
              THINK AHEAD
            </div>
          </div>
        </section>

        <section className="mode-section" id="modes">
          <div className="section-heading">
            <div>
              <span className="section-label">YOUR NEXT MOVE</span>
              <h2>Sẵn sàng vào cuộc?</h2>
            </div>
            <span className="status-pill">● HỆ THỐNG SẴN SÀNG</span>
          </div>

          <div className="mode-grid">
            {modes.map((mode) => (
              <button
                key={mode.id}
                className={`mode-card ${activeMode === mode.id ? 'mode-active' : ''}`}
                onClick={() => setActiveMode(mode.id)}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-content">
                  <span className="mode-tag">{mode.tag}</span>
                  <strong>{mode.title}</strong>
                  <span className="mode-description">{mode.description}</span>
                </span>
                <span className="mode-arrow">↗</span>
              </button>
            ))}
          </div>

          <div className="selected-mode">
            <span className="selected-icon">✦</span>
            <div>
              <strong>
                {activeMode === 'ai'
                  ? 'Sẵn sàng luyện tập cùng AI'
                  : activeMode === 'online'
                    ? 'Chế độ đấu trực tuyến'
                    : 'Lịch sử ván đấu'}
              </strong>
              <p>
                {activeMode === 'ai'
                  ? 'Bắt đầu một ván cờ và luyện tập với bàn cờ tương tác.'
                  : activeMode === 'online'
                    ? 'Chế độ này sẽ được kết nối với hệ thống đấu trực tuyến.'
                    : 'Lịch sử sẽ hiển thị khi ứng dụng có chức năng lưu ván đấu.'}
              </p>
              {activeMode === 'ai' && (
                <button
                  className="primary-button mode-start-button"
                  onClick={() => setShowGame(true)}
                >
                  Mở bàn cờ <span>↗</span>
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <span className="section-label">DESIGNED FOR CHESS LOVERS</span>
          <h2>Mỗi nước đi đều có ý nghĩa.</h2>
          <div className="feature-grid">
            <article>
              <span>♟</span>
              <h3>Đấu trí</h3>
              <p>Phát triển tư duy chiến thuật qua từng ván cờ.</p>
            </article>
            <article>
              <span>⌘</span>
              <h3>Đấu với AI</h3>
              <p>Chuẩn bị các cấp độ khó từ người mới đến nâng cao.</p>
            </article>
            <article>
              <span>✧</span>
              <h3>Gợi ý nước đi</h3>
              <p>Hỗ trợ phân tích thế cờ bằng engine cờ vua.</p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <a className="logo" href="#home">
          <span className="logo-symbol">♞</span>
          <span>Online<span className="blue">Chess</span></span>
        </a>
        <span>Chơi thông minh. Nghĩ xa hơn.</span>
        <span>© 2026 OnlineChess</span>
      </footer>
    </div>
  );
}

export default App;
