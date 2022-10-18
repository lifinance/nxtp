import { expect, getRandomBytes32 } from "@connext/nxtp-utils";
import { constants } from "ethers";

import { SparseMerkleTree } from "../../src/helpers/merkle";

import { DBImpl, MockMerkleLib, MockTree } from "./merkleHelpers";

describe("Helpers: Merkle", () => {
  const TREE_HEIGHT = 32;
  const SAMPLE_HASH_COUNT = 1000;
  const SAMPLE_HASHES: string[] = [];

  before(() => {
    console.log(`Generating ${SAMPLE_HASH_COUNT} sample leaf hashes...`);
    for (let i = 0; i < SAMPLE_HASH_COUNT; i++) {
      SAMPLE_HASHES.push(getRandomBytes32());
    }
    console.log(`Generating ${SAMPLE_HASH_COUNT} sample leaf hashes... done.`);
  });

  describe("MockMerkleLib", () => {
    let mockle: MockMerkleLib;

    beforeEach(() => {
      mockle = new MockMerkleLib(TREE_HEIGHT);
    });

    describe("#insert", () => {
      it("should handle 4 total inserts correctly", () => {
        /**
         * 4 total nodes inserted (A-D), final branch should look like:
         * [
         *   C
         *   (A,B)
         *   ((A,B), (C,D))
         * ]
         */
        // Assign first four values from sample hashes.
        const [A, B, C, D] = SAMPLE_HASHES;

        for (const value of [A, B, C, D]) {
          mockle.insert(value);
        }

        // For readability, pre-calc some hashes:
        const AB = SparseMerkleTree.hash(A, B);
        const ABCD = SparseMerkleTree.hash(AB, SparseMerkleTree.hash(C, D));

        // Compare active branch to expected.
        const branch = mockle.getBranch();
        expect(branch).to.be.deep.eq([C, AB, ABCD]);

        /**
         * Calculating root for 4 (..00100) total:
         * [
         *   (0,0)
         *   ((0,0), (0,0))
         *   (((A,B), (C,D)), ((0,0), (0,0)))
         *   ...
         * ]
         */
        // Pre-calc root based on expected behavior.
        let precalc = constants.HashZero;
        for (let i = 0; i < TREE_HEIGHT; i++) {
          if (i === 2) {
            precalc = SparseMerkleTree.hash(ABCD, precalc);
          } else {
            precalc = SparseMerkleTree.hash(precalc, MockMerkleLib.ZERO_HASHES[i]);
          }
        }

        const root = mockle.root();
        expect(root).to.be.eq(precalc);
      });

      it("should handle 8 total inserts correctly", () => {
        /**
         * 8 total nodes inserted (A-H), final branch should look like:
         * [
         *   G
         *   (E,F)
         *   ((A,B), (C,D))
         *   (((A,B), (C,D)), ((E,F), (G,H)))
         * ]
         */
        // Assign first eight values from sample hashes.
        const [A, B, C, D, E, F, G, H] = SAMPLE_HASHES;

        for (const value of [A, B, C, D, E, F, G, H]) {
          mockle.insert(value);
        }

        // For readability, pre-calc some hashes:
        const EF = SparseMerkleTree.hash(E, F);
        const ABCD = SparseMerkleTree.hash(SparseMerkleTree.hash(A, B), SparseMerkleTree.hash(C, D));
        const EFGH = SparseMerkleTree.hash(EF, SparseMerkleTree.hash(G, H));
        const ABCDEFGH = SparseMerkleTree.hash(ABCD, EFGH);

        // Compare active branch to expected.
        const branch = mockle.getBranch();
        expect(branch).to.be.deep.eq([G, EF, ABCD, ABCDEFGH]);

        /**
         * Calculating root for 8 (..01000) total:
         * [
         *   (0,0)
         *   ((0,0), (0,0))
         *   (((0,0), (0,0)), ((0,0), (0,0)))
         *   ( (((A,B), (C,D)), ((E,F), (G,H))), (((0,0), (0,0)), ((0,0), (0,0))) )
         *   ...
         * ]
         */
        // Pre-calc root based on expected behavior.
        let precalc = constants.HashZero;
        for (let i = 0; i < TREE_HEIGHT; i++) {
          if (i === 3) {
            precalc = SparseMerkleTree.hash(ABCDEFGH, precalc);
          } else {
            precalc = SparseMerkleTree.hash(precalc, MockMerkleLib.ZERO_HASHES[i]);
          }
        }

        const root = mockle.root();
        expect(root).to.be.eq(precalc);
      });
    });
  });

  describe("SparseMerkleTree", () => {
    let db: DBImpl;
    let merkle: SparseMerkleTree;
    let mockle: MockMerkleLib;

    beforeEach(() => {
      db = new DBImpl();
      mockle = new MockMerkleLib(TREE_HEIGHT);

      for (let i = 0; i < SAMPLE_HASH_COUNT; i++) {
        // Insert ALL sample hashes into the DB.
        db.push(SAMPLE_HASHES[i]);
        // Insert ALL sample hashes into the mock MerkleLib.
        mockle.insert(SAMPLE_HASHES[i]);
      }

      merkle = new SparseMerkleTree(db, TREE_HEIGHT);
    });

    describe("#getRoot", () => {
      it("should calculate same root as the active branch would on-chain", async () => {
        const merkleRoot = await merkle.getRoot();
        const mockleRoot = mockle.root();
        expect(merkleRoot).to.be.eq(mockleRoot);
      });
    });

    describe("#getMerkleProof", () => {
      it("should get merkle proof", async () => {
        const expectedRoot = mockle.root();

        // Pick a random leaf for whom we want to get the proof.
        const index = 573; // This index is definitely random, I generated it myself.
        const leaf: string = (await db.getNode(index))!;

        const start = Date.now();
        const proof = await merkle.getProof(index);
        console.log(`Calculated proof. Took: ${Date.now() - start}ms`);

        expect(proof.length).to.be.eq(TREE_HEIGHT);

        // Verify using the same lib:
        const result = merkle.verify(index, leaf, proof, expectedRoot);
        // Verify using the mock of the on-chain behavior for `branchRoot`:
        const mockBranchRoot = MockMerkleLib.branchRoot(leaf, proof, index);

        // console.log({
        //   ...result,
        //   mockExpectedRoot: expectedRoot,
        //   mockBranchRoot: mockBranchRoot,
        //   proof,
        // });

        expect(result.verified).to.be.true;
        expect(result.calculated).to.be.eq(expectedRoot);
        expect(result.calculated).to.be.eq(mockBranchRoot);
      });

      // TODO: @jakek the next two tests fail if the sanity check in Merkle is re-added
      it("should get merkle proof at boundry", async () => {
        const expectedRoot = mockle.root();

        const index = 999; // Index is at the boundry of the tree.
        const leaf: string = (await db.getNode(index))!;

        const start = Date.now();
        const proof = await merkle.getProof(index);
        console.log(`Calculated proof. Took: ${Date.now() - start}ms`);

        expect(proof.length).to.be.eq(TREE_HEIGHT);

        // Verify using the same lib:
        const result = merkle.verify(index, leaf, proof, expectedRoot);
        // Verify using the mock of the on-chain behavior for `branchRoot`:
        const mockBranchRoot = MockMerkleLib.branchRoot(leaf, proof, index);

        expect(result.verified).to.be.true;
        expect(result.calculated).to.be.eq(expectedRoot);
        expect(result.calculated).to.be.eq(mockBranchRoot);
      });

      it("should get merkle proof if inserted hashes are a power of 2", async () => {
        db = new DBImpl();
        mockle = new MockMerkleLib(TREE_HEIGHT);
        const sampleHashes: string[] = [];
        for (let i = 0; i < 2; i++) {
          sampleHashes.push(getRandomBytes32());
        }

        for (let i = 0; i < 2; i++) {
          // Insert ALL sample hashes into the DB.
          db.push(SAMPLE_HASHES[i]);
          // Insert ALL sample hashes into the mock MerkleLib.
          mockle.insert(SAMPLE_HASHES[i]);
        }

        merkle = new SparseMerkleTree(db, TREE_HEIGHT);
        const expectedRoot = mockle.root();

        const index = 0;
        const leaf: string = (await db.getNode(index))!;

        const start = Date.now();
        const proof = await merkle.getProof(index);
        console.log(`Calculated proof. Took: ${Date.now() - start}ms`);

        expect(proof.length).to.be.eq(TREE_HEIGHT);

        // Verify using the same lib:
        const result = merkle.verify(index, leaf, proof, expectedRoot);
        // Verify using the mock of the on-chain behavior for `branchRoot`:
        const mockBranchRoot = MockMerkleLib.branchRoot(leaf, proof, index);

        expect(result.verified).to.be.true;
        expect(result.calculated).to.be.eq(expectedRoot);
        expect(result.calculated).to.be.eq(mockBranchRoot);
      });
    });
  });

  describe("Live Data Test", () => {
    it.only("should generate roots for messages inside outbound root", async () => {
      let db = new DBImpl();
      let mockle = new MockMerkleLib(TREE_HEIGHT);

      // Insert ALL sample hashes into the DB.
      db.push("0xc1cd1b9ba9310c64a39b4e9b9cf5228b5357633c9c28ab7fdbec4d4b7c74d959");
      db.push("0x6ec95b703fabad4b653563971197ab8025dc649b4152ce68d8a81dc2fed1e48f");
      // Insert ALL sample hashes into the mock MerkleLib.
      mockle.insert("0xc1cd1b9ba9310c64a39b4e9b9cf5228b5357633c9c28ab7fdbec4d4b7c74d959");
      mockle.insert("0x6ec95b703fabad4b653563971197ab8025dc649b4152ce68d8a81dc2fed1e48f");

      let merkle = new SparseMerkleTree(db, TREE_HEIGHT);
      const expectedRoot = mockle.root();
      console.log("expectedRoot: ", expectedRoot);

      const index = 0;
      const leaf: string = (await db.getNode(index))!;

      const start = Date.now();
      const proof = await merkle.getProof(index);
      console.log("proof: ", proof);
      console.log(`Calculated proof. Took: ${Date.now() - start}ms`);

      expect(proof.length).to.be.eq(TREE_HEIGHT);

      // Verify using the same lib:
      const result = merkle.verify(index, leaf, proof, expectedRoot);
      // Verify using the mock of the on-chain behavior for `branchRoot`:
      const mockBranchRoot = MockMerkleLib.branchRoot(leaf, proof, index);
      console.log("mockBranchRoot: ", mockBranchRoot);

      expect(result.verified).to.be.true;
      expect(result.calculated).to.be.eq(expectedRoot);
      expect(result.calculated).to.be.eq(mockBranchRoot);
    });

    it.only("should generate roots for outbound roots inside aggregate root", async () => {
      let db = new DBImpl();
      let mockle = new MockMerkleLib(TREE_HEIGHT);

      // Insert ALL sample hashes into the DB.
      db.push("0x003e20361347289ed4d3d4b132dea38fd618cf2b10a6d45f5163494f4dc9f77e");
      // Insert ALL sample hashes into the mock MerkleLib.
      mockle.insert("0x003e20361347289ed4d3d4b132dea38fd618cf2b10a6d45f5163494f4dc9f77e");

      let merkle = new SparseMerkleTree(db, TREE_HEIGHT);
      const expectedRoot = mockle.root();
      console.log("expectedRoot: ", expectedRoot);

      const index = 0;
      const leaf: string = (await db.getNode(index))!;

      const start = Date.now();
      const proof = await merkle.getProof(index);
      console.log("proof: ", proof);
      console.log(`Calculated proof. Took: ${Date.now() - start}ms`);

      expect(proof.length).to.be.eq(TREE_HEIGHT);

      // Verify using the same lib:
      const result = merkle.verify(index, leaf, proof, expectedRoot);
      // Verify using the mock of the on-chain behavior for `branchRoot`:
      const mockBranchRoot = MockMerkleLib.branchRoot(leaf, proof, index);
      console.log("mockBranchRoot: ", mockBranchRoot);

      expect(result.verified).to.be.true;
      expect(result.calculated).to.be.eq(expectedRoot);
      expect(result.calculated).to.be.eq(mockBranchRoot);
    });
  });
});
