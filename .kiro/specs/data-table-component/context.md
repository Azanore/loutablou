# Data Table Component — Context

## What We Are Building

A high-end, reusable data table component for dashboard power users, built on a fresh Vite + React + TypeScript project.

## Phase 1 Scope (Structural Foundation)

Scaffold the project and implement the core table structure:
- Column schema definition and normalization
- Row identity resolution (id field or injected `_tableRowId`)
- Density system (compact / default / comfortable) with CSS tokens
- Column visibility management
- Table shell, header, body, row, and empty state rendering
- Density toggle and column visibility panel controls
- Mock data generator (500 rows, 8 columns, deterministic seed)
- App entry point wiring everything together

## Locked Architectural Decisions

- Hybrid state ownership: table manages internal state, parent can override via value + onChange
- Row identity: `id` field expected; silently injects `_tableRowId` (index) if absent
- Reorder + active sort: dragging clears the sort
- Export + pagination: always export all filtered rows
- Expanded + selected row: coexist as independent state dimensions
- Aggregate footer + pagination: footer reflects full filtered dataset totals
- Schema change + persistent preferences: drop unknown keys, keep the rest

## Tech Stack

Vite + React + TypeScript + Tailwind CSS + PostCSS + Autoprefixer

## Current Status

Requirements document created. Awaiting design and task phases.
