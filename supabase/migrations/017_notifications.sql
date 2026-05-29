-- ── Notifications table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text NOT NULL,
  title      text NOT NULL,
  body       text,
  link       text,
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx  ON notifications(user_id, is_read);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ── Trigger: notify employer when a teacher applies ───────────────────────────
CREATE OR REPLACE FUNCTION notify_employer_on_application()
RETURNS TRIGGER AS $$
DECLARE
  v_employer_id    uuid;
  v_job_title      text;
  v_applicant_name text;
BEGIN
  SELECT employer_id, title
    INTO v_employer_id, v_job_title
    FROM job_listings
   WHERE id = NEW.job_id;

  SELECT full_name
    INTO v_applicant_name
    FROM profiles
   WHERE id = NEW.applicant_id;

  IF v_employer_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      v_employer_id,
      'new_application',
      'New Application Received',
      COALESCE(v_applicant_name, 'A teacher') || ' applied for "' || COALESCE(v_job_title, 'your job') || '"',
      '/employer/applicants'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_job_application_inserted ON job_applications;
CREATE TRIGGER on_job_application_inserted
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_employer_on_application();
