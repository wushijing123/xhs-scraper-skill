---
name: xhs-scraper
description: 多平台社交媒体数据抓取工具，基于 TikHub API。支持小红书、抖音、TikTok、Bilibili、微博、YouTube、微信公众号、视频号、Twitter/X。触发词：「小红书」「抖音」「TikTok」「B站」「bilibili」「微博」「YouTube」「公众号」「视频号」「Twitter」「X平台」「抓取数据」「获取用户」「搜索」「评论」「笔记」「视频」。只要用户提到这些平台 + 数据需求，立即触发此 skill。
version: 1.1.0
metadata:
  openclaw:
    requires:
      env:
        - TIKHUB_API_KEY
      bins:
        - python3
    primaryEnv: TIKHUB_API_KEY
    emoji: 🔍
    homepage: https://github.com/wushijing123/xhs-scraper-skill
    setup:
      command: pip3 install httpx
---

# 多平台数据抓取 Skill（TikHub API）

## 概述

通过 TikHub API 直接 HTTP 调用抓取多平台数据。API key 存储在环境变量 `TIKHUB_API_KEY` 中，**无需用户提供**。

> **重要**：不要使用 `tikhub` Python SDK，它的端点已过时。直接用 `httpx` 调用 API。

## 支持平台一览

| 平台 | 用户信息 | 内容列表 | 内容详情 | 评论 | 搜索 | 热搜 |
|------|---------|---------|---------|------|------|------|
| 小红书 | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| 抖音 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TikTok | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bilibili | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 微博 | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| 微信公众号 | — | ✅ | ✅ | ✅ | — | — |
| 微信视频号 | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Twitter / X | ✅ | ✅ | — | — | ✅ | — |
| YouTube | — | — | — | — | ✅ | — |

## 安装依赖

```bash
pip3 install httpx
```

## 标准代码模板

```python
import asyncio, os, httpx

BASE_URL = "https://api.tikhub.io"
HEADERS = {"Authorization": f"Bearer {os.environ.get('TIKHUB_API_KEY')}"}

async def api_get(endpoint: str, params: dict) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE_URL}{endpoint}", params=params, headers=HEADERS, timeout=30)
        r.raise_for_status()
        return r.json()
```

---

## 平台一：小红书（Xiaohongshu）

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 搜索用户 | `GET /api/v1/xiaohongshu/web/search_users` | `keyword`, `page` |
| 获取用户信息（Web） | `GET /api/v1/xiaohongshu/web/get_user_info` | `user_id` |
| 获取用户信息（App） | `GET /api/v1/xiaohongshu/app/get_user_info` | `user_id` |
| 获取用户笔记（Web） | `GET /api/v1/xiaohongshu/web/get_user_notes_v2` | `user_id`, `cursor` |
| 获取用户笔记（App） | `GET /api/v1/xiaohongshu/app/get_user_notes` | `user_id`, `cursor` |
| 获取笔记详情 | `GET /api/v1/xiaohongshu/app/get_note_info` | `note_id` 或 `share_text` |
| 获取笔记评论 | `GET /api/v1/xiaohongshu/app/get_note_comments` | `note_id` |
| 按话题获取笔记 | `GET /api/v1/xiaohongshu/app/get_notes_by_topic` | `topic_id` |
| 首页推荐 | `GET /api/v1/xiaohongshu/web/get_home_recommend` | 无 |

### 响应要点

- **笔记详情路径**：`data["data"][0]["note_list"][0]`
- **互动数**：`liked_count` / `collected_count` / `comments_count` / `shared_count` 在顶层，`interact_info` 始终为空
- **时间戳**：秒级，用 `datetime.fromtimestamp(ts)`
- **封面图**：`images_list[0]["original"]`（原图）或 `["url"]`（压缩版），CDN 有时效，立即下载
- `note_id` 优先于 `share_text`；`xhslink.com` 短链可直接作为 `share_text`

### ID 提取

```
用户ID：https://www.xiaohongshu.com/user/profile/{user_id}
笔记ID：https://www.xiaohongshu.com/explore/{note_id}
```

---

