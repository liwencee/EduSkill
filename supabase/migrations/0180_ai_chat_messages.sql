-- ── 018: AI Assistant chat history (per-user persistence) ────────────────────

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       text        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_user
  ON ai_chat_messages(user_id, created_at);

-- ── RLS — a user can only see and write their own messages ───────────────────
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own chat" ON ai_chat_messages;
CREATE POLICY "Users read own chat" ON ai_chat_messages
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own chat" ON ai_chat_messages;
CREATE POLICY "Users insert own chat" ON ai_chat_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own chat" ON ai_chat_messages;
CREATE POLICY "Users delete own chat" ON ai_chat_messages
  FOR DELETE USING (user_id = auth.uid());
