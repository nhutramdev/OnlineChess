
const engine = new Worker(
  '/stockfish/stockfish-19-lite-single.js',
);

engine.onmessage = (event: MessageEvent) => {
  self.postMessage(event.data);
};

self.onmessage = (event: MessageEvent) => {
  engine.postMessage(event.data);
};

self.onmessageerror = () => {
  self.postMessage('info string Worker message error');
};

engine.onerror = () => {
  self.postMessage('info string Stockfish failed to load');
};