## 平台二：抖音（Douyin）

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取用户主页 | `GET /api/v1/douyin/web/handler_user_profile` | `unique_id` 或 `sec_user_id` |
| 获取用户视频列表 | `GET /api/v1/douyin/web/fetch_user_post_videos` | `sec_user_id`, `max_cursor` |
| 获取单条视频 | `GET /api/v1/douyin/web/fetch_one_video` | `aweme_id` |
| 通过分享链接获取视频 | `GET /api/v1/douyin/web/fetch_one_video_by_share_url` | `share_url` |
| 获取视频评论 | `GET /api/v1/douyin/web/fetch_video_comments` | `aweme_id`, `cursor` |
| 搜索用户 | `GET /api/v1/douyin/web/fetch_user_search_result` | `keyword`, `cursor` |
| 搜索视频 | `GET /api/v1/douyin/web/fetch_video_search_result` | `keyword`, `cursor` |
| 热搜榜 | `GET /api/v1/douyin/web/fetch_hot_search_result` | 无 |

### 备用端点（App 版，Web 失败时用）

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取用户主页 | `GET /api/v1/douyin/app/v3/handler_user_profile` | `sec_user_id` |
| 获取用户视频 | `GET /api/v1/douyin/app/v3/fetch_user_post_videos` | `sec_user_id`, `max_cursor` |
| 获取单条视频 | `GET /api/v1/douyin/app/v3/fetch_one_video` | `aweme_id` |
| 通过分享链接获取视频 | `GET /api/v1/douyin/app/v3/fetch_one_video_by_share_url` | `share_url` |
| 搜索视频 | `GET /api/v1/douyin/app/v3/fetch_video_search_result` | `keyword`, `cursor` |

### 响应要点

- `unique_id` = 抖音号（@xxx），`sec_user_id` = URL 中的长 ID
- 视频列表翻页用 `max_cursor`（不是 `cursor`）
- 从 URL 提取 `aweme_id`：`douyin.com/video/{aweme_id}`

### ID 提取

```
sec_user_id：https://www.douyin.com/user/{sec_user_id}
aweme_id：https://www.douyin.com/video/{aweme_id}
```

---

## 平台三：TikTok

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取用户主页 | `GET /api/v1/tiktok/web/fetch_user_profile` | `uniqueId` |
| 获取用户视频 | `GET /api/v1/tiktok/web/fetch_user_post` | `secUid`, `cursor`, `count` |
| 获取视频详情 | `GET /api/v1/tiktok/web/fetch_post_detail` | `itemId` |
| 通过分享链接获取视频 | `GET /api/v1/tiktok/app/v3/fetch_one_video_by_share_url` | `share_url` |
| 获取视频评论 | `GET /api/v1/tiktok/web/fetch_post_comment` | `aweme_id`, `cursor` |
| 搜索用户 | `GET /api/v1/tiktok/web/fetch_search_user` | `keyword`, `cursor` |
| 搜索视频 | `GET /api/v1/tiktok/web/fetch_search_video` | `keyword`, `count`, `offset` |
| 热门话题 | `GET /api/v1/tiktok/web/fetch_trending_searchwords` | 无 |

### 备用端点（App 版，Web 失败时用）

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取用户主页 | `GET /api/v1/tiktok/app/v3/handler_user_profile` | `sec_user_id` |
| 获取用户视频 | `GET /api/v1/tiktok/app/v3/fetch_user_post_videos` | `sec_user_id`, `max_cursor` |
| 获取单条视频 | `GET /api/v1/tiktok/app/v3/fetch_one_video` | `aweme_id` |
| 搜索用户 | `GET /api/v1/tiktok/app/v3/fetch_user_search_result` | `keyword`, `cursor` |
| 搜索视频 | `GET /api/v1/tiktok/app/v3/fetch_video_search_result` | `keyword`, `cursor` |

### 响应要点

- `uniqueId` = @用户名（不含@），`secUid` = URL 中的长 ID
- 先用 `uniqueId` 调用 `fetch_user_profile` 拿到 `secUid`，再翻页获取视频
- 视频列表翻页用 `cursor`

### ID 提取

```
uniqueId：https://www.tiktok.com/@{uniqueId}
itemId：https://www.tiktok.com/@xxx/video/{itemId}
```

---

