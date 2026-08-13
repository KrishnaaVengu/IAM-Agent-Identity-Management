import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

// GET /api/audit-log/export
router.get('/export', (req, res) => {
  const format = req.query.format || 'json';
  const rows = db.prepare('SELECT * FROM audit_log ORDER BY timestamp DESC').all() as any[];

  if (format === 'cef') {
    const cefLines = rows.map((r) => 
      `CEF:0|AIM|AgentIAM|1.0|${r.event_type}|Action Executed|5|src=${r.agent_id || 'system'} msg=${r.details.replace(/\|/g, '\\|')}`
    );
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="aim-audit-log.cef"');
    return res.send(cefLines.join('\n'));
  }

  if (format === 'csv') {
    const csvHeader = 'timestamp,event_type,agent_id,actor_role,details\n';
    const csvLines = rows.map((r) => 
      `"${r.timestamp}","${r.event_type}","${r.agent_id || ''}","${r.actor_role}","${r.details.replace(/"/g, '""')}"`
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="aim-audit-log.csv"');
    return res.send(csvHeader + csvLines.join('\n'));
  }

  // JSON
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="aim-audit-log.json"');
  return res.json(rows);
});

// GET /api/audit-log
router.get('/', (req, res) => {
  const { eventType, agentId, actorRole, from, to, page: rawPage, limit: rawLimit } = req.query;

  const page = Math.max(1, parseInt(rawPage as string, 10) || 1);
  const requestedLimit = parseInt(rawLimit as string, 10) || 50;
  const limit = Math.min(200, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (eventType && typeof eventType === 'string') {
    conditions.push('event_type = ?');
    params.push(eventType);
  }

  if (agentId && typeof agentId === 'string') {
    conditions.push('agent_id = ?');
    params.push(agentId);
  }

  if (actorRole && typeof actorRole === 'string') {
    conditions.push('actor_role = ?');
    params.push(actorRole);
  }

  if (from && typeof from === 'string') {
    conditions.push('timestamp >= ?');
    params.push(from);
  }

  if (to && typeof to === 'string') {
    conditions.push('timestamp <= ?');
    params.push(to);
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = ' WHERE ' + conditions.join(' AND ');
  }

  const countSql = `SELECT COUNT(*) as total FROM audit_log${whereClause}`;
  const countRow = db.prepare(countSql).get(...params) as { total: number };
  const total = countRow ? countRow.total : 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const dataSql = `SELECT * FROM audit_log${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
  const rows = db.prepare(dataSql).all(...params, limit, offset) as any[];

  const entries = rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    eventType: row.event_type,
    agentId: row.agent_id,
    actorRole: row.actor_role,
    details: row.details
  }));

  res.json({
    ok: true,
    data: {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  });
});

export default router;
