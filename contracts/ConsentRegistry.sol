// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Reference contract for purpose-bound, automatically expiring access grants.
contract ConsentRegistry {
    struct Grant {
        address subject;
        address organization;
        bytes32 assetHash;
        bytes32 dataScopeHash;
        bytes32 purposeHash;
        uint64 grantedAt;
        uint64 expiresAt;
        bool revoked;
    }

    mapping(bytes32 => Grant) public grants;

    event AccessGranted(bytes32 indexed grantId, address indexed subject, address indexed organization, uint64 expiresAt);
    event AccessRevoked(bytes32 indexed grantId, address indexed subject);

    function grantAccess(
        address organization,
        bytes32 assetHash,
        bytes32 dataScopeHash,
        bytes32 purposeHash,
        uint64 expiresAt
    ) external returns (bytes32 grantId) {
        require(organization != address(0), "invalid organization");
        require(expiresAt > block.timestamp, "expiry must be future");
        grantId = keccak256(abi.encode(msg.sender, organization, assetHash, purposeHash, block.timestamp));
        require(grants[grantId].subject == address(0), "grant exists");
        grants[grantId] = Grant(msg.sender, organization, assetHash, dataScopeHash, purposeHash, uint64(block.timestamp), expiresAt, false);
        emit AccessGranted(grantId, msg.sender, organization, expiresAt);
    }

    function revokeAccess(bytes32 grantId) external {
        Grant storage grant = grants[grantId];
        require(grant.subject == msg.sender, "not subject");
        require(!grant.revoked, "already revoked");
        grant.revoked = true;
        emit AccessRevoked(grantId, msg.sender);
    }

    function isAuthorized(bytes32 grantId, address organization) external view returns (bool) {
        Grant memory grant = grants[grantId];
        return grant.organization == organization && !grant.revoked && block.timestamp < grant.expiresAt;
    }
}
