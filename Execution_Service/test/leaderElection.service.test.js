const { electLeaderRoundRobin, electRandomLeader, electStakeWeighedLeader } = require('../src/leaderElection.service');
const { ethers } = require('ethers');

jest.mock('ethers', () => {
  const mockProvider = {
    getBlock: jest.fn().mockResolvedValue({ number: 101, prevRandao: "0x123" })
  };
  return {
    ethers: {
      JsonRpcProvider: jest.fn(() => mockProvider),
      Contract: jest.fn(() => ({
        getActiveOperatorsDetails: jest.fn().mockResolvedValue([
            { operator: "0xOperator1", operatorId: 2, votingPower: 100 },
            { operator: "0xOperator2", operatorId: 5, votingPower: 200 },
            { operator: "0xOperator3", operatorId: 8, votingPower: 700 },
            { operator: "0xOperator4", operatorId: 9, votingPower: 50 }
          ]),
      }))
    }
  };
});


describe("Leader Election Functions", () => {
  it("should elect a leader using Round Robin", async () => {
    const leader = await electLeaderRoundRobin(101);
    expect(leader).toBe("0xOperator2");
  });

  it("should elect a leader using random selection", async () => {
    const leader = await electRandomLeader(101);
    expect("0xOperator4").toContain(leader);
  });

  it("should elect a leader using stake-weighted randomization", async () => {
    const leader = await electStakeWeighedLeader(101);
    expect("0xOperator2").toContain(leader);
  });
});
