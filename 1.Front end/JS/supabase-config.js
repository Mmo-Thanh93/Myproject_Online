const SUPABASE_URL = "https://coefmbltftvlblygujsm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZWZtYmx0ZnR2bGJseWd1anNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MTEyMzcsImV4cCI6MjA5NTE4NzIzN30.1ca-UA8wOyArL1pFcBQ5Md278qiiF6Bmo8Li_DKYL1c";

window.supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
