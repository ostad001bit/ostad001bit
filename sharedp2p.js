const WebSocket = require("ws");
const { blockchain, getLatestBlock, mempool } = require("./blockchain");
const { Transaction } = require("./transaction");

let peers = [];

function startP2PServer(port) {
  const server = new WebSocket.Server({ port });
  server.on("connection", (ws) => initConnection(ws));
  console.log(`🔌 P2P server running on ws://localhost:${port}`);
}

function initConnection(ws) {
  peers.push(ws);
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    handleMessage(data);
  });
  ws.on("close", () => (peers = peers.filter((p) => p !== ws)));
}

function handleMessage(data) {
  if (data.type === "NEW_BLOCK") {
    const latest = getLatestBlock();
    if (data.data.prevHash === latest.hash) {
      blockchain.push(data.data);
      console.log(`📦 Block added via P2P`);
    }
  } else if (data.type === "NEW_TX") {
    const tx = Object.assign(new Transaction(), data.data);
    if (tx.isValid()) {
      mempool.push(tx);
      console.log("📨 TX received via P2P");
    }
  }
}

function broadcast(message) {
  const data = JSON.stringify(message);
  peers.forEach((peer) => peer.send(data));
}

function connectToPeer(address) {
  const ws = new WebSocket(address);
  ws.on("open", () => {
    peers.push(ws);
    console.log(`🔗 Connected to peer: ${address}`);
  });
  ws.on("error", () => console.error(`❌ Could not connect to ${address}`));
}

module.exports = {
  startP2PServer,
  broadcast,
  connectToPeer,
};
