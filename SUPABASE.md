# Supabase setup

La Rosca uses Supabase as the shared online state for host and players.

## 1. Create the table

In Supabase, open **SQL Editor** and run:

```sql
-- Paste the contents of supabase/schema.sql here
```

The schema stores each game session as a JSON payload in `public.game_sessions`.

## 2. Enable Realtime

The SQL includes:

```sql
alter publication supabase_realtime add table public.game_sessions;
```

If Supabase says the table is already in the publication, that is fine.

## 3. Local env

Create `.env` from `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. GitHub Pages secrets

In GitHub:

`Settings > Secrets and variables > Actions > New repository secret`

Add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then re-run the GitHub Pages action.

Without these variables, the app still builds, but it falls back to local-only storage.
