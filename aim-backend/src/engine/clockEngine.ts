import db from '../db/connection.js';

export function getSimNow(): string {
  const row = db.prepare('SELECT sim_offset_ms FROM sim_clock WHERE id = 1').get() as { sim_offset_ms: number } | undefined;
  const offset = row ? row.sim_offset_ms : 0;
  return new Date(Date.now() + offset).toISOString();
}

export function advanceClock(days: number): void {
  const msToAdd = days * 24 * 60 * 60 * 1000;
  db.prepare('UPDATE sim_clock SET sim_offset_ms = sim_offset_ms + ? WHERE id = 1').run(msToAdd);
}

export function resetClock(): void {
  db.prepare('UPDATE sim_clock SET sim_offset_ms = 0 WHERE id = 1').run();
}
