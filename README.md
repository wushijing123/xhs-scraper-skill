# xhs-scraper-skill

A [Claude Code](https://claude.ai/claude-code) skill for scraping Xiaohongshu (小红书) data via [TikHub API](https://tikhub.io).

## Install

```bash
npx xhs-scraper-skill
```

The installer copies the skill to `~/.claude/skills/xhs-scraper/` and guides you through setup.

## Setup

1. Get a TikHub API key at [user.tikhub.io](https://user.tikhub.io)

2. Add to `~/.claude/settings.json`:
   ```json
   {
     "env": {
       "TIKHUB_API_KEY": "your-api-key-here"
     }
   }
   ```

3. Install Python dependency:
   ```bash
   pip3 install httpx
   ```

4. Restart Claude Code — the skill activates automatically.

## Usage

Just describe what you want in natural language:

```
帮我抓取这条小红书笔记的数据：https://www.xiaohongshu.com/explore/xxx
抓取用户 xxx 的所有笔记，导出成 Excel
搜索小红书上关于「护肤」的用户
获取这个笔记的评论
```

## Features

| Feature | Endpoint |
|---------|----------|
| Search users | `GET /api/v1/xiaohongshu/web/search_users` |
| Get user info | `GET /api/v1/xiaohongshu/app/get_user_info` |
| Get user notes | `GET /api/v1/xiaohongshu/app/get_user_notes` |
| Get note detail | `GET /api/v1/xiaohongshu/app/get_note_info` |
| Get note comments | `GET /api/v1/xiaohongshu/app/get_note_comments` |
| Get topic notes | `GET /api/v1/xiaohongshu/app/get_notes_by_topic` |
| Home feed | `GET /api/v1/xiaohongshu/web/get_home_recommend` |

**Note detail includes:** title, description, author, publish time, IP location, topics, like/collect/comment/share/view counts, cover image URL.

## Pricing

TikHub charges ~¥0.07 per API call. Successful responses are cached for 24 hours — repeated identical requests are free.

## Requirements

- Claude Code
- Node.js ≥ 18 (for installer)
- Python 3 + `httpx` (for API calls)
- TikHub API key

## License

MIT
