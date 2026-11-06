/** Todas as coordenadas retornadas sao pixels CSS do container, nunca pixels do bitmap. */
export interface Point { x: number; y: number }
export interface Size { width: number; height: number }

export function mapHandPoint(point: Point, video: Size, stage: Size, mirrored = true): Point | null {
  if (![point.x, point.y, video.width, video.height, stage.width, stage.height].every(Number.isFinite) ||
      video.width <= 0 || video.height <= 0 || stage.width <= 0 || stage.height <= 0) return null
  const scale = Math.max(stage.width / video.width, stage.height / video.height)
  const w = video.width * scale, h = video.height * scale
  return { x: (stage.width - w) / 2 + (mirrored ? 1 - point.x : point.x) * w,
    y: (stage.height - h) / 2 + point.y * h }
}

export function smoothPoint(previous: Point | undefined, next: Point, alpha = .35): Point {
  return previous ? { x: alpha * next.x + (1 - alpha) * previous.x, y: alpha * next.y + (1 - alpha) * previous.y } : next
}

export function handCursor(landmarks: Point[], palm: boolean): Point | null {
  if (landmarks.length !== 21) return null
  if (!palm) return landmarks[8]
  const points = [0, 5, 9, 13, 17].map(i => landmarks[i])
  return { x: points.reduce((s, p) => s + p.x, 0) / points.length, y: points.reduce((s, p) => s + p.y, 0) / points.length }
}

export function overlaps(cursor: Point, target: Point, targetRadius: number, tolerance = 20, cursorRadius = 12) {
  return Math.hypot(cursor.x - target.x, cursor.y - target.y) <= targetRadius + tolerance + cursorRadius
}

/** Mantem a estrela inteira na area central alcancavel, inclusive em telas pequenas. */
export function reachableStar(previous: Point | null, random = Math.random): Point {
  for (let i = 0; i < 12; i++) {
    const next = { x: 22 + random() * 56, y: 34 + random() * 34 }
    if (!previous || Math.hypot(next.x - previous.x, next.y - previous.y) > 27) return next
  }
  return { x: previous && previous.x > 50 ? 27 : 73, y: 50 }
}
