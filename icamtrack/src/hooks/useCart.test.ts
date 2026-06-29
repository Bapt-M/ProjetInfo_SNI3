import { act, renderHook } from '@testing-library/react'
import { useCart } from './useCart'
import type { Pack } from '../lib/types'

function eq(id: string, name: string, category_id: string) {
  return { id, name, category_id, serial_number: null, status: 'available' as const, notes: null, created_at: '' }
}

const arduinoPack: Pack = {
  id: 'pack-1',
  name: 'Pack Arduino',
  description: null,
  created_at: '',
  items: [
    { id: 'pi-1', pack_id: 'pack-1', equipment_id: 'eq-arduino', quantity: 1, equipment: eq('eq-arduino', 'Arduino Uno R3', 'cat-micro') },
    { id: 'pi-2', pack_id: 'pack-1', equipment_id: 'eq-breadboard', quantity: 2, equipment: eq('eq-breadboard', 'Breadboard 830 points', 'cat-conn') },
  ],
}

test('addItem shows the component name and merges by name', () => {
  const { result } = renderHook(() => useCart())
  act(() => result.current.addItem('Arduino Uno R3', 'cat-micro'))
  act(() => result.current.addItem('Arduino Uno R3', 'cat-micro'))
  expect(result.current.entries).toHaveLength(1)
  const entry = result.current.entries[0]
  expect(entry.kind).toBe('item')
  expect(entry).toMatchObject({ equipment_name: 'Arduino Uno R3', category_id: 'cat-micro', quantity: 2 })
  expect(result.current.totalItems).toBe(2)
})

test('different components stay on separate lines', () => {
  const { result } = renderHook(() => useCart())
  act(() => result.current.addItem('Arduino Uno R3', 'cat-micro'))
  act(() => result.current.addItem('ESP32', 'cat-micro'))
  expect(result.current.entries).toHaveLength(2)
  expect(result.current.entries.map(e => (e.kind === 'item' ? e.equipment_name : ''))).toEqual([
    'Arduino Uno R3',
    'ESP32',
  ])
})

test('addKit creates a kit sub-cart with its lines', () => {
  const { result } = renderHook(() => useCart())
  act(() => result.current.addKit(arduinoPack))
  expect(result.current.entries).toHaveLength(1)
  const kit = result.current.entries[0]
  expect(kit.kind).toBe('kit')
  if (kit.kind !== 'kit') throw new Error('expected kit')
  expect(kit.pack_id).toBe('pack-1')
  expect(kit.lines).toEqual([
    { equipment_id: 'eq-arduino', equipment_name: 'Arduino Uno R3', category_id: 'cat-micro', quantity: 1 },
    { equipment_id: 'eq-breadboard', equipment_name: 'Breadboard 830 points', category_id: 'cat-conn', quantity: 2 },
  ])
  expect(result.current.totalItems).toBe(3)
})

test('adding the same kit twice increments the existing sub-cart', () => {
  const { result } = renderHook(() => useCart())
  act(() => result.current.addKit(arduinoPack))
  act(() => result.current.addKit(arduinoPack))
  expect(result.current.entries).toHaveLength(1)
  const kit = result.current.entries[0]
  if (kit.kind !== 'kit') throw new Error('expected kit')
  expect(kit.lines.map(l => l.quantity)).toEqual([2, 4])
  expect(result.current.totalItems).toBe(6)
})

test('removeKitLine drops the line, and removes the kit when empty', () => {
  const { result } = renderHook(() => useCart())
  act(() => result.current.addKit(arduinoPack))
  act(() => result.current.removeKitLine('pack-1', 'eq-arduino'))
  const kit = result.current.entries[0]
  if (kit.kind !== 'kit') throw new Error('expected kit')
  expect(kit.lines).toHaveLength(1)
  act(() => result.current.removeKitLine('pack-1', 'eq-breadboard'))
  expect(result.current.entries).toHaveLength(0)
})

test('changeKitLineQty respects a minimum of 1', () => {
  const { result } = renderHook(() => useCart())
  act(() => result.current.addKit(arduinoPack))
  act(() => result.current.changeKitLineQty('pack-1', 'eq-arduino', -5))
  const kit = result.current.entries[0]
  if (kit.kind !== 'kit') throw new Error('expected kit')
  expect(kit.lines.find(l => l.equipment_id === 'eq-arduino')?.quantity).toBe(1)
})

test('flatten aggregates kit lines and standalone items by category', () => {
  const { result } = renderHook(() => useCart())
  act(() => result.current.addKit(arduinoPack))           // micro 1, conn 2
  act(() => result.current.addItem('Câble Dupont', 'cat-conn')) // conn +1
  const flat = result.current.flatten()
  expect(flat).toEqual(
    expect.arrayContaining([
      { category_id: 'cat-micro', quantity: 1 },
      { category_id: 'cat-conn', quantity: 3 },
    ])
  )
  expect(flat).toHaveLength(2)
})
