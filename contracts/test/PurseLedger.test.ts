import { expect } from "chai";
import { ethers } from "hardhat";

describe("SavingsLedger", function () {
  let ledger: any;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const SavingsLedger = await ethers.getContractFactory("SavingsLedger");
    ledger = await SavingsLedger.deploy();
  });

  it("should record a deposit with ISW reference", async function () {
    await ledger.recordDeposit(
      user1.address, 500000, "School Fees", "EDUCATION", "ISW-REF-001"
    );

    const count = await ledger.getUserRecordCount(user1.address);
    expect(count).to.equal(1n);

    const record = await ledger.getUserRecord(user1.address, 0);
    expect(record.amount).to.equal(500000n);
    expect(record.goalName).to.equal("School Fees");
    expect(record.iswReference).to.equal("ISW-REF-001");
  });

  it("should track total saved in naira", async function () {
    await ledger.recordDeposit(user1.address, 500000, "Goal A", "EDUCATION", "REF-1");
    await ledger.recordDeposit(user1.address, 200000, "Goal B", "HEALTH", "REF-2");

    const total = await ledger.getUserTotalSavedNaira(user1.address);
    expect(total).to.equal(7000n); // ₦7,000
  });

  it("should handle withdrawals correctly", async function () {
    await ledger.recordDeposit(user1.address, 1000000, "Biz", "BUSINESS", "REF-1");
    await ledger.recordWithdrawal(user1.address, 300000, "Biz", "BUSINESS");

    const total = await ledger.getUserTotalSavedNaira(user1.address);
    expect(total).to.equal(7000n); // ₦10,000 - ₦3,000 = ₦7,000
  });

  it("should record rewards", async function () {
    await ledger.recordReward(user1.address, 5000, "Lesson completed");
    const total = await ledger.getUserTotalSavedNaira(user1.address);
    expect(total).to.equal(50n); // ₦50
  });

  it("should track platform stats", async function () {
    await ledger.recordDeposit(user1.address, 500000, "Goal", "SAVING", "REF-1");
    const stats = await ledger.getPlatformStats();
    expect(stats._totalUsers).to.equal(1n);
    expect(stats._totalRecords).to.equal(1n);
    expect(stats._totalSavedNaira).to.equal(5000n);
  });

  it("should reject unauthorized callers", async function () {
    try {
      await ledger.connect(user1).recordDeposit(
        user1.address, 100, "Test", "TEST", "REF"
      );
      expect.fail("Should have reverted");
    } catch (error: any) {
      expect(error.message).to.include("Not authorized");
    }
  });
});

describe("WAGPool", function () {
  let pool: any;
  let owner: any;
  let member1: any;
  let member2: any;

  beforeEach(async function () {
    [owner, member1, member2] = await ethers.getSigners();
    const WAGPool = await ethers.getContractFactory("WAGPool");
    pool = await WAGPool.deploy();
  });

  it("should create a pool", async function () {
    await pool.createPool("Market Women", "wag-001", owner.address);
    const info = await pool.getPoolInfo(0);
    expect(info.name).to.equal("Market Women");
    expect(info.memberCount).to.equal(1n);
  });

  it("should record contributions with ISW reference", async function () {
    await pool.createPool("Test WAG", "wag-002", owner.address);
    await pool.recordContribution(0, member1.address, 100000, "ISW-WAG-REF-001");

    const info = await pool.getPoolInfo(0);
    expect(info.totalNaira).to.equal(1000n);
    expect(info.memberCount).to.equal(2n);
  });

  it("should track individual member totals", async function () {
    await pool.createPool("Test", "wag-003", owner.address);
    await pool.recordContribution(0, member1.address, 200000, "REF-1");
    await pool.recordContribution(0, member1.address, 300000, "REF-2");

    const total = await pool.getMemberTotal(0, member1.address);
    expect(total).to.equal(5000n);
  });

  it("should handle payouts", async function () {
    await pool.createPool("Payout Test", "wag-004", owner.address);
    await pool.recordContribution(0, member1.address, 500000, "REF-1");
    await pool.recordPayout(0, member1.address, 200000);

    const info = await pool.getPoolInfo(0);
    expect(info.totalNaira).to.equal(3000n);
  });
});
