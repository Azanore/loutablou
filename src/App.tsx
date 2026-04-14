// Purpose: App entry point — wires DataTable with mock data and column definitions.
// Related: src/main.tsx, src/data/mock-data.json, src/types/table.ts,
//          src/components/DataTable/DataTable.tsx
// Must not include: DataTable implementation details.

import mockData from './data/mock-data.json'
import type { ColumnDef, RowData } from './types/table'
import { DataTable } from './components/DataTable/DataTable'

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'id',          label: 'ID',          type: 'integer',   nullable: false, visible: true, width: 130, sortable: true,  filterable: true  },
  { key: 'name',        label: 'Name',        type: 'text',      nullable: false, visible: true, width: 180, sortable: true,  filterable: true  },
  { key: 'status',      label: 'Status',      type: 'enum',      nullable: false, visible: true, width: 120, sortable: true,  filterable: true,  enumValues: ['active', 'inactive', 'pending', 'archived'] },
  { key: 'tier',        label: 'Tier',        type: 'enum',      nullable: false, visible: true, width: 110, sortable: true,  filterable: true,  enumValues: ['free', 'pro', 'enterprise'] },
  { key: 'department',  label: 'Department',  type: 'text',      nullable: false, visible: true, width: 140, sortable: true,  filterable: true  },
  { key: 'score',       label: 'Score',       type: 'float',     nullable: false, visible: true, width: 130, sortable: true,  filterable: true  },
  { key: 'revenue',     label: 'Revenue',     type: 'float',     nullable: false, visible: true, width: 130, sortable: true,  filterable: true  },
  { key: 'sessions',    label: 'Sessions',    type: 'integer',   nullable: false, visible: true, width: 130, sortable: true,  filterable: true  },
  { key: 'age',         label: 'Age',         type: 'integer',   nullable: false, visible: true, width: 130, sortable: true,  filterable: true  },
  { key: 'country',     label: 'Country',     type: 'text',      nullable: false, visible: true, width: 150, sortable: true,  filterable: true  },
  { key: 'city',        label: 'City',        type: 'text',      nullable: false, visible: true, width: 130, sortable: true,  filterable: true  },
  { key: 'is_verified', label: 'Verified',    type: 'boolean',   nullable: false, visible: true, width: 90,  sortable: true,  filterable: true  },
  { key: 'created_at',  label: 'Created At',  type: 'timestamp', nullable: false, visible: true, width: 170, sortable: true,  filterable: false },
  { key: 'last_login',  label: 'Last Login',  type: 'timestamp', nullable: false, visible: true, width: 170, sortable: true,  filterable: false },
  { key: 'notes',       label: 'Notes',       type: 'text',      nullable: true,  visible: true, width: 200, sortable: false, filterable: true  },
]

export default function App() {
  return (
    <div className="min-h-screen bg-canvas">
      <DataTable
        columnDefs={COLUMN_DEFS}
        rowData={mockData as RowData[]}
        defaultDensity="default"
      />
    </div>
  )
}
