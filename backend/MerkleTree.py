import hashlib
from typing import Optional, List, Tuple

def hash_leaf(e: str) -> str:
    return hashlib.sha256(e.encode()).hexdigest()

def get_bit_path(e: str, depth: int = 256) -> List[int]:
    h = int(hash_leaf(e), 16)
    return [(h >> i) & 1 for i in range(depth)]

class Node:
    """Represents a node in the Merkle Tree."""
    def __init__(self, value: Optional[str] = None):
        self.value = value
        self.left: Optional[Node] = None
        self.right: Optional[Node] = None
        self.hash: Optional[str] = None

    def is_leaf(self) -> bool:
        return self.value is not None

    def compute_hash(self) -> str:
        if self.is_leaf():
            self.hash = hash_leaf(self.value)
        else:
            # For internal nodes, the hash is the hash of its children's hashes.
            # If a child is missing, it's treated as an empty string for hashing,
            # but to maintain consistency in sparse trees, if one child exists,
            # we hash it with itself.
            left_hash = self.left.compute_hash() if self.left else ''
            right_hash = self.right.compute_hash() if self.right else left_hash
            if not self.left: # If left is missing, use right's hash twice
                left_hash = right_hash
            
            self.hash = hashlib.sha256((left_hash + right_hash).encode()).hexdigest()
        return self.hash

class IncrementalMerkleTree:
    def __init__(self):
        self.root: Optional[Node] = None

    def insert(self, value: str):
        if self.root is None:
            self.root = Node(value=value)
        else:
            self._insert_recursive(self.root, value, get_bit_path(value), 0)
        
        # After any modification, re-compute the root hash for the entire tree.
        self.root.compute_hash()

    def _insert_recursive(self, node: Node, value: str, path: List[int], depth: int):
        """Recursively traverses the tree to find the correct position for the new value."""
        if node.is_leaf():
            # If the value already exists, do nothing.
            if node.value == value:
                return
            # A collision has occurred. The existing leaf must be pushed down.
            self._handle_collision(node, value, path, depth)
            return

        # For internal nodes, decide whether to go left (0) or right (1).
        if depth >= len(path):
            return

        direction = path[depth]
        if direction == 0:
            if node.left is None:
                node.left = Node(value=value)
            else:
                self._insert_recursive(node.left, value, path, depth + 1)
        else: # direction == 1
            if node.right is None:
                node.right = Node(value=value)
            else:
                self._insert_recursive(node.right, value, path, depth + 1)

    def _handle_collision(self, node: Node, new_value: str, new_path: List[int], depth: int):
        """
        Resolves a collision by converting the leaf node into an internal node
        and recursively inserting both the old and new values from this point.
        """
        old_value = node.value
        old_path = get_bit_path(old_value)

        # The current node is the collision point. Turn it into an internal node.
        node.value = None
        
        # Re-insert both the old value and the new value.
        # This will recursively build the necessary branching structure until
        # the bit paths for the two values diverge.
        self._insert_recursive(node, old_value, old_path, depth)
        self._insert_recursive(node, new_value, new_path, depth)

    def get_root(self) -> str:
        """Returns the current root hash of the tree."""
        return self.root.hash if self.root and self.root.hash else ''

    def get_proof(self, value: str) -> List[Tuple[str, str]]:
        """
        Generates a Merkle proof for a given value.
        The proof is a list of (sibling_hash, position) tuples.
        """
        proof: List[Tuple[str, str]] = []

        def dfs(node: Node) -> bool:
            if node is None:
                return False
            
            # Base case: we found the leaf.
            if node.is_leaf() and node.value == value:
                return True

            # Recursive step: search in children.
            if node.left and dfs(node.left):
                # If path is down the left, the sibling is on the right.
                sibling_hash = node.right.compute_hash() if node.right else node.left.compute_hash()
                proof.append((sibling_hash, "right"))
                return True
                
            if node.right and dfs(node.right):
                # If path is down the right, the sibling is on the left.
                sibling_hash = node.left.compute_hash() if node.left else node.right.compute_hash()
                proof.append((sibling_hash, "left"))
                return True
                
            return False

        if not self.root:
            raise ValueError("Tree is empty")
        if not dfs(self.root):
            raise ValueError(f"Value '{value}' not found in tree")
        
        return proof

    @staticmethod
    def verify_proof(value: str, proof: List[Tuple[str, str]], root: str) -> bool:
        """Verifies a Merkle proof against a root hash."""
        # Start with the hash of the value we're proving.
        h = hash_leaf(value)
        
        # Iteratively hash with siblings up to the root.
        for sibling_hash, pos in proof:
            if pos == "left":
                # The sibling is on the left, so our current hash is the right part.
                h = hashlib.sha256((sibling_hash + h).encode()).hexdigest()
            else: # pos == "right"
                # The sibling is on the right, so our current hash is the left part.
                h = hashlib.sha256((h + sibling_hash).encode()).hexdigest()
        
        # The final computed hash must match the tree's root hash.
        return h == root



# ----------------------
# Extended Test Script
# ----------------------

"""
if __name__ == "__main__":
    import random
    import string

    def random_leaf(length=6):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    tree = IncrementalMerkleTree()

    # 1️⃣ Standard test leaves
    base_leaves = ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5", "another_leaf", "final_leaf"]
    
    # 2️⃣ Add leaves designed to share similar prefixes
    prefix_leaves = ["leafA", "leafB", "leafC", "leafD", "leafE"]

    # 3️⃣ Add random leaves
    random_leaves = [random_leaf() for _ in range(10)]

    # Combine all leaves
    leaves = base_leaves + prefix_leaves + random_leaves

    print("\n=== Inserting leaves ===")
    for i, leaf in enumerate(leaves):
        tree.insert(leaf)
        if (i+1) % 5 == 0 or i == len(leaves)-1:
            print(f"[{i+1}] Inserted '{leaf}', new root hash: {tree.get_root()}")

    print("\n=== Verifying all proofs ===")
    all_valid = True
    invalid_leaves = []
    for leaf in leaves:
        try:
            proof = tree.get_proof(leaf)
            is_valid = IncrementalMerkleTree.verify_proof(leaf, proof, tree.get_root())
            if not is_valid:
                invalid_leaves.append(leaf)
                all_valid = False
        except ValueError as e:
            invalid_leaves.append(leaf)
            all_valid = False

    if all_valid:
        print("✅ All leaf proofs verified successfully!")
    else:
        print(f"❌ Proofs failed for {len(invalid_leaves)} leaves: {invalid_leaves}")

    print("\n=== Test non-existent leaves ===")
    non_existent = ["ghost_leaf", "fake_leaf", random_leaf()]
    for leaf in non_existent:
        try:
            proof = tree.get_proof(leaf)
        except ValueError as e:
            print(f"Successfully caught error for '{leaf}': ✅")
            print(f"   Error message: {e}")

    print("\n=== Stress Test: 100 incremental leaves ===")
    stress_leaves = [f"stress_{i}" for i in range(1, 101)]
    for leaf in stress_leaves:
        tree.insert(leaf)

    # Verify first, middle, last
    stress_test_samples = [stress_leaves[0], stress_leaves[49], stress_leaves[-1]]
    for leaf in stress_test_samples:
        proof = tree.get_proof(leaf)
        is_valid = IncrementalMerkleTree.verify_proof(leaf, proof, tree.get_root())
        print(f"Stress test proof for '{leaf}': {'✅ Valid' if is_valid else '❌ INVALID'}")

"""