/**
 * Phase 0 Firestore Security Rules Test Suite Specification
 * Verifies that all "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on User Profile',
    collectionPath: 'users/u1',
    operation: 'create',
    auth: { uid: 'u1', email: 'reader@example.com', email_verified: true },
    payload: {
      uid: 'u1',
      displayName: 'Ada',
      photoURL: '',
      role: 'reader',
      status: 'active',
      preferredGenres: ['Romance'],
      readingTheme: 'light',
      isSuperAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Self-Assigned Admin Role by Regular Reader',
    collectionPath: 'users/u1',
    operation: 'create',
    auth: { uid: 'u1', email: 'reader@example.com', email_verified: true },
    payload: {
      uid: 'u1',
      displayName: 'Ada',
      photoURL: '',
      role: 'admin',
      status: 'active',
      preferredGenres: [],
      readingTheme: 'light',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Spoofing on Admin Action',
    collectionPath: 'genres/g1',
    operation: 'create',
    auth: { uid: 'spoof1', email: 'olurantiakin@gmail.com', email_verified: false },
    payload: {
      id: 'g1',
      name: 'Sci-Fi',
      slug: 'sci-fi',
      description: 'Science fiction',
      active: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-User PII Read Attempt',
    collectionPath: 'users/victim_uid/private/info',
    operation: 'get',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Path Variable ID Poisoning',
    collectionPath: 'books/invalid$id!@#',
    operation: 'create',
    auth: { uid: 'u1', email: 'author@example.com', email_verified: true },
    payload: { id: 'invalid$id!@#' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Negative Token Balance Injection',
    collectionPath: 'wallets/u1',
    operation: 'create',
    auth: { uid: 'u1', email: 'reader@example.com', email_verified: true },
    payload: {
      userId: 'u1',
      tokenBalance: -500,
      totalTokensPurchased: 0,
      totalTokensSpent: 0,
      authorEarningsTokens: 0,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Floating-Point Financial Mutation',
    collectionPath: 'transactions/tx1',
    operation: 'create',
    auth: { uid: 'u1', email: 'reader@example.com', email_verified: true },
    payload: {
      id: 'tx1',
      userId: 'u1',
      packageId: 'pkg1',
      paymentReference: 'ref_1',
      amountMinorUnits: 19.99,
      currency: 'USD',
      tokensPurchased: 100.5,
      paymentProvider: 'Paystack',
      status: 'completed',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Orphaned Book Creation Without Existing Author',
    collectionPath: 'books/b1',
    operation: 'create',
    auth: { uid: 'u1', email: 'author@example.com', email_verified: true },
    payload: {
      id: 'b1',
      authorId: 'non_existent_author',
      copyrightConfirmed: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unconfirmed Copyright Book Submission',
    collectionPath: 'books/b1',
    operation: 'create',
    auth: { uid: 'u1', email: 'author@example.com', email_verified: true },
    payload: {
      id: 'b1',
      authorId: 'u1',
      copyrightConfirmed: false,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable Transaction Modification',
    collectionPath: 'transactions/tx1',
    operation: 'update',
    auth: { uid: 'u1', email: 'reader@example.com', email_verified: true },
    payload: {
      tokensPurchased: 999999,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Terminal Withdrawal State Reversal',
    collectionPath: 'withdrawals/w1',
    operation: 'update',
    auth: { uid: 'u1', email: 'author@example.com', email_verified: true },
    payload: {
      status: 'pending',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unbounded Array Resource Exhaustion on Book Tags',
    collectionPath: 'books/b1',
    operation: 'create',
    auth: { uid: 'u1', email: 'author@example.com', email_verified: true },
    payload: {
      tags: Array.from({ length: 50 }, (_, i) => `tag_${i}`),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
