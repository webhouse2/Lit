# LitVault Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **PII Isolation**: User email addresses are stored exclusively in `/users/{userId}/private/{docId}` and never exposed in `/users/{userId}`. Only the owner (`request.auth.uid == userId`) or an administrator can read `/users/{userId}/private/{docId}`.
2. **Privilege Escalation Prevention**: Users cannot self-assign `role: 'admin'` on `/users/{userId}` creation unless they are a verified admin (`isAdmin()`). During updates, users cannot alter `uid`, `role`, `status`, or `createdAt`.
3. **Author Identity Integrity**: An `/authors/{authorId}` record must have `userId == request.auth.uid`, `copyrightAgreed == true`, and must reference an existing user document.
4. **Book & Chapter Relational Integrity**: A book or chapter write by an author requires `exists(/databases/$(database)/documents/authors/$(incoming().authorId))` and ownership verification, plus `copyrightConfirmed == true`.
5. **Financial & Ledger Immutability**: `/transactions/{transactionId}`, `/bookUnlocks/{unlockId}`, `/authorEarnings/{earningId}`, and `/auditLogs/{logId}` are append-only immutable ledgers (updates and deletes are denied to non-admins). All token amounts must be non-negative integers (`is int && >= 0`).
6. **Temporal Integrity**: All `createdAt` (on create) and `updatedAt` (on create/update) fields must equal `request.time`.
7. **Path Variable Hardening**: Every single-document target rule validates `isValidId(docId)` (`^[a-zA-Z0-9_\-]+$`, `<= 128` chars).
8. **Secure List Queries**: Private user collections (`bookmarks`, `readingProgress`, `libraries`, `transactions`, `bookUnlocks`, `notifications`) enforce `resource.data.userId == request.auth.uid || isAdmin()` on `allow list`.

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on User Profile (`users/u1`)**:
   `{ "uid": "u1", "displayName": "Ada", "photoURL": "", "role": "reader", "status": "active", "preferredGenres": ["Romance"], "readingTheme": "light", "isSuperAdmin": true }` -> Rejected by `hasOnly()`.
2. **Self-Assigned Admin Role (`users/u1`)**:
   `{ "uid": "u1", "displayName": "Ada", "photoURL": "", "role": "admin", "status": "active", "preferredGenres": [], "readingTheme": "light" }` (by non-admin) -> Rejected by role check.
3. **Unverified Email Spoofing on Admin Check**:
   Auth token with `email: "olurantiakin@gmail.com"` and `email_verified: false` attempting to write `/genres/g1` -> Rejected by `request.auth.token.email_verified == true`.
4. **Cross-User PII Read (`users/victim/private/info`)**:
   Authenticated attacker `attacker_uid` calling `get` on `/users/victim/private/info` -> Rejected by `isOwner(userId) || isAdmin()`.
5. **Path ID Poisoning (`books/invalid$id!@#`)**:
   Creating a book with non-alphanumeric characters or >128 chars in `{bookId}` -> Rejected by `isValidId(bookId)`.
6. **Negative Token Balance Injection (`wallets/u1`)**:
   `{ "userId": "u1", "tokenBalance": -500, "totalTokensPurchased": 0, "totalTokensSpent": 0, "authorEarningsTokens": 0 }` -> Rejected by `tokenBalance >= 0`.
7. **Floating-Point Financial Mutation (`transactions/tx1`)**:
   `{ "amountMinorUnits": 19.99, "tokensPurchased": 100.5 }` -> Rejected by `is int` constraint.
8. **Orphaned Book Creation (`books/b1`)**:
   Creating a book where `authorId` does not exist in `/authors/{authorId}` -> Rejected by `exists(...)`.
9. **Unconfirmed Copyright Submission (`books/b1`)**:
   Creating a book with `copyrightConfirmed: false` -> Rejected by `data.copyrightConfirmed == true`.
10. **Immutable Transaction Tampering (`transactions/tx1`)**:
    Updating `tokensPurchased` on an existing transaction -> Rejected because `allow update: if false;`.
11. **Terminal Withdrawal State Reversal (`withdrawals/w1`)**:
    Updating a withdrawal whose existing `status` is `'paid'` or `'rejected'` (by non-admin) -> Rejected by terminal state lock.
12. **Unbounded Array Resource Exhaustion (`books/b1`)**:
    Passing 50 elements in `tags` array -> Rejected by `data.tags.size() <= 10`.
