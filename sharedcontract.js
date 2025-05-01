const smartContracts = {};

class SmartContract {
  constructor(id, code, owner) {
    this.id = id;
    this.code = code;
    this.owner = owner;
    this.state = {};
  }

  execute(input) {
    try {
      const func = eval(this.code); // format: (state, input) => { ... }
      return func(this.state, input);
    } catch (e) {
      console.error(`Execution failed for contract ${this.id}:`, e);
      return null;
    }
  }
}

const deployContract = (id, code, owner) => {
  if (!smartContracts[id]) {
    smartContracts[id] = new SmartContract(id, code, owner);
    console.log(`🚀 Contract ${id} deployed.`);
  }
};

const runContract = (id, input) => {
  const contract = smartContracts[id];
  if (!contract) return null;
  return contract.execute(input);
};

module.exports = {
  smartContracts,
  deployContract,
  runContract
};
