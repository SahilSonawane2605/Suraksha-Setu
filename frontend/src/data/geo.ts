// Simplified mock geometries for map overlays. Not surveyed data — for visualization only.

export const floodZones: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: 'FZ-1',
    name: 'Kendrapara Delta Flood Zone',
    coords: [
      [20.62, 86.28], [20.66, 86.55], [20.48, 86.62], [20.38, 86.44], [20.46, 86.24],
    ],
  },
  {
    id: 'FZ-2',
    name: 'Jagatsinghpur Coastal Flood Zone',
    coords: [
      [20.36, 86.02], [20.40, 86.28], [20.20, 86.34], [20.10, 86.10], [20.22, 85.96],
    ],
  },
  {
    id: 'FZ-3',
    name: 'Bhadrak Lowland Flood Zone',
    coords: [
      [21.18, 86.36], [21.24, 86.62], [21.02, 86.68], [20.94, 86.44], [21.04, 86.30],
    ],
  },
]

export const landslideZones: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: 'LZ-1',
    name: 'Koraput Highland Slope Zone',
    coords: [
      [18.94, 82.54], [19.02, 82.86], [18.78, 82.94], [18.66, 82.68], [18.80, 82.50],
    ],
  },
  {
    id: 'LZ-2',
    name: 'Kalahandi Escarpment Zone',
    coords: [
      [20.02, 82.98], [20.10, 83.30], [19.86, 83.40], [19.76, 83.10], [19.90, 82.94],
    ],
  },
]

export const rivers: { id: string; name: string; path: [number, number][] }[] = [
  {
    id: 'RV-1',
    name: 'Brahmani River',
    path: [
      [21.30, 85.20], [21.10, 85.60], [20.90, 85.95], [20.65, 86.20], [20.50, 86.48],
    ],
  },
  {
    id: 'RV-2',
    name: 'Mahanadi River',
    path: [
      [20.90, 84.70], [20.70, 85.15], [20.50, 85.55], [20.30, 85.95], [20.15, 86.25],
    ],
  },
  {
    id: 'RV-3',
    name: 'Rushikulya River',
    path: [
      [19.60, 84.10], [19.50, 84.45], [19.42, 84.75], [19.36, 84.97],
    ],
  },
]

export const roads: { id: string; name: string; path: [number, number][] }[] = [
  {
    id: 'RD-1',
    name: 'NH-16 Coastal Corridor',
    path: [
      [21.49, 86.93], [21.06, 86.51], [20.50, 86.42], [19.80, 85.83], [19.38, 84.98],
    ],
  },
  {
    id: 'RD-2',
    name: 'SH-49 Inland Link',
    path: [
      [19.91, 83.16], [18.81, 82.71],
    ],
  },
]
