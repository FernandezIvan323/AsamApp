-- Búsqueda full-text (FTS5) sobre Event, con tabla de contenido externo.
-- Antes se creaba en runtime desde search.js: los eventos preexistentes quedaban
-- sin indexar y cualquier migración que recrea la tabla Event rompía el índice.

CREATE VIRTUAL TABLE IF NOT EXISTS "event_fts" USING fts5(
  title, client, location, menuNotes,
  content='Event', content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS "event_fts_ai" AFTER INSERT ON "Event" BEGIN
  INSERT INTO event_fts(rowid, title, client, location, menuNotes)
  VALUES (new.rowid, new.title, COALESCE(new.client, ''), COALESCE(new.location, ''), COALESCE(new.menuNotes, ''));
END;

CREATE TRIGGER IF NOT EXISTS "event_fts_ad" AFTER DELETE ON "Event" BEGIN
  INSERT INTO event_fts(event_fts, rowid, title, client, location, menuNotes)
  VALUES ('delete', old.rowid, old.title, COALESCE(old.client, ''), COALESCE(old.location, ''), COALESCE(old.menuNotes, ''));
END;

CREATE TRIGGER IF NOT EXISTS "event_fts_au" AFTER UPDATE ON "Event" BEGIN
  INSERT INTO event_fts(event_fts, rowid, title, client, location, menuNotes)
  VALUES ('delete', old.rowid, old.title, COALESCE(old.client, ''), COALESCE(old.location, ''), COALESCE(old.menuNotes, ''));
  INSERT INTO event_fts(rowid, title, client, location, menuNotes)
  VALUES (new.rowid, new.title, COALESCE(new.client, ''), COALESCE(new.location, ''), COALESCE(new.menuNotes, ''));
END;

-- Reindexar eventos preexistentes que no estén en el índice (idempotente)
INSERT INTO event_fts(rowid, title, client, location, menuNotes)
SELECT rowid, title, COALESCE(client, ''), COALESCE(location, ''), COALESCE(menuNotes, '')
FROM "Event"
WHERE rowid NOT IN (SELECT rowid FROM event_fts);
