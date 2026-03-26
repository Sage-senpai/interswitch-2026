import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC");

  // Deploy SavingsLedger
  console.log("\n--- Deploying SavingsLedger ---");
  const SavingsLedger = await ethers.getContractFactory("SavingsLedger");
  const ledger = await SavingsLedger.deploy();
  await ledger.waitForDeployment();
  const ledgerAddr = await ledger.getAddress();
  console.log("SavingsLedger deployed to:", ledgerAddr);

  // Deploy WAGPool
  console.log("\n--- Deploying WAGPool ---");
  const WAGPool = await ethers.getContractFactory("WAGPool");
  const pool = await WAGPool.deploy();
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("WAGPool deployed to:", poolAddr);

  // ─── Demo: simulate a full Purse flow ──────────────────────────────────

  console.log("\n--- Running Demo Transactions ---\n");

  // Simulate: User funds wallet via Interswitch IPG, then saves ₦5,000
  const userAddr = deployer.address; // In production, each user gets a derived address

  // 1. Record a savings deposit (after ISW payment confirmed)
  let tx = await ledger.recordDeposit(
    userAddr,
    500000, // ₦5,000 in kobo
    "Daughter's School Fees",
    "EDUCATION",
    "PURSE-ISW-REF-001"
  );
  await tx.wait();
  console.log("1. Recorded deposit: ₦5,000 for School Fees (ISW ref: PURSE-ISW-REF-001)");

  // 2. Record another savings deposit
  tx = await ledger.recordDeposit(
    userAddr,
    200000, // ₦2,000
    "Emergency Fund",
    "EMERGENCY",
    "PURSE-ISW-REF-002"
  );
  await tx.wait();
  console.log("2. Recorded deposit: ₦2,000 for Emergency Fund (ISW ref: PURSE-ISW-REF-002)");

  // 3. Record a lesson completion reward
  tx = await ledger.recordReward(
    userAddr,
    5000, // ₦50
    "Completed: Your First Budget - The 50-30-20 Rule"
  );
  await tx.wait();
  console.log("3. Recorded reward: ₦50 for completing budgeting lesson");

  // 4. Check user stats
  const userTotal = await ledger.getUserTotalSavedNaira(userAddr);
  const recordCount = await ledger.getUserRecordCount(userAddr);
  console.log(`\nUser stats: ₦${userTotal} total saved, ${recordCount} records`);

  // 5. Create a WAG pool
  tx = await pool.createPool("Iya Oloja Market Women", "wag-001", userAddr);
  await tx.wait();
  console.log("\n4. Created WAG pool: Iya Oloja Market Women");

  // 6. Record a WAG contribution (after ISW Quickteller payment)
  tx = await pool.recordContribution(0, userAddr, 100000, "PURSE-ISW-WAG-001");
  await tx.wait();
  console.log("5. Recorded WAG contribution: ₦1,000 (ISW ref: PURSE-ISW-WAG-001)");

  // 7. Check pool info
  const poolInfo = await pool.getPoolInfo(0);
  console.log(`\nWAG Pool: ${poolInfo.name} — ₦${poolInfo.totalNaira} pool, ${poolInfo.memberCount} members`);

  // 8. Platform-wide stats
  const stats = await ledger.getPlatformStats();
  console.log(`\nPlatform stats: ${stats._totalUsers} users, ${stats._totalRecords} records, ₦${stats._totalSavedNaira} total saved`);

  // ─── Summary ───────────────────────────────────────────────────────────

  console.log("\n═══════════════════════════════════════════");
  console.log("  Purse Blockchain Layer — Deployed!");
  console.log("═══════════════════════════════════════════");
  console.log(`  SavingsLedger: ${ledgerAddr}`);
  console.log(`  WAGPool:       ${poolAddr}`);
  console.log("═══════════════════════════════════════════");
  console.log("\nTo verify on Polygonscan (if deployed to Amoy):");
  console.log(`  npx hardhat verify --network amoy ${ledgerAddr}`);
  console.log(`  npx hardhat verify --network amoy ${poolAddr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
