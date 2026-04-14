// Purpose: Visual stress-test data generator for the data table component.
// Every row is intentional — no filler. Tests rendering combinations across all columns.
// Related files: src/data/mock-data.json, src/types/table.ts
// Must not include: React or any browser APIs.

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

const OUTPUT_PATH = resolve('src/data/mock-data.json')

interface MockRow {
  id: number | string
  name: string | null
  status: string | null
  score: number | null
  created_at: string | null
  is_verified: boolean | null
  country: string | null
  revenue: number | null
  department: string | null
  city: string | null
  tier: string | null
  age: number | null
  sessions: number | null
  last_login: string | null
  notes: string | null
}

// Visually "full" baseline — every cell has a real, mid-length value.
const BASE: Omit<MockRow, 'id' | 'notes'> = {
  name:        'Jordan Mitchell',
  status:      'active',
  score:       72.5,
  created_at:  '2023-06-15T12:00:00.000Z',
  is_verified: true,
  country:     'United States',
  revenue:     487320.50,
  department:  'Engineering',
  city:        'San Francisco',
  tier:        'pro',
  age:         34,
  sessions:    312,
  last_login:  '2025-01-14T08:22:00.000Z',
}

let _id = 100_043
const nextId = () => { _id += 1 + Math.floor(Math.random() * 11); return _id }

