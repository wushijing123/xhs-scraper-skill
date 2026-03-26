# xhs-scraper-skill

[**中文文档**](./README.md)

> A [Claude Code](https://claude.ai/claude-code) skill for scraping Xiaohongshu (小红书 / RedNote) data via [TikHub API](https://tikhub.io).
> Compatible with **Claude Code** and **Openclaw**.

---

## Why I Built This

I got my Xiaohongshu account restricted — and this is why.

![XHS violation notice](./xhs-violation-notice.png)

> **Violation notice (translated):** *"Your account has repeatedly used AI automation for posting/interactions. We will restrict your account functions. The platform does not support any third-party tools, software, or mini programs for auto-publishing content or inflating data. Repeated violations may result in a permanent ban."*

Previously, I was scraping Xiaohongshu data using tools that required **logging in with my account** — including Playwright-based scrapers, Openclaw monitoring workflows, and `xiaohongshu-cli` type tools. All of them triggered XHS's upgraded AI automation detection. The problem is clear: **any tool that logs in with your account will be flagged**, regardless of what it's actually doing.

**This skill takes a different approach.** It uses TikHub's API — a third-party data service that accesses public Xiaohongshu data through its own infrastructure. You never log in to XHS, never run a browser, and never touch your account's session. Your account stays safe.

> Use this skill for reading and analyzing **public** Xiaohongshu data only — not for automating interactions (posting, liking, commenting) on your account.

---

## What it does

Talk to Claude in plain language — no commands, no code. Claude will automatically pick the right API, extract IDs from URLs, paginate results, and export data.

```
帮我抓取这条小红书笔记的数据：https://www.xiaohongshu.com/explore/68304ca2...

抓取用户「美食探店小王」的所有笔记，导出成 Excel

搜索小红书上关于「护肤」的用户，列出粉丝数排名

获取这个笔记的所有评论
```

**Supports:**
- Search users by keyword
- Get user profile (followers, notes count, bio)
- Fetch all notes from a user (auto-pagination)
- Get note detail — title, description, stats, cover image, topics
- Get note comments
- Get notes by topic / home feed
- Export to Excel / JSON

---

## Quick Start

### 1. Install the skill

```bash
npx xhs-scraper-skill
```

This copies the skill into `~/.claude/skills/xhs-scraper/`.

---

### 2. Get a TikHub API key

1. Register at [user.tikhub.io](https://user.tikhub.io)
2. Copy your API key from the dashboard

> TikHub provides the underlying Xiaohongshu data API. Pricing: ~**$0.001 per call**, with 24h response caching (repeated identical requests are free). See [full pricing](https://user.tikhub.io/dashboard/pricing).

---

### 3. Add the API key to Claude Code

Edit `~/.claude/settings.json`:

```json
{
  "env": {
    "TIKHUB_API_KEY": "your-api-key-here"
  }
}
```

---

### 4. Install Python dependency

```bash
pip3 install httpx
```

---

### 5. Restart Claude Code

The skill activates automatically. Try asking:

```
帮我抓取这条小红书笔记的数据：https://www.xiaohongshu.com/explore/68304ca2...
```

---

## Requirements

| Requirement | Details |
|-------------|---------|
| Claude Code | [claude.ai/claude-code](https://claude.ai/claude-code) |
| Node.js | ≥ 18 (for installer) |
| Python 3 + `httpx` | `pip3 install httpx` |
| TikHub API key | [user.tikhub.io](https://user.tikhub.io) |

---

## Supported Endpoints

| Feature | Endpoint |
|---------|----------|
| Search users | `GET /api/v1/xiaohongshu/web/search_users` |
| Get user info | `GET /api/v1/xiaohongshu/app/get_user_info` |
| Get user notes | `GET /api/v1/xiaohongshu/app/get_user_notes` |
| Get note detail | `GET /api/v1/xiaohongshu/app/get_note_info` |
| Get note comments | `GET /api/v1/xiaohongshu/app/get_note_comments` |
| Get notes by topic | `GET /api/v1/xiaohongshu/app/get_notes_by_topic` |
| Home feed | `GET /api/v1/xiaohongshu/web/get_home_recommend` |

---

## How to Extract IDs from URLs

**User ID** — from profile URL:
```
https://www.xiaohongshu.com/user/profile/5c1b1234...
                                          ^^^^^^^^^^^
```

**Note ID** — from note URL:
```
https://www.xiaohongshu.com/explore/68304ca200000000...
                                    ^^^^^^^^^^^^^^^^
```

> You don't need to extract IDs manually — just paste the full URL and Claude will handle it.

---

## Note Detail Fields

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
| `topics` | Topic tags |
| `time` | Publish timestamp (seconds) |
| `ip_location` | Author's IP location |
| `images_list` | Image URLs (multiple resolutions) |
| `video` | Video info (for video notes) |

> ⚠️ `interact_info` in the raw response is always empty — the skill reads the correct top-level fields (`liked_count`, etc.) instead.

---

## Troubleshooting

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `400` | Note deleted, or needs `share_text` | Paste the full share URL instead of just the note ID |
| `401` | API key missing | Check `TIKHUB_API_KEY` in `~/.claude/settings.json` |
| `429` | Rate limited | The skill adds delays automatically; wait a moment and retry |
| Timeout | VPN / proxy conflict | Try toggling your VPN — `api.tikhub.io` may need direct access |
| Cover URL broken | CDN URLs expire | Download cover images right away, don't save URLs for later use |

---

## License

MIT
