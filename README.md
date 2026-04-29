# Insighta CLI

Globally installable command-line tool for the Insighta Labs+ platform. Authenticate via GitHub, browse and search demographic profiles, create, export, and manage data — all from your terminal.

---

## Installation

### From the repo (development)

```bash
git clone https://github.com/PearlPerfect/hng14-backendNode.js_stage3_cli.git
cd hng14-backendNode.js_stage3_cli
npm install
npm link        # makes `insighta` available globally
```

### Verify installation

```bash
insighta --version
insighta --help
```

---

## Configuration

Create a `.env` file in the CLI folder:

```
INSIGHTA_API_URL=https://hng14-backend-node-js-stage3-backen.vercel.app/
```

For local development:

```
INSIGHTA_API_URL=http://localhost:3000
```

Credentials are stored at `~/.insighta/credentials.json` after login. This path is managed automatically by the `conf` package.

---

## Authentication

### Login

```bash
insighta login
```

**What happens:**
1. CLI generates a `code_verifier` (random 32-byte base64url string)
2. Derives `code_challenge = SHA256(code_verifier)` — this is PKCE
3. Starts a temporary HTTP server on port 9876
4. Opens your browser to the GitHub OAuth page
5. You authenticate with GitHub
6. GitHub redirects back to `http://localhost:9876/callback`
7. CLI captures the access + refresh tokens from the callback URL
8. Tokens saved to `~/.insighta/credentials.json`
9. Browser shows: "Login successful! You can close this tab."
10. Terminal shows: `✔ Logged in as @your-username`

### Check who you are

```bash
insighta whoami
```

Output:
```
Username:   @your-github-username
Email:      you@example.com
Role:       analyst
Last login: 29/04/2026, 10:00:00
```

### Logout

```bash
insighta logout
```

Invalidates the refresh token server-side and clears `~/.insighta/credentials.json`.

---

## Profile Commands

### List profiles

```bash
# Default — page 1, 10 results
insighta profiles list

# With filters
insighta profiles list --gender male
insighta profiles list --country NG --age-group adult
insighta profiles list --min-age 25 --max-age 40
insighta profiles list --gender female --country GH

# Sorting
insighta profiles list --sort-by age --order desc
insighta profiles list --sort-by gender_probability --order asc

# Pagination
insighta profiles list --page 2 --limit 20
insighta profiles list --page 5 --limit 50

# Combined
insighta profiles list --gender male --country NG --min-age 25 --sort-by age --order desc --page 1 --limit 10
```

**Available flags:**

| Flag | Type | Description |
|---|---|---|
| `--gender` | string | `male` or `female` |
| `--country` | string | ISO code e.g. `NG`, `GH`, `KE` |
| `--age-group` | string | `child`, `teenager`, `adult`, `senior` |
| `--min-age` | number | Minimum age |
| `--max-age` | number | Maximum age |
| `--sort-by` | string | `age`, `created_at`, `gender_probability` |
| `--order` | string | `asc` or `desc` |
| `--page` | number | Page number (default: 1) |
| `--limit` | number | Results per page (default: 10, max: 50) |

**Output example:**
```
┌──────────────────┬─────────┬──────┬───────────┬──────┬─────────────┐
│ name             │ gender  │ age  │ age_group │ id   │ country_id  │
├──────────────────┼─────────┼──────┼───────────┼──────┼─────────────┤
│ emmanuel         │ male    │ 34   │ adult     │ ...  │ NG          │
│ amara            │ female  │ 27   │ adult     │ ...  │ GH          │
└──────────────────┴─────────┴──────┴───────────┴──────┴─────────────┘

Page 1 of 203 · 2026 total results · 10 per page
```

---

### Get a single profile

```bash
insighta profiles get <id>
```

Example:
```bash
insighta profiles get b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12
```

Output:
```
┌─────────────────────┬──────────────────────────────────────┐
│ id                  │ b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12 │
│ name                │ emmanuel                              │
│ gender              │ male                                  │
│ age                 │ 34                                    │
│ age_group           │ adult                                 │
│ country_id          │ NG                                    │
│ country_name        │ Nigeria                               │
│ gender_probability  │ 0.99                                  │
│ country_probability │ 0.85                                  │
└─────────────────────┴──────────────────────────────────────┘
```

---

### Natural language search

```bash
insighta profiles search "young males from nigeria"
insighta profiles search "females above 30"
insighta profiles search "adult males from kenya"
insighta profiles search "senior females"
insighta profiles search "teenagers from ghana"
insighta profiles search "males between 20 and 35"

# With pagination
insighta profiles search "young males from nigeria" --page 2 --limit 20
```

**Supported search patterns:**

| Pattern | What it does |
|---|---|
| `young [males/females]` | `min_age=16, max_age=24` |
| `males/females` | `gender=male/female` |
| `above/over/older than N` | `min_age=N` |
| `below/under/younger than N` | `max_age=N` |
| `between N and M` | `min_age=N, max_age=M` |
| `child/children/kids` | `age_group=child` |
| `teenager/teen` | `age_group=teenager` |
| `adult/adults` | `age_group=adult` |
| `senior/seniors/elderly` | `age_group=senior` |
| `from nigeria / from NG` | `country_id=NG` |

