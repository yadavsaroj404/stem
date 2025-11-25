# How to Start PostgreSQL Database

## Your Setup
- PostgreSQL 15 installed via Homebrew
- Location: `/opt/homebrew/opt/postgresql@15/`

---

## Method 1: Start with Homebrew (Recommended)

### Start PostgreSQL
```bash
brew services start postgresql@15
```

### Check Status
```bash
brew services list | grep postgresql
```

Should show:
```
postgresql@15  started  ...
```

### Stop PostgreSQL (when needed)
```bash
brew services stop postgresql@15
```

### Restart PostgreSQL
```bash
brew services restart postgresql@15
```

---

## Method 2: Start Manually (Temporary)

### Start in foreground (terminal stays open)
```bash
/opt/homebrew/opt/postgresql@15/bin/postgres -D /opt/homebrew/var/postgresql@15
```

Press `Ctrl+C` to stop.

---

## Method 3: Use `pg_ctl` Command

### Start
```bash
pg_ctl -D /opt/homebrew/var/postgresql@15 start
```

### Stop
```bash
pg_ctl -D /opt/homebrew/var/postgresql@15 stop
```

### Status
```bash
pg_ctl -D /opt/homebrew/var/postgresql@15 status
```

---

## Quick Start Commands

### 1. Start Database
```bash
brew services start postgresql@15
```

### 2. Verify It's Running
```bash
psql -U visheshmamoria -d postgres -c "SELECT version();"
```

Should show PostgreSQL version info.

### 3. Check Connection
```bash
psql -U visheshmamoria -d postgres -c "SELECT 1;"
```

Should return `1`.

---

## Troubleshooting

### Check if PostgreSQL is running
```bash
ps aux | grep postgres
```

Should show multiple postgres processes if running.

### Check PostgreSQL port (5432)
```bash
lsof -i :5432
```

Should show postgres listening on port 5432.

### View PostgreSQL logs
```bash
tail -f /opt/homebrew/var/log/postgresql@15.log
```

### If can't connect
```bash
# Stop any running instances
brew services stop postgresql@15
killall postgres

# Start fresh
brew services start postgresql@15

# Wait a few seconds
sleep 3

# Test connection
psql -U visheshmamoria -d postgres -c "SELECT 1;"
```

---

## After Starting Database

### Run Verification Script
```bash
cd /Users/visheshmamoria/Desktop/stem-main/stem/backend
source .venv/bin/activate
python verify_data_source.py
```

Should show:
```
✅ Database Tables Exist
✅ Questions Loaded from Database
✅ Answers Loaded (JSON)
✅ API Endpoint Works
```

---

## Set Database to Start on Boot (Optional)

If you want PostgreSQL to start automatically when Mac boots:

```bash
brew services start postgresql@15
```

This command makes it persistent.

To disable auto-start:
```bash
brew services stop postgresql@15
```

---

## Common Issues

### Issue: "fe_sendauth: no password supplied"
**Solution**: Your database doesn't require a password for local connections.
Your connection string should be:
```
postgresql://visheshmamoria@localhost:5432/postgres
```

### Issue: "could not connect to server"
**Solution**: Database isn't running. Start it:
```bash
brew services start postgresql@15
```

### Issue: "port 5432 is already in use"
**Solution**: Another PostgreSQL is running. Stop all:
```bash
brew services stop postgresql@15
brew services stop postgresql
killall postgres
```

Then start the correct version:
```bash
brew services start postgresql@15
```

---

## Quick Reference Card

```bash
# Start
brew services start postgresql@15

# Stop
brew services stop postgresql@15

# Restart
brew services restart postgresql@15

# Status
brew services list

# Connect
psql -U visheshmamoria -d postgres

# Test connection
psql -U visheshmamoria -d postgres -c "SELECT 1;"
```

---

## Next Steps After Starting

1. **Start the database:**
   ```bash
   brew services start postgresql@15
   ```

2. **Verify it's running:**
   ```bash
   psql -U visheshmamoria -d postgres -c "SELECT 1;"
   ```

3. **Check if tables exist:**
   ```bash
   psql -U visheshmamoria -d postgres -c "\dt"
   ```

4. **If no tables, seed the database:**
   ```bash
   cd /Users/visheshmamoria/Desktop/stem-main/stem/backend
   source .venv/bin/activate
   export DATABASE_URL="postgresql://visheshmamoria@localhost:5432/postgres"
   python app/models/seed_from_json.py --clusters app/data/clusters.json --questions app/data/test-questions.json
   ```

5. **Start the backend:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

6. **Run verification:**
   ```bash
   python verify_data_source.py
   ```

---

## Database Management Tools (Optional)

### Command Line
```bash
# List all databases
psql -U visheshmamoria -d postgres -c "\l"

# List all tables
psql -U visheshmamoria -d postgres -c "\dt"

# Count questions
psql -U visheshmamoria -d postgres -c "SELECT COUNT(*) FROM questions;"
```

### GUI Tools (Optional)
- **pgAdmin 4**: https://www.pgadmin.org/download/
- **Postico**: https://eggerapps.at/postico/ (Mac only, free)
- **TablePlus**: https://tableplus.com/ (free tier available)

---

✅ You're ready to start your database!
