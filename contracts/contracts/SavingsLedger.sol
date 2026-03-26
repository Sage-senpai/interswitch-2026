// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SavingsLedger
 * @notice On-chain savings transparency for Purse — every deposit, withdrawal,
 *         and goal milestone is recorded immutably so women can prove their
 *         financial discipline to loan providers, grant programs, and WAG peers.
 *
 *         Designed for Polygon (low gas) so even ₦50 micro-savings are economical.
 *
 *         Integrated with Interswitch payment flow:
 *         1. User funds wallet via Interswitch IPG (card payment)
 *         2. Server confirms payment success via ISW callback
 *         3. Server calls recordDeposit() to log on-chain
 *         4. User can verify their savings history on Polygonscan
 */
contract SavingsLedger {
    // ─── Data Structures ─────────────────────────────────────────────────────

    struct SavingsRecord {
        address user;
        uint256 amount;         // Amount in kobo (₦1 = 100 kobo)
        string  goalName;       // e.g., "School Fees", "Business Capital"
        string  category;       // EDUCATION, BUSINESS, HEALTH, EMERGENCY, FAMILY
        string  iswReference;   // Interswitch transaction reference for verification
        uint256 timestamp;
        RecordType recordType;
    }

    enum RecordType { DEPOSIT, WITHDRAWAL, GOAL_REACHED, REWARD }

    // ─── State ───────────────────────────────────────────────────────────────

    address public owner;
    uint256 public totalRecords;
    uint256 public totalSavedKobo;      // Aggregate savings across all users
    uint256 public totalUsers;

    mapping(address => SavingsRecord[]) public userRecords;
    mapping(address => uint256) public userTotalSaved;
    mapping(address => bool) private knownUsers;

    // Authorized callers (backend service wallets)
    mapping(address => bool) public authorizedCallers;

    // ─── Events ──────────────────────────────────────────────────────────────

    event Deposited(
        address indexed user,
        uint256 amount,
        string goalName,
        string iswReference,
        uint256 timestamp
    );

    event Withdrawn(
        address indexed user,
        uint256 amount,
        string goalName,
        uint256 timestamp
    );

    event GoalReached(
        address indexed user,
        string goalName,
        uint256 totalSaved,
        uint256 timestamp
    );

    event RewardEarned(
        address indexed user,
        uint256 amount,
        string reason,
        uint256 timestamp
    );

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedCallers[msg.sender],
            "Not authorized"
        );
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        authorizedCallers[msg.sender] = true;
    }

    // ─── Admin Functions ─────────────────────────────────────────────────────

    function addAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
    }

    function removeAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
    }

    // ─── Core Functions ──────────────────────────────────────────────────────

    /**
     * @notice Record a savings deposit (called by backend after Interswitch payment confirms)
     * @param user        The user's mapped wallet address
     * @param amountKobo  Amount in kobo (₦5,000 = 500000 kobo)
     * @param goalName    Name of the savings goal
     * @param category    Goal category (EDUCATION, BUSINESS, etc.)
     * @param iswRef      Interswitch payment reference for cross-verification
     */
    function recordDeposit(
        address user,
        uint256 amountKobo,
        string calldata goalName,
        string calldata category,
        string calldata iswRef
    ) external onlyAuthorized {
        require(amountKobo > 0, "Amount must be > 0");
        require(user != address(0), "Invalid user address");

        userRecords[user].push(SavingsRecord({
            user: user,
            amount: amountKobo,
            goalName: goalName,
            category: category,
            iswReference: iswRef,
            timestamp: block.timestamp,
            recordType: RecordType.DEPOSIT
        }));

        userTotalSaved[user] += amountKobo;
        totalSavedKobo += amountKobo;
        totalRecords++;

        if (!knownUsers[user]) {
            knownUsers[user] = true;
            totalUsers++;
        }

        emit Deposited(user, amountKobo, goalName, iswRef, block.timestamp);
    }

    /**
     * @notice Record a withdrawal from savings
     */
    function recordWithdrawal(
        address user,
        uint256 amountKobo,
        string calldata goalName,
        string calldata category
    ) external onlyAuthorized {
        require(amountKobo > 0, "Amount must be > 0");

        userRecords[user].push(SavingsRecord({
            user: user,
            amount: amountKobo,
            goalName: goalName,
            category: category,
            iswReference: "",
            timestamp: block.timestamp,
            recordType: RecordType.WITHDRAWAL
        }));

        if (userTotalSaved[user] >= amountKobo) {
            userTotalSaved[user] -= amountKobo;
            totalSavedKobo -= amountKobo;
        }
        totalRecords++;

        emit Withdrawn(user, amountKobo, goalName, block.timestamp);
    }

    /**
     * @notice Record a savings goal milestone reached
     */
    function recordGoalReached(
        address user,
        string calldata goalName,
        uint256 totalForGoal
    ) external onlyAuthorized {
        userRecords[user].push(SavingsRecord({
            user: user,
            amount: totalForGoal,
            goalName: goalName,
            category: "MILESTONE",
            iswReference: "",
            timestamp: block.timestamp,
            recordType: RecordType.GOAL_REACHED
        }));

        totalRecords++;
        emit GoalReached(user, goalName, totalForGoal, block.timestamp);
    }

    /**
     * @notice Record a reward earned (lesson completion, referral, etc.)
     */
    function recordReward(
        address user,
        uint256 amountKobo,
        string calldata reason
    ) external onlyAuthorized {
        userRecords[user].push(SavingsRecord({
            user: user,
            amount: amountKobo,
            goalName: reason,
            category: "REWARD",
            iswReference: "",
            timestamp: block.timestamp,
            recordType: RecordType.REWARD
        }));

        userTotalSaved[user] += amountKobo;
        totalSavedKobo += amountKobo;
        totalRecords++;

        emit RewardEarned(user, amountKobo, reason, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────────────────────

    function getUserRecordCount(address user) external view returns (uint256) {
        return userRecords[user].length;
    }

    function getUserRecord(address user, uint256 index) external view returns (SavingsRecord memory) {
        require(index < userRecords[user].length, "Index out of bounds");
        return userRecords[user][index];
    }

    function getUserTotalSavedNaira(address user) external view returns (uint256) {
        return userTotalSaved[user] / 100; // Convert kobo to naira
    }

    function getTotalSavedNaira() external view returns (uint256) {
        return totalSavedKobo / 100;
    }

    /**
     * @notice Get a summary of the platform for transparency dashboards
     */
    function getPlatformStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalRecords,
        uint256 _totalSavedNaira
    ) {
        return (totalUsers, totalRecords, totalSavedKobo / 100);
    }
}
