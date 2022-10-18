import { DBHelper } from "@connext/nxtp-utils";
import { constants } from "ethers";

import { SparseMerkleTree, ZERO_HASHES } from "../../src/helpers/merkle";

/// MARK - types/class to mock behavior of on-chain MerkleLib.
export type MockTree = {
  branch: string[];
  count: number;
};

export class MockMerkleLib {
  public static readonly ZERO_HASHES = ZERO_HASHES().reverse();

  public readonly MAX_LEAVES: number;
  private tree: MockTree;

  constructor(public readonly height: number) {
    this.tree = {
      branch: new Array<string>(this.height).fill(constants.HashZero as string),
      count: 0,
    };
    this.MAX_LEAVES = 2 ** this.height - 1;
  }

  public printBranch() {
    console.log(this.getBranch());
  }

  public printBranchWithCtx() {
    console.log(this.getBranchWithCtx());
  }

  public getBranch(): string[] {
    const furthestDepth = this.tree.branch.indexOf(constants.HashZero as string);
    return this.tree.branch.slice(0, furthestDepth);
  }

  public getBranchWithCtx(): string[] {
    const furthestDepth = this.tree.branch.indexOf(constants.HashZero as string);
    return this.tree.branch.slice(0, furthestDepth).concat(MockMerkleLib.ZERO_HASHES.slice(furthestDepth));
  }

  /// MARK - Mocking of onchain functions:

  // See `MerkleLib.insert`
  public insert(node: string): number {
    let size: number = this.tree.count + 1;
    if (size >= this.MAX_LEAVES) {
      throw new Error("MerkleLibMock: tree is full!");
    }

    this.tree.count = size;
    for (let i = 0; i < this.height; i++) {
      if ((size & 1) == 1) {
        this.tree.branch[i] = node;
        return size;
      }
      node = SparseMerkleTree.hash(this.tree.branch[i], node);
      size /= 2;
    }

    throw new Error("MerkleLibMock: reached end of execution in `insert`, fn is broken.");
  }

  // See: `MerkleLib.rootWithCtx`
  public root(): string {
    let current: string = constants.HashZero;
    let index: number = this.tree.count;

    for (let i = 0; i < this.height; i++) {
      const ithBit = (index >> i) & 1;
      if (ithBit == 1) {
        current = SparseMerkleTree.hash(this.tree.branch[i], current);
      } else {
        current = SparseMerkleTree.hash(current, MockMerkleLib.ZERO_HASHES[i]);
      }
    }

    return current;
  }

  // See `MerkleLib.branchRoot`
  public static branchRoot(leaf: string, branch: string[], index: number): string {
    const height = branch.length;

    let current = leaf;
    for (let i = 0; i < height; i++) {
      const ithBit = (index >> i) & 1;
      const sibling = branch[i];
      if (ithBit == 1) {
        // If ith bit is 1, then the leaf is somewhere to the right.
        current = SparseMerkleTree.hash(sibling, current);
      } else {
        // If the ith bit is 0, then the leaf is somewhere to the left.
        current = SparseMerkleTree.hash(current, sibling);
      }
    }

    return current;
  }
}

export class DBImpl implements DBHelper {
  private storage: string[] = [];

  // Get the current number of nodes in the DB.
  public async getCount(): Promise<number> {
    return this.storage.length;
  }

  public async getNode(index: number): Promise<string | undefined> {
    return this.storage[index];
  }

  // NOTE: is INCLUSIVE!
  // NOTE: will NOT fill in missing values!
  public async getNodes(start: number, end: number): Promise<string[]> {
    return this.storage.slice(start, end + 1);
  }

  public async push(hash: string) {
    this.storage.push(hash);
  }

  public async putRoot() {
    // noop
  }

  public async getRoot() {
    return undefined;
  }
}