## 平台四：Bilibili

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取用户主页 | `GET /api/v1/bilibili/web/fetch_user_profile` | `uid` |
| 获取用户视频 | `GET /api/v1/bilibili/web/fetch_user_post_videos` | `uid`, `page`, `pagesize` |
| 获取视频详情 | `GET /api/v1/bilibili/web/fetch_one_video` | `bvid` 或 `aid` |
| 获取视频详情 v2 | `GET /api/v1/bilibili/web/fetch_video_detail` | `bvid` |
| 获取视频评论 | `GET /api/v1/bilibili/web/fetch_video_comments` | `bvid`, `page` |
| 综合搜索 | `GET /api/v1/bilibili/web/fetch_general_search` | `keyword`, `page` |
| 热搜 | `GET /api/v1/bilibili/web/fetch_hot_search` | 无 |

### 备用端点（App 版，Web 失败时用）

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取用户信息 | `GET /api/v1/bilibili/app/fetch_user_info` | `uid` |
| 获取用户视频 | `GET /api/v1/bilibili/app/fetch_user_videos` | `uid`, `page` |
| 获取视频详情 | `GET /api/v1/bilibili/app/fetch_one_video` | `bvid` |
| 获取视频评论 | `GET /api/v1/bilibili/app/fetch_video_comments` | `bvid`, `page` |
| 综合搜索 | `GET /api/v1/bilibili/app/fetch_search_all` | `keyword`, `page` |

### 响应要点

- `uid` = 数字用户 ID
- `bvid` = BV 号（如 `BV1xx411c7mD`），`aid` = AV 号（数字）
- 视频列表翻页用 `page`（从 1 开始），`pagesize` 默认 30

### ID 提取

```
uid：https://space.bilibili.com/{uid}
bvid：https://www.bilibili.com/video/{bvid}
```

---

## 平台五：微博（Weibo）

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取用户信息 | `GET /api/v1/weibo/app/fetch_user_info` | `uid` 或 `screen_name` |
| 获取用户微博 | `GET /api/v1/weibo/web/fetch_user_posts` | `uid`, `page` |
| 获取用户视频 | `GET /api/v1/weibo/web_v2/fetch_user_video_list` | `uid`, `page` |
| 搜索（综合） | `GET /api/v1/weibo/web/fetch_search` | `keyword`, `page` |
| 搜索用户 | `GET /api/v1/weibo/web_v2/fetch_user_search` | `keyword`, `page` |
| 搜索视频 | `GET /api/v1/weibo/web_v2/fetch_video_search` | `keyword`, `page` |
| 热搜榜 | `GET /api/v1/weibo/app/fetch_hot_search` | 无 |
| AI 热点搜索 | `GET /api/v1/weibo/web_v2/fetch_ai_search` | `keyword` |
| 高级搜索 | `GET /api/v1/weibo/web_v2/fetch_advanced_search` | `keyword`, `page` |

### 响应要点

- `uid` = 数字 ID，`screen_name` = 微博昵称
- 翻页用 `page`（从 1 开始）

### ID 提取

```
uid：https://weibo.com/u/{uid}
     https://weibo.com/{screen_name}（昵称直接用）
```

---

## 平台六：YouTube

> ⚠️ **目前仅支持搜索**，暂无频道详情或视频详情端点。

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 综合搜索 | `GET /api/v1/youtube/web_v2/get_general_search` | `keyword` |
| 搜索频道 | `GET /api/v1/youtube/web_v2/search_channels` | `keyword` |
| 搜索视频 | `GET /api/v1/youtube/web/search_video` | `keyword` |
| 搜索 Shorts | `GET /api/v1/youtube/web_v2/get_shorts_search` | `keyword` |
| 搜索建议词 | `GET /api/v1/youtube/web_v2/get_search_suggestions` | `keyword` |

---

## 平台七：微信公众号（WeChat MP）

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取文章详情（JSON） | `GET /api/v1/wechat_mp/web/fetch_mp_article_detail_json` | `url` |
| 获取文章详情（HTML） | `GET /api/v1/wechat_mp/web/fetch_mp_article_detail_html` | `url` |
| 获取公众号文章列表 | `GET /api/v1/wechat_mp/web/fetch_mp_article_list` | `url` 或 `biz` |
| 获取文章评论 | `GET /api/v1/wechat_mp/web/fetch_mp_article_comment_list` | `url` |
| 获取文章阅读数 | `GET /api/v1/wechat_mp/web/fetch_mp_article_read_count` | `url` |
| 获取相关文章 | `GET /api/v1/wechat_mp/web/fetch_mp_related_articles` | `url` |
| 获取文章广告 | `GET /api/v1/wechat_mp/web/fetch_mp_article_ad` | `url` |

