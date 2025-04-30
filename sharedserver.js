const express = require("express");
const bodyParser = require("body-parser");
const { blockchain, mempool, addBlock } = require("./blockchain");
const { Transaction } = require("./transaction");
const { smartContracts, deployContract, runContract } = require("./contract");
const { submitTransaction } = require("./utils");

function startApiServer(port) {
  const app = express();
  app.use(bodyParser.json());

  app.get("/blockchain", (req, res) => res.json(blockchain));

  app.get("/mempool", (req, res) => res.json(mempool));

  app.post("/mine", (req, res) => {
    const block = addBlock();
    res.json(block);
  });

  app.post("/transaction", (req, res) => {
    const tx = Object.assign(new Transaction(), req.body);
    if (tx.isValid()) {
      submitTransaction(tx);
      res.send("✅ TX accepted");
    } else {
      res.status(400).send("❌ TX invalid");
    }
  });

  app.get("/contracts/:id", (req, res) => {
    const contract = smartContracts[req.params.id];
    res.json(contract ? contract.state : {});
  });

  app.post("/contracts/:id/execute", (req, res) => {
    const result = runContract(req.params.id, req.body);
    res.json(result || {});
  });

  app.post("/contracts/:id/deploy", (req, res) => {
    const { code, owner } = req.body;
    deployContract(req.params.id, code, owner);
    res.send("🚀 Contract deployed.");
  });

  app.listen(port, () =>
    console.log(`🌐 API running on http://localhost:${port}`)
  );
}

module.exports = { startApiServer };
