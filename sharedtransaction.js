const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
  constructor(sender, receiver, amount, signature = null) {
    Object.assign(this, { sender, receiver, amount, signature });
  }

  calculateHash() {
    return crypto.createHash("sha256")
      .update(this.sender + this.receiver + this.amount)
      .digest("hex");
  }

  sign(privateKeyHex) {
    const key = ec.keyFromPrivate(privateKeyHex, "hex");
    const sig = key.sign(this.calculateHash(), "hex");
    this.signature = sig.toDER("hex");
  }

  isValid() {
    try {
      if (!this.signature) return false;
      const key = ec.keyFromPublic(this.sender, "hex");
      return key.verify(this.calculateHash(), this.signature);
    } catch {
      return false;
    }
  }
}

module.exports = { Transaction };