---

### Create a profile (admin only)

```bash
insighta profiles create --name "Harriet Tubman"
insighta profiles create --name "amara"
```

This calls Genderize, Agify, and Nationalize APIs in parallel and stores the result. Requires `admin` role.

---

### Export profiles as CSV

```bash
# Export all profiles
insighta profiles export --format csv

# Export with filters
insighta profiles export --format csv --gender male
insighta profiles export --format csv --country NG
insighta profiles export --format csv --gender female --country GH
```

The CSV file is saved to the **current working directory** as `profiles_<timestamp>.csv`.

CSV columns: `id, name, gender, gender_probability, age, age_group, country_id, country_name, country_probability, created_at`

---

## Token Handling

### How tokens are stored

After login, tokens are saved to `~/.insighta/credentials.json`:

```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "username": "your-github-username"
}
```

### Automatic token refresh

When any API call returns `401 TOKEN_EXPIRED`, the CLI automatically:
1. Uses the stored refresh token to call `/auth/refresh`
2. Saves the new token pair to credentials
3. Retries the original request with the new access token

If the refresh token is also expired (or invalid), the CLI clears credentials and prompts:
```
Session expired. Please run: insighta login
```

### Token expiry

| Token | Expiry |
|---|---|
| Access token | 3 minutes |
| Refresh token | 5 minutes |

Since both tokens are short-lived, the CLI is designed to seamlessly refresh without user interruption for active sessions.

---

## Testing the CLI — Step by Step

### Step 1 — Make sure the backend is running

```bash
# In one terminal, start the backend
cd insighta-backend
npm run dev
```

### Step 2 — Install the CLI globally

```bash
cd insighta-cli
npm install
npm link
```

### Step 3 — Set the API URL

Edit `.env` in the CLI folder:
```
INSIGHTA_API_URL=http://localhost:3000
```

### Step 4 — Test login

```bash
insighta login
```

Your browser will open automatically. Sign in with GitHub. The terminal will show:
```
✔ Logged in as @your-username
```

### Step 5 — Check your user

```bash
insighta whoami
```

### Step 6 — Promote yourself to admin

The default role is `analyst`. To test admin commands, run this SQL directly in Neon:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your-github-username';
```

Then run:
```bash
insighta whoami    # should now show role: admin
```

### Step 7 — Test listing profiles

```bash
insighta profiles list
insighta profiles list --gender male --country NG
insighta profiles list --sort-by age --order desc --limit 5
```

### Step 8 — Test natural language search

```bash
insighta profiles search "young males from nigeria"
insighta profiles search "females above 30"
```

### Step 9 — Test create (admin required)

```bash
insighta profiles create --name "ella"
```

Copy the `id` from the output for the next test.

### Step 10 — Test get by ID

```bash
insighta profiles get PASTE_ID_HERE
```

### Step 11 — Test export

```bash
cd ~/Desktop
insighta profiles export --format csv
ls *.csv    # should see profiles_<timestamp>.csv
```

### Step 12 — Test token expiry

Access tokens expire after 3 minutes. To manually test the auto-refresh:
1. Login
2. Wait 3+ minutes
3. Run any command (e.g. `insighta profiles list`)
4. The CLI should silently refresh and succeed — no re-login needed
5. After 5 minutes (refresh token also expired), you'll be prompted to login again

### Step 13 — Test logout

```bash
insighta logout
insighta profiles list    # should fail: not logged in
```

### Step 14 — Test against production

Change your `.env`:
```
INSIGHTA_API_URL=https://your-api.vercel.app
```

Run the full suite again. All commands should work identically.

---

## Error Messages

| Message | Cause | Fix |
|---|---|---|
| `Not logged in. Run: insighta login` | No credentials file | Run `insighta login` |
| `Session expired. Please run: insighta login` | Both tokens expired | Run `insighta login` |
| `Insufficient permissions` | Action requires admin role | Ask an admin to promote your account |
| `API version header required` | Backend misconfigured | Bug — report to backend team |
| `Unable to interpret query` | NLP parser couldn't parse query | Try a different phrasing |
| `Login timed out` | Didn't complete OAuth in 2 minutes | Run `insighta login` again |

---

## Project Structure

```
insighta-cli/
├── bin/
│   └── insighta.js         ← Entry point, Commander.js setup
├── src/
│   ├── commands/
│   │   ├── auth.js         ← login, logout, whoami
│   │   └── profiles.js     ← list, get, search, create, export
│   └── utils/
│       ├── api.js          ← HTTP requests with auto-refresh
│       ├── tokens.js       ← Read/write ~/.insighta/credentials.json
│       └── display.js      ← Table rendering with cli-table3
├── .env
└── package.json
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `commander` | CLI argument parsing |
| `axios` | HTTP requests |
| `open` | Open browser for OAuth |
| `cli-table3` | Terminal table rendering |
| `ora` | Loading spinners |
| `chalk@4` | Terminal colours (v4 = CommonJS) |
| `conf` | Cross-platform credential storage |