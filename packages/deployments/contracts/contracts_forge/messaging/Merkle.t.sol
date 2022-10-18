// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

import {MerkleTreeManager} from "../../contracts/messaging/Merkle.sol";
import {MerkleLib} from "../../contracts/messaging/libraries/Merkle.sol";

import "../utils/ForgeHelper.sol";

contract MerkleTest is ForgeHelper {
  MerkleTreeManager public merkle;

  function setUp() public {
    merkle = new MerkleTreeManager();
    merkle.initialize(address(this));
  }

  function test_Merkle__insert_shouldUpdateCount() public {
    bytes32 _messageHash;
    uint256 _count;
    for (uint256 i = 0; i < 10; i++) {
      _messageHash = keccak256(abi.encode(i));
      (, _count) = merkle.insert(_messageHash);
      assertEq(_count - 1, i);
    }
  }

  function test_Merkle__insert_realDataSpoke() public {
    bytes32 _root;
    uint256 _count;
    (_root, _count) = merkle.insert(0xc1cd1b9ba9310c64a39b4e9b9cf5228b5357633c9c28ab7fdbec4d4b7c74d959);
    (_root, _count) = merkle.insert(0x6ec95b703fabad4b653563971197ab8025dc649b4152ce68d8a81dc2fed1e48f);
    emit log_named_bytes32("root", _root);
    emit log_named_uint("count", _count);
  }

  function test_Merkle__insert_realDataAggregate() public {
    bytes32 _root;
    uint256 _count;
    (_root, _count) = merkle.insert(0x003e20361347289ed4d3d4b132dea38fd618cf2b10a6d45f5163494f4dc9f77e);
    emit log_named_bytes32("root", _root);
    emit log_named_uint("count", _count);
  }
}