### 响应要点

- 所有端点主要参数为文章 `url`（`mp.weixin.qq.com/s/...`）
- `biz` = 公众号唯一标识，从文章 URL 中提取：`__biz=MzI...`

---

## 平台八：微信视频号（WeChat Channels）

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 搜索创作者 | `GET /api/v1/wechat_channels/fetch_user_search` | `keyword` |
| 搜索创作者 v2 | `GET /api/v1/wechat_channels/fetch_user_search_v2` | `keyword` |
| 综合搜索 | `GET /api/v1/wechat_channels/fetch_default_search` | `keyword` |
| 最新内容搜索 | `GET /api/v1/wechat_channels/fetch_search_latest` | `keyword` |
| 普通内容搜索 | `GET /api/v1/wechat_channels/fetch_search_ordinary` | `keyword` |
| 获取视频详情 | `GET /api/v1/wechat_channels/fetch_video_detail` | `video_id` 或 `url` |
| 获取视频评论 | `GET /api/v1/wechat_channels/fetch_comments` | `video_id` |
| 主页内容 | `GET /api/v1/wechat_channels/fetch_home_page` | `username` |
| 热词 | `GET /api/v1/wechat_channels/fetch_hot_words` | 无 |
| 直播历史 | `GET /api/v1/wechat_channels/fetch_live_history` | `username` |

---

## 平台九：Twitter / X

### 端点列表

| 功能 | 端点 | 主要参数 |
|------|------|---------|
| 获取用户主页 | `GET /api/v1/twitter/web/fetch_user_profile` | `screen_name` 或 `user_id` |
| 获取用户推文 | `GET /api/v1/twitter/web/fetch_user_post_tweet` | `user_id`, `cursor` |
| 搜索推文 | `GET /api/v1/twitter/web/fetch_search_timeline` | `keyword`, `cursor` |

### 响应要点

- `screen_name` = @用户名（不含@），`user_id` = 数字 ID
- 先用 `screen_name` 调 `fetch_user_profile` 获取 `user_id`，再翻页

### ID 提取

```
screen_name：https://twitter.com/{screen_name}
             https://x.com/{screen_name}
```

---

## 批量翻页通用模板

```python
async def fetch_all_pages(endpoint, base_params, cursor_key="cursor", data_key="list"):
    """通用翻页抓取"""
    all_items = []
    cursor = None
    while True:
        params = {**base_params}
        if cursor:
            params[cursor_key] = cursor
        result = await api_get(endpoint, params)
        inner = result.get("data", {}).get("data", {})
        items = inner.get(data_key, [])
        all_items.extend(items)
        has_more = inner.get("has_more", False)
        cursor = inner.get(cursor_key)
        if not has_more or not cursor:
            break
        await asyncio.sleep(0.5)
    return all_items
```

> ⚠️ cursor_key 差异：小红书/TikTok/Twitter 用 `cursor`，抖音用 `max_cursor`，Bilibili/微博用 `page`（数字递增）

---

## 常见问题

| 报错 | 可能原因 | 解决方法 |
|------|---------|---------|
| `400` | 端点需要额外参数或内容已删除 | 换分享链接方式，或换 v2/v3 备用端点 |
| `401` | API Key 未配置 | 检查 `TIKHUB_API_KEY` 环境变量 |
| `429` | 限流 | 每次请求间加 `await asyncio.sleep(0.5~1)` |
| 超时 | VPN/代理冲突 | 切换 VPN 状态，`api.tikhub.io` 可能需要直连 |

## API 基础信息

- **Base URL**: `https://api.tikhub.io`（国内备用：`https://api.tikhub.dev`）
- **鉴权**: `Authorization: Bearer {TIKHUB_API_KEY}`
- **定价**: $0.001/次，详见 [TikHub Pricing](https://user.tikhub.io/dashboard/pricing)
- **缓存**: 成功请求缓存 24 小时，重复请求不额外计费
