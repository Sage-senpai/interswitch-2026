// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WAGPool
 * @notice Women Affinity Group pool contract — transparent group savings.
 *         Every contribution is recorded on-chain so all members can verify
 *         the pool balance without trusting a single person.
 *
 *         Flow with Interswitch:
 *         1. Member contributes via Interswitch Quickteller (off-chain payment)
 *         2. Server confirms payment via ISW callback
 *         3. Server calls recordContribution() to log on-chain
 *         4. Any member can call getPoolInfo() to verify total
 */
contract WAGPool {
    // ─── Data Structures ─────────────────────────────────────────────────────

    struct Contribution {
        address member;
        uint256 amountKobo;
        string  iswReference;   // Interswitch payment ref
        uint256 timestamp;
    }

    struct Pool {
        string  name;
        string  wagId;          // Off-chain WAG ID from the database
        address admin;
        uint256 totalKobo;
        uint256 memberCount;
        uint256 contributionCount;
        bool    isActive;
        uint256 createdAt;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    address public owner;
    uint256 public totalPools;

    mapping(uint256 => Pool) public pools;
    mapping(uint256 => Contribution[]) public poolContributions;
    mapping(uint256 => mapping(address => uint256)) public memberTotals;
    mapping(uint256 => mapping(address => bool)) public isMember;
    mapping(address => bool) public authorizedCallers;

    // ─── Events ──────────────────────────────────────────────────────────────

    event PoolCreated(uint256 indexed poolId, string name, string wagId, address admin);
    event ContributionRecorded(uint256 indexed poolId, address indexed member, uint256 amount, string iswRef);
    event MemberAdded(uint256 indexed poolId, address member);
    event PayoutRecorded(uint256 indexed poolId, address indexed recipient, uint256 amount);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedCallers[msg.sender], "Not authorized");
        _;
    }

    modifier poolExists(uint256 poolId) {
        require(poolId < totalPools, "Pool does not exist");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        authorizedCallers[msg.sender] = true;
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function addAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
    }

    // ─── Pool Management ─────────────────────────────────────────────────────

    /**
     * @notice Create a new WAG pool (called when a WAG is created in the app)
     */
    function createPool(
        string calldata name,
        string calldata wagId,
        address admin
    ) external onlyAuthorized returns (uint256) {
        uint256 poolId = totalPools;

        pools[poolId] = Pool({
            name: name,
            wagId: wagId,
            admin: admin,
            totalKobo: 0,
            memberCount: 1,
            contributionCount: 0,
            isActive: true,
            createdAt: block.timestamp
        });

        isMember[poolId][admin] = true;
        totalPools++;

        emit PoolCreated(poolId, name, wagId, admin);
        return poolId;
    }

    /**
     * @notice Add a member to a WAG pool
     */
    function addMember(uint256 poolId, address member) external onlyAuthorized poolExists(poolId) {
        require(!isMember[poolId][member], "Already a member");
        isMember[poolId][member] = true;
        pools[poolId].memberCount++;
        emit MemberAdded(poolId, member);
    }

    /**
     * @notice Record a contribution (called after Interswitch payment confirms)
     */
    function recordContribution(
        uint256 poolId,
        address member,
        uint256 amountKobo,
        string calldata iswRef
    ) external onlyAuthorized poolExists(poolId) {
        require(pools[poolId].isActive, "Pool is not active");
        require(amountKobo > 0, "Amount must be > 0");

        poolContributions[poolId].push(Contribution({
            member: member,
            amountKobo: amountKobo,
            iswReference: iswRef,
            timestamp: block.timestamp
        }));

        pools[poolId].totalKobo += amountKobo;
        pools[poolId].contributionCount++;
        memberTotals[poolId][member] += amountKobo;

        // Auto-add as member if not already
        if (!isMember[poolId][member]) {
            isMember[poolId][member] = true;
            pools[poolId].memberCount++;
        }

        emit ContributionRecorded(poolId, member, amountKobo, iswRef);
    }

    /**
     * @notice Record a payout (rotating savings payout to a member)
     */
    function recordPayout(
        uint256 poolId,
        address recipient,
        uint256 amountKobo
    ) external onlyAuthorized poolExists(poolId) {
        require(pools[poolId].totalKobo >= amountKobo, "Insufficient pool balance");
        pools[poolId].totalKobo -= amountKobo;
        emit PayoutRecorded(poolId, recipient, amountKobo);
    }

    // ─── View Functions ──────────────────────────────────────────────────────

    function getPoolInfo(uint256 poolId) external view poolExists(poolId) returns (
        string memory name,
        uint256 totalNaira,
        uint256 memberCount,
        uint256 contributionCount,
        bool isActive
    ) {
        Pool storage p = pools[poolId];
        return (p.name, p.totalKobo / 100, p.memberCount, p.contributionCount, p.isActive);
    }

    function getMemberTotal(uint256 poolId, address member) external view returns (uint256) {
        return memberTotals[poolId][member] / 100; // Returns naira
    }

    function getContributionCount(uint256 poolId) external view returns (uint256) {
        return poolContributions[poolId].length;
    }

    function getContribution(uint256 poolId, uint256 index) external view returns (Contribution memory) {
        require(index < poolContributions[poolId].length, "Index out of bounds");
        return poolContributions[poolId][index];
    }
}
