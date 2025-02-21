const { electLeaderRoundRobin, electRandomLeader, electStakeWeighedLeader } = require('../src/leaderElection.service');
const { ethers } = require('ethers');

jest.mock('ethers', () => {
    const mockProvider = {
        getBlock: jest.fn().mockResolvedValue({ number: 101, prevRandao: "0x123" })
    };
    const mockContract = {
        getActiveOperatorsDetails: jest.fn()
    };
    return {
        ethers: {
            JsonRpcProvider: jest.fn(() => mockProvider),
            Contract: jest.fn(() => mockContract)
        }
    };
});

const mockContractInstance = new ethers.Contract();

describe("Leader Election Functions", () => {

    mockContractInstance.getActiveOperatorsDetails.mockResolvedValue([
        { operator: "0xOperator1", operatorId: 2, votingPower: 10 },
        { operator: "0xOperator2", operatorId: 5, votingPower: 20 },
        { operator: "0xOperator3", operatorId: 8, votingPower: 70 },
        { operator: "0xOperator4", operatorId: 9, votingPower: 50 }
    ]);

    it("should elect a leader using Round Robin", async () => {
        const leader = await electLeaderRoundRobin(101);
        expect(leader).toBe("0xOperator2");
    });

    it("should elect a leader using random selection", async () => {
        const leader = await electRandomLeader(101);
        expect(leader).toBe("0xOperator4")
    });

    it("should elect a leader using stake-weighted randomization", async () => {
        const leader = await electStakeWeighedLeader(101);
        expect(leader).toBe("0xOperator4")
    });
});


describe("Leader Election Functions with only 1 active operator", () => {
    beforeEach(() => {
        mockContractInstance.getActiveOperatorsDetails.mockResolvedValue([
            { operator: "0xOperator1", operatorId: 2, votingPower: 100 },
        ]);
    });
    it("should elect a leader using Round Robin", async () => {
        const leader = await electLeaderRoundRobin(101);
        expect(leader).toBe("0xOperator1");
    });

    it("should elect a leader using random selection", async () => {
        const leader = await electRandomLeader(101);
        expect(leader).toBe("0xOperator1")
    });

    it("should elect a leader using stake-weighted randomization", async () => {
        const leader = await electStakeWeighedLeader(101);
        expect(leader).toBe("0xOperator1")
    });
});

describe("Leader Election Functions with no active operators", () => {
    beforeEach(() => {
        mockContractInstance.getActiveOperatorsDetails.mockResolvedValue([]);
    });

    it("should throw an error for Round Robin when no operators are available", async () => {
        await expect(electLeaderRoundRobin(101)).rejects.toThrow("No active operators available");
    });

    it("should throw an error for random selection when no operators are available", async () => {
        await expect(electRandomLeader(101)).rejects.toThrow("No active operators available");
    });

    it("should throw an error for stake-weighted randomization when no operators are available", async () => {
        await expect(electStakeWeighedLeader(101)).rejects.toThrow("No active operators available");
    });
});