const rows: MockRow[] = [

  // ---------------------------------------------------------------------------
  // SECTION 1 — SINGLE NULL PER COLUMN
  // One row per nullable field. Verifies — renders correctly in that column's
  // specific alignment: right (numbers), center (boolean/enum/date), left (text).
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), name: null,        notes: 'null: name (left-aligned —)' },
  { ...BASE, id: nextId(), status: null,      notes: 'null: status (center-aligned —)' },
  { ...BASE, id: nextId(), score: null,       notes: 'null: score (right-aligned —)' },
  { ...BASE, id: nextId(), revenue: null,     notes: 'null: revenue (right-aligned —)' },
  { ...BASE, id: nextId(), sessions: null,    notes: 'null: sessions (right-aligned —)' },
  { ...BASE, id: nextId(), age: null,         notes: 'null: age (right-aligned —)' },
  { ...BASE, id: nextId(), is_verified: null, notes: 'null: is_verified (center-aligned —)' },
  { ...BASE, id: nextId(), country: null,     notes: 'null: country (left-aligned —)' },
  { ...BASE, id: nextId(), city: null,        notes: 'null: city (left-aligned —)' },
  { ...BASE, id: nextId(), department: null,  notes: 'null: department (left-aligned —)' },
  { ...BASE, id: nextId(), tier: null,        notes: 'null: tier (center-aligned —)' },
  { ...BASE, id: nextId(), created_at: null,  notes: 'null: created_at (center-aligned —)' },
  { ...BASE, id: nextId(), last_login: null,  notes: 'null: last_login (center-aligned —)' },
  { ...BASE, id: nextId(), notes: null },

  // ---------------------------------------------------------------------------
  // SECTION 2 — EMPTY STRING
  // Empty string must render as — not as an invisible blank gap.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), name: '',       notes: 'empty string: name → must show —' },
  { ...BASE, id: nextId(), country: '',    notes: 'empty string: country → must show —' },
  { ...BASE, id: nextId(), city: '',       notes: 'empty string: city → must show —' },
  { ...BASE, id: nextId(), department: '', notes: 'empty string: department → must show —' },
  { ...BASE, id: nextId(), notes: '' },

  // ---------------------------------------------------------------------------
  // SECTION 3 — ALL NULLS / ALL EMPTY
  // Every cell shows — simultaneously. Tests the full row visual rhythm.
  // ---------------------------------------------------------------------------
  {
    id: nextId(),
    name: null, status: null, score: null, created_at: null,
    is_verified: null, country: null, revenue: null, department: null,
    city: null, tier: null, age: null, sessions: null,
    last_login: null, notes: 'all fields null — full row of —',
  },
  {
    id: nextId(),
    name: '', status: null, score: null, created_at: null,
    is_verified: null, country: '', revenue: null, department: '',
    city: '', tier: null, age: null, sessions: null,
    last_login: null, notes: 'mix of null + empty string — all → —',
  },

  // ---------------------------------------------------------------------------
  // SECTION 4 — TEXT OVERFLOW: MULTI-WORD (can wrap)
  // Long strings with spaces. Tests row height stability and clip vs wrap.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), name: 'Sir Reginald Bartholomew Featherstonehaugh-Smythe III',    notes: 'long name with spaces' },
  { ...BASE, id: nextId(), name: 'María de los Ángeles Rodríguez-Fernández de la Vega',      notes: 'long accented name with spaces' },
  { ...BASE, id: nextId(), city: 'Greater Metropolitan Area of the Eastern Seaboard',        notes: 'long city with spaces' },
  { ...BASE, id: nextId(), country: 'Democratic Republic of the Congo',                      notes: 'long country name' },
  { ...BASE, id: nextId(), department: 'Global Strategic Partnerships and Alliances Division', notes: 'long department name' },
  { ...BASE, id: nextId(), notes: 'This is a very long note that goes on and on and keeps going well past the column width to test whether the notes cell clips, wraps, or overflows the table layout entirely.' },

  // ---------------------------------------------------------------------------
  // SECTION 5 — TEXT OVERFLOW: SINGLE WORD (cannot wrap)
  // No spaces = hard overflow. Worst case for fixed-width columns.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), name: 'Supercalifragilisticexpialidocious',                            notes: 'single long word in name — no wrap' },
  { ...BASE, id: nextId(), city: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',    notes: 'Welsh town — longest single-word city' },
  { ...BASE, id: nextId(), department: 'Electroencephalographyresearchdivision',                  notes: 'single long word in department' },
  { ...BASE, id: nextId(), country: 'Superlongcountrywithnospaces',                               notes: 'single long word in country' },
  { ...BASE, id: nextId(), notes: 'Pneumonoultramicroscopicsilicovolcanoconiosis' },
  { ...BASE, id: nextId(), notes: 'A'.repeat(200) },

  // ---------------------------------------------------------------------------
  // SECTION 6 — FLOAT PRECISION
  // formatCellValue uses String(value) for floats — renders full precision.
  // Tests overflow in right-aligned narrow columns.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), score: 3.141592653589793,  notes: 'float: π — many decimals in score cell' },
  { ...BASE, id: nextId(), score: 99.99999999999999,  notes: 'float: near-100 with precision loss' },
  { ...BASE, id: nextId(), score: 0.1,                notes: 'float: 0.1 — minimal display' },
  { ...BASE, id: nextId(), score: 0,                  notes: 'float: 0 — looks like missing data?' },
  { ...BASE, id: nextId(), score: 100,                notes: 'float: 100 — max, 3 chars' },
  { ...BASE, id: nextId(), revenue: 1234567.891011,   notes: 'float: revenue with many decimals — wide number' },
  { ...BASE, id: nextId(), revenue: 0.01,             notes: 'float: near-zero revenue' },
  { ...BASE, id: nextId(), revenue: 999999.99,        notes: 'float: max revenue — 9 chars' },
  { ...BASE, id: nextId(), revenue: 0,                notes: 'float: revenue = 0' },

  // ---------------------------------------------------------------------------
  // SECTION 7 — INTEGER DISPLAY
  // Tests right-alignment at various digit widths in narrow columns.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), sessions: 0,     notes: 'integer: sessions = 0' },
  { ...BASE, id: nextId(), sessions: 1,     notes: 'integer: sessions = 1 — single digit' },
  { ...BASE, id: nextId(), sessions: 9999,  notes: 'integer: sessions = 9999 — 4 digits' },
  { ...BASE, id: nextId(), age: 18,         notes: 'integer: min age' },
  { ...BASE, id: nextId(), age: 72,         notes: 'integer: max age' },

  // ---------------------------------------------------------------------------
  // SECTION 8 — ID COLUMN WIDTH
  // ID column is 130px. Tests whether large IDs overflow it.
  // ---------------------------------------------------------------------------
  { ...BASE, id: 1,          notes: 'id: 1 — single digit' },
  { ...BASE, id: 99,         notes: 'id: 99 — 2 digits' },
  { ...BASE, id: 999,        notes: 'id: 999 — 3 digits' },
  { ...BASE, id: 99999,      notes: 'id: 99999 — 5 digits' },
  { ...BASE, id: 9999999,    notes: 'id: 9999999 — 7 digits' },
  { ...BASE, id: 2147483647, notes: 'id: MAX_INT32 — 10 digits' },

  // ---------------------------------------------------------------------------
  // SECTION 9 — DATE / TIMESTAMP DISPLAY
  // toLocaleDateString() length varies by locale. Tests center-alignment in fixed cols.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), created_at: '1970-01-01T00:00:00.000Z',                                                    notes: 'date: epoch — year 1970' },
  { ...BASE, id: nextId(), created_at: '2020-01-01T00:00:00.000Z',                                                    notes: 'date: Jan 1 2020 — short locale string' },
  { ...BASE, id: nextId(), created_at: '2099-12-31T23:59:59.999Z',                                                    notes: 'date: far future — year 2099' },
  { ...BASE, id: nextId(), created_at: '2023-11-30T23:59:59.000Z', last_login: '2023-11-30T23:59:59.000Z',            notes: 'date: created_at === last_login — identical values' },
  { ...BASE, id: nextId(), last_login: '2099-12-31T23:59:59.999Z',                                                    notes: 'date: far future last_login' },
  { ...BASE, id: nextId(), created_at: '2023-06-15',                                                                  notes: 'date: date-only string (no time component)' },

  // ---------------------------------------------------------------------------
  // SECTION 10 — BOOLEAN DISPLAY
  // Only "Yes", "No", or "—". Tests center-alignment in 90px column.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), is_verified: true,  notes: 'boolean: true → "Yes" in 90px col' },
  { ...BASE, id: nextId(), is_verified: false, notes: 'boolean: false → "No" in 90px col' },

  // ---------------------------------------------------------------------------
  // SECTION 11 — ENUM: UNKNOWN VALUES
  // Unknown values render as raw strings. Tests overflow in center-aligned cells.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), status: 'suspended',                  notes: 'enum: unknown status "suspended"' },
  { ...BASE, id: nextId(), status: 'deactivated_by_admin',       notes: 'enum: long unknown status — overflow risk' },
  { ...BASE, id: nextId(), status: 'ACTIVE',                     notes: 'enum: wrong case "ACTIVE" vs "active"' },
  { ...BASE, id: nextId(), tier: 'platinum',                     notes: 'enum: unknown tier "platinum"' },
  { ...BASE, id: nextId(), tier: 'enterprise_annual_commitment', notes: 'enum: very long unknown tier value' },

  // ---------------------------------------------------------------------------
  // SECTION 12 — UNICODE & INTERNATIONAL
  // Font fallback, RTL direction, CJK double-width chars, emoji sizing.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), name: 'Ångström Ñoño',                 notes: 'unicode: accented latin' },
  { ...BASE, id: nextId(), name: '山田 太郎',                      notes: 'unicode: CJK — double-width chars' },
  { ...BASE, id: nextId(), name: 'Αλέξανδρος Παπαδόπουλος',       notes: 'unicode: Greek — long name' },
  { ...BASE, id: nextId(), name: 'محمد علي',                      notes: 'unicode: Arabic RTL in LTR cell' },
  { ...BASE, id: nextId(), name: 'עמנואל גולדברג',                notes: 'unicode: Hebrew RTL in LTR cell' },
  { ...BASE, id: nextId(), name: '😀🎉🔥💯🚀',                    notes: 'unicode: emojis — sizing + baseline' },
  { ...BASE, id: nextId(), name: '🧑‍💻 Dev Person',                notes: 'unicode: ZWJ emoji sequence' },
  { ...BASE, id: nextId(), city: '東京',                           notes: 'unicode: CJK city name' },
  { ...BASE, id: nextId(), city: 'Ñoño',                          notes: 'unicode: accented city' },
  { ...BASE, id: nextId(), country: 'Ελλάδα',                     notes: 'unicode: Greek country name' },
  { ...BASE, id: nextId(), notes: '日本語のメモ — テスト中です。長いテキストがどう表示されるか確認。' },

  // ---------------------------------------------------------------------------
  // SECTION 13 — WHITESPACE
  // Whitespace-only must render as — not as invisible blank cells.
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), name: '   ',         notes: 'whitespace-only name — must show —' },
  { ...BASE, id: nextId(), name: '\t\t\t',      notes: 'tab-only name — must show —' },
  { ...BASE, id: nextId(), name: 'First  Last', notes: 'double space in name — renders as-is' },
  { ...BASE, id: nextId(), notes: '   ' },

  // ---------------------------------------------------------------------------
  // SECTION 14 — COMBINATION STRESS ROWS
  // Multiple visual extremes in the same row simultaneously.
  // ---------------------------------------------------------------------------

  // Max everything — every cell at its widest realistic value
  {
    id: nextId(),
    name:        'Bartholomew Richardson-Featherstonehaugh',
    status:      'archived',
    score:       99.99999999999999,
    created_at:  '2099-12-31T23:59:59.999Z',
    is_verified: false,
    country:     'Democratic Republic of the Congo',
    revenue:     999999.99,
    department:  'Global Strategic Partnerships and Alliances',
    city:        'Greater Metropolitan Area of the Eastern Seaboard',
    tier:        'enterprise',
    age:         72,
    sessions:    9999,
    last_login:  '2099-12-31T23:59:59.999Z',
    notes:       'max-width row — every cell at realistic maximum simultaneously',
  },

  // Min everything — every cell at its shortest value
  {
    id: nextId(),
    name:        'Al Li',
    status:      'free' as unknown as string,
    score:       1,
    created_at:  '2025-01-01T00:00:00.000Z',
    is_verified: true,
    country:     'UAE',
    revenue:     0.01,
    department:  'HR',
    city:        'Lima',
    tier:        'free',
    age:         18,
    sessions:    1,
    last_login:  '2025-01-01T00:00:00.000Z',
    notes:       'min-width row — every cell at shortest realistic value',
  },

  // Long text + nulls mixed — some cells overflow, others show —
  {
    id: nextId(),
    name:        'Sir Reginald Bartholomew Featherstonehaugh-Smythe III',
    status:      null,
    score:       null,
    created_at:  '2099-12-31T23:59:59.999Z',
    is_verified: null,
    country:     'Democratic Republic of the Congo',
    revenue:     null,
    department:  null,
    city:        'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
    tier:        null,
    age:         null,
    sessions:    null,
    last_login:  null,
    notes:       'combo: long text + nulls — overflow cells next to — cells',
  },

  // Unicode + extreme numbers
  {
    id: nextId(),
    name:        '山田 太郎',
    status:      'active',
    score:       3.141592653589793,
    created_at:  '1970-01-01T00:00:00.000Z',
    is_verified: false,
    country:     'Ελλάδα',
    revenue:     1234567.891011,
    department:  'Electroencephalographyresearchdivision',
    city:        '東京',
    tier:        'enterprise_annual_commitment',
    age:         18,
    sessions:    9999,
    last_login:  '2099-12-31T23:59:59.999Z',
    notes:       'combo: unicode + float precision + unknown enum + far-future date',
  },

  // RTL names + all numeric extremes
  {
    id: nextId(),
    name:        'محمد علي',
    status:      'deactivated_by_admin',
    score:       0,
    created_at:  '2023-11-30T23:59:59.000Z',
    is_verified: true,
    country:     'Saudi Arabia',
    revenue:     0,
    department:  'HR',
    city:        'Riyadh',
    tier:        'free',
    age:         72,
    sessions:    0,
    last_login:  '2023-11-30T23:59:59.000Z',
    notes:       'combo: RTL name + zero numerics + unknown enum',
  },

  // Emojis + long notes + unknown enum
  {
    id: nextId(),
    name:        '😀🎉🔥💯🚀🧑‍💻',
    status:      'suspended',
    score:       99.99,
    created_at:  '2020-01-01T00:00:00.000Z',
    is_verified: true,
    country:     'Singapore',
    revenue:     999999.99,
    department:  'Design',
    city:        'Singapore',
    tier:        'platinum',
    age:         25,
    sessions:    9999,
    last_login:  '2025-03-31T23:59:59.000Z',
    notes:       'combo: emoji name + unknown enum + max numbers + long note that keeps going to test the notes column overflow behavior in all density modes',
  },

  // Single-word overflow in multiple columns at once
  {
    id: nextId(),
    name:        'Supercalifragilisticexpialidocious',
    status:      'active',
    score:       50,
    created_at:  '2023-01-01T00:00:00.000Z',
    is_verified: true,
    country:     'Superlongcountrywithnospaces',
    revenue:     500000,
    department:  'Electroencephalographyresearchdivision',
    city:        'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
    tier:        'pro',
    age:         30,
    sessions:    100,
    last_login:  '2024-06-01T00:00:00.000Z',
    notes:       'combo: single-word overflow in name + country + department + city simultaneously',
  },

  // All booleans false + all nulls in numeric cols
  {
    id: nextId(),
    name:        'Zero Row',
    status:      'inactive',
    score:       null,
    created_at:  '2022-02-02T02:02:02.000Z',
    is_verified: false,
    country:     'Norway',
    revenue:     null,
    department:  'Finance',
    city:        'Oslo',
    tier:        'free',
    age:         null,
    sessions:    null,
    last_login:  null,
    notes:       'combo: boolean false + null numerics + null dates',
  },

  // ---------------------------------------------------------------------------
  // SECTION 15 — NOTES COLUMN STRESS (200px — most overflow-prone)
  // ---------------------------------------------------------------------------
  { ...BASE, id: nextId(), notes: 'word '.repeat(40).trim() },
  { ...BASE, id: nextId(), notes: 'VeryLongWordWithNoSpacesThatWillDefinitelyOverflowTheNotesColumnWidth'.repeat(3) },
  { ...BASE, id: nextId(), notes: '🔥'.repeat(50) },
  { ...BASE, id: nextId(), notes: '日本語テキスト。'.repeat(10) },
]

mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
writeFileSync(OUTPUT_PATH, JSON.stringify(rows, null, 2))
console.log(`Generated ${rows.length} rows → ${OUTPUT_PATH}`)
