---
name: xhs-scraper
description: 小红书数据抓取工具，基于 TikHub API。当用户想要抓取小红书笔记、用户信息、搜索内容、评论时，必须使用此 skill。触发词包括：「小红书抓取」「小红书数据」「抓取笔记」「获取小红书用户」「搜索小红书」「小红书评论」「XHS scrape」「xhs data」「xiaohongshu」。即使用户只是说「帮我抓一下小红书上的 xxx」也应该触发此 skill。
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - TIKHUB_API_KEY
      bins:
        - python3
    primaryEnv: TIKHUB_API_KEY
    emoji: "🔍"
    homepage: https://github.com/wushijing123/xhs-scraper-skill
    setup:
      - description: Install Python dependency
        command: pip3 install httpx
---

# 小红书抓取 Skill（TikHub API）

## 概述

通过 TikHub API 直接 HTTP 调用抓取小红书数据。API key 存储在环境变量 `TIKHUB_API_KEY` 中，**无需用户每次提供**。

> **重要**：不要使用 `tikhub` Python SDK，它的端点已过时。直接用 `httpx` 调用 API。

## 快速开始

1. 在 [TikHub 控制台](https://user.tikhub.io) 注册并获取 API key
2. 写入 `~/.claude/settings.json`：
   ```json
   {
     "env": {
       "TIKHUB_API_KEY": "your-api-key-here"
     }
   }
   ```
3. 安装依赖：`pip3 install httpx`

## 安装依赖

```bash
pip3 install httpx
```

## 已验证可用的端点

| 功能 | 端点 | 参数 |
|------|------|------|
| 搜索用户 | `GET /api/v1/xiaohongshu/web/search_users` | `keyword`, `page` |
| 获取用户信息（Web） | `GET /api/v1/xiaohongshu/web/get_user_info` | `user_id` |
| 获取用户信息（App） | `GET /api/v1/xiaohongshu/app/get_user_info` | `user_id` |
| 获取用户笔记列表（Web） | `GET /api/v1/xiaohongshu/web/get_user_notes_v2` | `user_id`, `cursor` |
| 获取用户笔记列表（App） | `GET /api/v1/xiaohongshu/app/get_user_notes` | `user_id`, `cursor` |
| 获取笔记详情（App） | `GET /api/v1/xiaohongshu/app/get_note_info` | `share_text` 或 `note_id` |
| 获取话题笔记 | `GET /api/v1/xiaohongshu/app/get_notes_by_topic` | `topic_id` |
| 获取笔记评论 | `GET /api/v1/xiaohongshu/app/get_note_comments` | `note_id` |
| 主页推荐笔记 | `GET /api/v1/xiaohongshu/web/get_home_recommend` | 无 |

> **`get_note_info` 参数优先级**：优先用 `note_id`（如 `665f9520...`）；如果只有分享链接则用 `share_text`（如 `https://xhslink.com/a/...` 或完整分享文本）。两个都传时以 `note_id` 为准。

## 标准代码模板

```python
import asyncio
import os
import json
import httpx

BASE_URL = "https://api.tikhub.io"
API_KEY = os.environ.get("TIKHUB_API_KEY")
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

async def xhs_get(endpoint: str, params: dict) -> dict:
    """通用 GET 请求封装"""
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}{endpoint}",
            params=params,
            headers=HEADERS,
            timeout=30
        )
        r.raise_for_status()
        return r.json()

async def main():
    # 示例：搜索用户
    result = await xhs_get("/api/v1/xiaohongshu/web/search_users", {"keyword": "美食"})
    users = result["data"]["data"]["users"]
    print(f"找到 {len(users)} 个用户")
    for u in users[:3]:
        print(f"  {u['name']} - {u.get('sub_title', '')}")

asyncio.run(main())
```

## 工作流程

1. **明确需求**：抓用户信息？笔记列表？评论？搜索结果？
2. **提取 ID**：
   - 用户 URL：`xiaohongshu.com/user/profile/5c1234...` → user_id = `5c1234...`
   - 笔记 URL：`xiaohongshu.com/explore/6622d8...` → note_id = `6622d8...`
3. **先验证**：调一条数据，打印结构后再批量
4. **批量抓取**：循环翻页（cursor）直到数据为空
5. **导出**：保存 JSON 或 Excel 到工作区

## 批量抓取用户所有笔记

```python
import asyncio, os, json, httpx
from datetime import datetime

BASE_URL = "https://api.tikhub.io"
HEADERS = {"Authorization": f"Bearer {os.environ.get('TIKHUB_API_KEY')}"}

async def get_all_notes(user_id: str):
    all_notes = []
    cursor = None
    page = 1

    async with httpx.AsyncClient() as client:
        while True:
            params = {"user_id": user_id}
            if cursor:
                params["cursor"] = cursor

            r = await client.get(
                f"{BASE_URL}/api/v1/xiaohongshu/app/get_user_notes",
                params=params, headers=HEADERS, timeout=30
            )
            data = r.json()

            inner = data.get("data", {}).get("data", {})
            notes = inner.get("notes", [])
            all_notes.extend(notes)

            print(f"第 {page} 页，已抓取 {len(all_notes)} 条")

            cursor = inner.get("cursor")
            has_more = inner.get("has_more", False)
            if not has_more or not cursor:
                break

            page += 1
            await asyncio.sleep(0.5)  # 防限流

    return all_notes

async def main():
    user_id = "YOUR_USER_ID"  # 替换为实际 user_id
    notes = await get_all_notes(user_id)

    with open("notes.json", "w", encoding="utf-8") as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)
    print(f"完成，共 {len(notes)} 条笔记，已保存到 notes.json")

asyncio.run(main())
```

## 解析响应数据

```python
# 用户信息响应结构
user_data = result["data"]["data"]
nickname = user_data.get("nickname")
fans = user_data.get("fans")
notes_count = user_data.get("noteCount")

# 用户笔记列表结构
inner = result["data"]["data"]
notes = inner.get("notes", [])
for note in notes:
    note_id = note.get("id")          # 笔记 ID
    title = note.get("display_title")  # 标题
    likes = note.get("likes")          # 点赞数
    desc = note.get("desc")            # 描述

# 搜索用户结构
users = result["data"]["data"]["users"]
for user in users:
    uid = user.get("id")
    name = user.get("name")
    fans_text = user.get("sub_title")  # 如 "粉丝 16.1万"

# 笔记详情结构（get_note_info 响应）
# 注意：data 是列表，note_list 也是列表
note = result["data"]["data"][0]["note_list"][0]
title      = note.get("title")
desc       = note.get("desc")
note_type  = note.get("type")           # "normal"（图文）或 "video"
author     = note.get("user", {})
  # author["userid"], author["nickname"]
images_list = note.get("images_list", [])  # 图文笔记的图片列表
video_info  = note.get("video", {})        # 视频笔记的视频信息

# ⚠️ interact_info 为空！互动数据在顶层字段：
liked_count     = note.get("liked_count", 0)      # 点赞数
collected_count = note.get("collected_count", 0)  # 收藏数
comments_count  = note.get("comments_count", 0)   # 评论数
shared_count    = note.get("shared_count", 0)     # 分享数
view_count      = note.get("view_count", 0)       # 浏览数
topics     = note.get("topics", [])        # 话题标签，每项有 name 字段
pub_ts     = note.get("time")              # 发布时间戳（秒，非毫秒！）
ip_loc     = note.get("ip_location")       # 发布 IP 归属地
# 时间转换：datetime.fromtimestamp(pub_ts).strftime('%Y-%m-%d %H:%M')

# 封面提取
if note.get("type") == "video":
    thumb = note.get("video", {}).get("thumbnail", "")
    cover_url = f"https://sns-na-i4.xhscdn.com/{thumb}" if thumb else None
else:
    imgs = note.get("images_list", [])
    cover_url = imgs[0].get("original") if imgs else None  # 原图
    # 或压缩版：imgs[0].get("url")
```

## 数据导出为 Excel

```python
import pandas as pd

# notes 是从 API 获取的列表
df = pd.DataFrame([{
    "笔记ID": n.get("id"),
    "标题": n.get("display_title"),
    "点赞": n.get("likes", 0),
    "描述": n.get("desc", "")
} for n in notes])

print(f"导出前验证 - {len(df)} 行，列：{list(df.columns)}")
print(df.head(2).to_string())

df.to_excel("xhs_notes.xlsx", index=False)
print("已保存到 xhs_notes.xlsx")
```

## 常见问题

- **400 错误**：该端点需要额外的 XHS cookies，换用 `share_text` 参数或换其他端点
- **401 错误**：`TIKHUB_API_KEY` 环境变量未正确设置
- **429 限流**：每次请求间加 `await asyncio.sleep(0.5~1)` 延迟，不要无限重试
- **分享链接**：`xhslink.com` 短链可直接作为 `share_text` 传入，API 会自动解析
- **cursor 为 None**：第一次请求不传 cursor，返回数据中的 `cursor` 用于下一页
- **封面链接有时效性**：CDN URL 带签名参数（`sign=...&t=...`），抓取后立即下载，不要只存链接

## API 基础信息

- **Base URL**: `https://api.tikhub.io`
- **鉴权**: `Authorization: Bearer {TIKHUB_API_KEY}`
- **文档**: `https://api.tikhub.io`（Swagger UI）
- **定价**: $0.001/次，详细定价见 [TikHub Pricing](https://user.tikhub.io/dashboard/pricing)
- **响应缓存**: 成功请求会缓存 24 小时，重复请求不额外计费
