-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Setup Realtime for alerts and incidents
-- The publication might exist or not depending on Supabase setup, so we use DO block
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to realtime (using safe idempotent syntax)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'alerts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'incidents') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
    END IF;
END $$;

-- 3. Schedule the process-alerts Edge Function
-- The job will be updated automatically if it exists due to using a named schedule

-- Then schedule it to run every minute
-- Note: We use pg_net to invoke the edge function.
SELECT cron.schedule(
    'process_alerts_every_minute',
    '* * * * *',
    $$
    DO $block$
    DECLARE
        supabase_url text;
        service_key text;
    BEGIN
        supabase_url := current_setting('app.settings.supabase_url', true);
        service_key := current_setting('app.settings.service_role_key', true);
        
        IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
            PERFORM net.http_post(
                url := supabase_url || '/functions/v1/process-alerts',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || service_key
                )
            );
        END IF;
    END;
    $block$;
    $$
);
