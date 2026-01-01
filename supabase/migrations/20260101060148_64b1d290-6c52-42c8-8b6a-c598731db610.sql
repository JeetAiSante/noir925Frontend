-- Fix: Remove duplicate loyalty_settings rows and keep only one
DELETE FROM loyalty_settings 
WHERE id != (SELECT id FROM loyalty_settings ORDER BY created_at LIMIT 1);

-- Add unique constraint to prevent future duplicates (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'loyalty_settings_single_row') THEN
    -- Since we want only one row, we'll add a trigger to enforce this
    CREATE OR REPLACE FUNCTION enforce_single_loyalty_setting()
    RETURNS TRIGGER AS $trigger$
    BEGIN
      IF (SELECT COUNT(*) FROM loyalty_settings) >= 1 AND TG_OP = 'INSERT' THEN
        RAISE EXCEPTION 'Only one loyalty_settings row is allowed';
      END IF;
      RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS enforce_single_loyalty_setting_trigger ON loyalty_settings;
    CREATE TRIGGER enforce_single_loyalty_setting_trigger
    BEFORE INSERT ON loyalty_settings
    FOR EACH ROW EXECUTE FUNCTION enforce_single_loyalty_setting();
  END IF;
END $$;