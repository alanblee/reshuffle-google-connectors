import { GoogleSpreadsheetCell } from 'google-spreadsheet'
import deepEqual from 'deep-equal'

interface GoogleSpreadsheetRowData {
  rowIndex: number
  columnIndex: number
  a1Row: number
  a1Column: string
  a1Address: string
  value: string | number | boolean
}

export const extractCellData = (
  cell?: GoogleSpreadsheetCell,
): GoogleSpreadsheetRowData | undefined =>
  cell
    ? {
        value: cell.value,
        rowIndex: cell.rowIndex,
        columnIndex: cell.columnIndex,
        a1Row: cell.a1Row,
        a1Column: cell.a1Column,
        a1Address: cell.a1Address,
      }
    : undefined

export function detectChangesInSheet(prev: RawWorkSheet[], curr: RawWorkSheet[]): SheetChanges {
  const changes: SheetChanges = {
    worksheetsRemoved: [],
    worksheetsAdded: [],
    worksheetsChanged: [],
  }

  if (curr.length > prev.length) {
    changes.worksheetsAdded = curr.slice(prev.length)
  } else if (curr.length < prev.length) {
    changes.worksheetsRemoved = prev.slice(curr.length)
  }
  const commonWorksheets = Math.min(prev.length, curr.length)
  for (let i = 0; i < commonWorksheets; i++) {
    const worksheetChanges = detectChangesInWorksheet(prev[i], curr[i])
    if (worksheetChanges) {
      changes.worksheetsChanged.push(worksheetChanges)
    }
  }
  return changes
}

export function detectChangesInWorksheet(
  prevRaw: RawWorkSheet,
  currRaw: RawWorkSheet,
): WorkSheetChanges | undefined {
  const prev = prevRaw.rows
  const curr = currRaw.rows
  const changes: WorkSheetChanges = {
    worksheetId: currRaw.worksheetId,
    rowsRemoved: [],
    rowsAdded: [],
    rowsChanged: [],
  }
  if (curr.length > prev.length) {
    changes.rowsAdded = curr.slice(prev.length)
  } else if (curr.length < prev.length) {
    changes.rowsRemoved = prev.slice(curr.length)
  }
  const commonRows = Math.min(prev.length, curr.length)
  for (let i = 0; i < commonRows; i++) {
    const rowChanges = detectChangesRow(prev[i], curr[i])
    if (rowChanges) {
      changes.rowsChanged.push(rowChanges)
    }
  }
  return changes
}

export const detectChangesRow = (prev: any, curr: any) =>
  deepEqual(prev, curr) ? undefined : { prev, curr }

export interface GoogleSheetsSnapshot {
  _id: string // equivalent to Trigger.toKey
  json: string // JSON of google sheet value (limited to document size of 16M)
}

// Map from script.name -> Sheet
export interface SheetChanges {
  worksheetsRemoved: RawWorkSheet[]
  worksheetsAdded: RawWorkSheet[]
  worksheetsChanged: WorkSheetChanges[]
}

export interface WorkSheetChanges {
  worksheetId: string
  rowsRemoved: any[]
  rowsAdded: any[]
  rowsChanged: RowChange[]
}

export interface RowChange {
  prev: any
  curr: any
}

export interface RawWorkSheet {
  worksheetId: string
  rows: any[]
}
