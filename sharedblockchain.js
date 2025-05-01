const crypto = require("crypto");
const { broadcast } = require("./p2p");

class Block {
  constructor(index, prevHash, timestamp, data, hash, nonce, merkleRoot) {
    Object.assign(this, { index, prevHash, timestamp, data, hash, nonce, merkleRoot });
  }
}

const sha256 = (data) => crypto.createHash("sha256").update(data).digest("hex");

const calculateHash = (i, p, t, r, n) => sha256(i + p + t + r + n);

const merkleRoot = (txs) => {
  if (!txs.length) return "";
  let layer = txs.map((tx) => sha256(JSON.stringify(tx)));
  while (layer.length > 1) {
    if (layer.length % 2 !== 0) layer.push(layer[layer.length - 1]);
    const nextLayer = [];
    for (let i = 0; i < layer.length; i += 2) {
      nextLayer.push(sha256(layer[i] + layer[i + 1]));
    }
    layer = nextLayer;
  }
  return layer[0];
};

const genesisBlock = () => {
  const t = Date.now();
  const h = calculateHash(0, "0", t, "", 0);
  return new Block(0, "0", t, [], h, 0, "");
};

const blockchain = [genesisBlock()];
let mempool = [];
const difficulty = 4;

const getLatestBlock = () => blockchain[blockchain.length - 1];

const mineBlock = () => {
  const prev = getLatestBlock();
  const index = prev.index + 1;
  const timestamp = Date.now();
  const data = [...mempool];
  const root = merkleRoot(data);
  let nonce = 0, hash = "";

  do {
    hash = calculateHash(index, prev.hash, timestamp, root, nonce);
    nonce++;
  } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

  mempool = [];
  return new Block(index, prev.hash, timestamp, data, hash, nonce, root);
};

const addBlock = () => {
  const block = mineBlock();
  blockchain.push(block);
  broadcast({ type: "NEW_BLOCK", data: block });
  return block;
};

module.exports = {
  Block,
  blockchain,
  mempool,
  difficulty,
  getLatestBlock,
  addBlock,
  mineBlock,
  sha256,
  merkleRoot
};
