# xhs-scraper-skill

> A [Claude Code](https://claude.ai/claude-code) skill for scraping Xiaohongshu (小红书 / RedNote) data via [TikHub API](https://tikhub.io).

---

## Features

- 🔍 Search users by keyword
- 👤 Get user profile (followers, notes count, bio)
- 📝 Fetch all notes from a user (auto-pagination)
- 📄 Get note detail (title, description, author, topics, stats, cover image)
- 💬 Get note comments
- 🏷️ Get notes by topic
- 📊 Export to Excel / JSON
- 💰 ~¥0.07 per API call (24h response cache — repeated requests are free)

---

## Requirements

- [Claude Code](https://claude.ai/claude-code)
- Node.js ≥ 18
- Python 3 + `httpx`
- TikHub API key ([register here](https://user.tikhub.io))

---

## Installation

### Step 1 — Install the skill

```bash
npx xhs-scraper-skill
```

This copies the skill into `~/.claude/skills/xhs-scraper/`.

### Step 2 — Get a TikHub API key

1. Register at [user.tikhub.io](https://user.tikhub.io)
2. Copy your API key from the dashboard

### Step 3 — Add your API key to Claude Code

Edit `~/.claude/settings.json`:

```json
{
  "env": {
    "TIKHUB_API_KEY": "your-api-key-here"
  }
}
```

### Step 4 — Install Python dependency

```bash
pip3 install httpx
```

### Step 5 — Restart Claude Code

The skill activates automatically after restart.

---

## Usage

Just describe what you want in natural language — no commands needed:

```
帮我抓取这条小红书笔记的数据：
https://www.xiaohongshu.com/explore/68304ca20000000023014b19

抓取用户 65f7fc87000000000b00e75f 的所有笔记，导出成 Excel

搜索小红书上关于「护肤」的用户

获取这个笔记的评论
```

Claude will automatically detect the intent and call the right API.

---

## Supported Endpoints

| Feature | Endpoint |
|---------|----------|
| Search users | `GET /api/v1/xiaohongshu/web/search_users` |
| Get user info (Web) | `GET /api/v1/xiaohongshu/web/get_user_info` |
| Get user info (App) | `GET /api/v1/xiaohongshu/app/get_user_info` |
| Get user notes (Web) | `GET /api/v1/xiaohongshu/web/get_user_notes_v2` |
| Get user notes (App) | `GET /api/v1/xiaohongshu/app/get_user_notes` |
| Get note detail | `GET /api/v1/xiaohongshu/app/get_note_info` |
| Get note comments | `GET /api/v1/xiaohongshu/app/get_note_comments` |
| Get topic notes | `GET /api/v1/xiaohongshu/app/get_notes_by_topic` |
| Home feed | `GET /api/v1/xiaohongshu/web/get_home_recommend` |

---

## How to Extract IDs from URLs

**User ID** — from profile URL:
```
https://www.xiaohongshu.com/user/profile/5c1b1234...
                                          ^^^^^^^^^^^
                                          this is the user_id
```

**Note ID** — from note URL:
```
https://www.xiaohongshu.com/explore/68304ca200000000...
                                    ^^^^^^^^^^^^^^^^
                                    this is the note_id
```

---

## Note Detail Response

The `get_note_info` response includes:

| Field | Description |
|-------|-------------|
| `title` | Note title |
| `desc` | Note description |
| `type` | `"normal"` (image) or `"video"` |
| `liked_count` | Like count |
| `collected_count` | Collect/save count |
| `comments_count` | Comment count |
| `shared_count` | Share count |
| `view_count` | View count |
| `topics` | Topic tags (each has `name`) |
| `time` | Publish timestamp (seconds) |
| `ip_location` | Author's IP location |
| `images_list` | Image URLs (multiple resolutions) |
| `video` | Video info (for video notes) |

> ⚠️ `interact_info` in the response is always empty — use the top-level fields (`liked_count`, `collected_count`, etc.) instead.

---

## Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `400` | Endpoint needs XHS cookies, or note is deleted | Try passing `share_text` instead of `note_id`; check if the note still exists |
| `401` | API key not set | Verify `TIKHUB_API_KEY` in `~/.claude/settings.json` |
| `429` | Rate limited | Add `asyncio.sleep(0.5~1)` between requests; do not retry immediately |
| Timeout | Network / proxy issue | Check if your VPN or proxy is interfering with `api.tikhub.io` |
| Cover URL expired | CDN URLs have time-limited signatures | Download cover images immediately, don't store the URL for later |

---

## Pricing

- ~**¥0.07 per API call**
- Successful responses are **cached for 24 hours** — repeating the same request within 24h is free
- Register at [user.tikhub.io](https://user.tikhub.io) to top up

---

## License

MIT
