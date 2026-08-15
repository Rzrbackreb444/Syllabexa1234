# Security Specification & Test-Driven Design (TDD) for Syllabexa

## 1. Data Invariants

1. **Owner-Exclusive Read/Write**: No user may read, list, create, update, or delete any user preferences, books, chapters, story bibles, comments, or snapshots unless they are authenticated and their `uid` exactly matches the `{userId}` path variable.
2. **Strict Document ID Formats**: All document and subcollection IDs (including `{userId}`, `{bookId}`, `{chapterId}`, etc.) must be strings matching `^[a-zA-Z0-9_\-]+$` and under 128 characters.
3. **Temporal Integrity**: Create and update actions must strictly validate timestamps using `request.time`. Clients cannot fake history.
4. **No Privilege Escalation / Self-Roles**: Role modifications are forbidden.
5. **Terminal State Locking**: Resolved comments cannot have their text altered.

---

## 2. The "Dirty Dozen" Payloads (Malicious Writes Rejected by Rules)

The following payloads attempt to bypass identity constraints, schema types, or structural boundaries. Our rules MUST reject all of them with `PERMISSION_DENIED`.

1. **Payload 1: Identity Spoofing (Write to another user's profile)**
   * Action: `create` or `set` `/users/victim_user_123`
   * Actor: `attacker_user_456`
   * Reason: Authenticated UID does not match the `{userId}` path.

2. **Payload 2: Missing Required Fields in Profile**
   * Action: `create` `/users/attacker_user_456`
   * Payload: `{ theme: "dark" }` (Missing `wordGoal`, `updatedAt`)
   * Reason: Fails the exact-key verification of `UserProfile`.

3. **Payload 3: Out-of-Bounds Enum Value**
   * Action: `create` `/users/attacker_user_456`
   * Payload: `{ theme: "neon-glow-pink", wordGoal: 1000, updatedAt: request.time }`
   * Reason: `theme` must be one of `light`, `dark`, or `sepia`.

4. **Payload 4: Denial of Wallet via ID Poisoning**
   * Action: `create` `/users/attacker_user_456/books/VERY_LONG_ID_JUNK_REPEATED_1000_TIMES_ABC_DEF`
   * Reason: Book ID fails the size limitation and pattern validation of `isValidId()`.

5. **Payload 5: Unauthorized Cross-User Read/Query**
   * Action: `list` `/users/victim_user_123/books`
   * Actor: `attacker_user_456`
   * Reason: Cannot read or query other users' books.

6. **Payload 6: Client-Provided Timestamp Injection**
   * Action: `create` `/users/attacker_user_456/books/book_789`
   * Payload: `{ userId: "attacker_user_456", title: "My Book", author: "Attacker", updatedAt: "2010-01-01T12:00:00Z" }`
   * Reason: `updatedAt` must match `request.time`.

7. **Payload 7: Key Injection / Shadow Fields on Book Create**
   * Action: `create` `/users/attacker_user_456/books/book_789`
   * Payload: `{ userId: "attacker_user_456", title: "My Book", author: "Attacker", updatedAt: request.time, adminOverride: true }`
   * Reason: Key size is 5, but exact-key size check is 4.

8. **Payload 8: Path Manipulation / Directory Traversal**
   * Action: `create` `/users/attacker_user_456/books/../victim_user_123/books/victim_book`
   * Reason: Invalid path characters in ID.

9. **Payload 9: Empty or Malformed Chapters**
   * Action: `create` `/users/attacker_user_456/books/book_789/chapters/ch_1`
   * Payload: `{ id: "", title: "", content: "" }`
   * Reason: Empty ID or title is invalid.

10. **Payload 10: Unauthorized Snapshot Access**
    * Action: `create` `/users/victim_user_123/books/book_789/snapshots/snap_1`
    * Actor: `attacker_user_456`
    * Reason: Attacker is not the owner of the victim's book tree.

11. **Payload 11: Attempt to modify immutable `userId` field on Book Update**
    * Action: `update` `/users/attacker_user_456/books/book_789`
    * Payload: `{ userId: "victim_user_123", title: "New Title", author: "Attacker", updatedAt: request.time }`
    * Reason: Changing owner userId is forbidden.

12. **Payload 12: Super-sized input injection (Denial of Wallet)**
    * Action: `create` `/users/attacker_user_456`
    * Payload: `{ theme: "dark", wordGoal: 1000, updatedAt: request.time, maliciousBlob: "A".repeat(50000) }`
    * Reason: Schema constraints and exact size matching reject shadow/unsupported fields.

---

## 3. The Test Runner Structure

A conceptual test suite that would programmatically run and assert `PERMISSION_DENIED` on all twelve payloads above.
This ensures our implementation of `firestore.rules` is impenetrable.
