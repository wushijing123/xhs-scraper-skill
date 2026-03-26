#!/usr/bin/env node
/**
 * bubu-xhs-scraper-skill installer
 * Installs the XHS Scraper skill to ~/.claude/skills/
 *
 * Usage:
 *   npx bubu-xhs-scraper-skill
 *   npx bubu-xhs-scraper-skill install
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKILL_NAME = 'bubu-xhs-scraper-skill';
const SKILLS_DIR = join(homedir(), '.claude', 'skills');
const TARGET_DIR = join(SKILLS_DIR, SKILL_NAME);
const SKILL_FILE = join(__dirname, '..', 'skills', SKILL_NAME, 'SKILL.md');

function printBanner() {
  console.log('\x1b[36m');
  console.log('╔══════════════════════════════════╗');
  console.log('║     bubu-xhs-scraper-skill v1.1.0     ║');
  console.log('║   Claude Code Skill Installer    ║');
  console.log('╚══════════════════════════════════╝');
  console.log('\x1b[0m');
}

function install() {
  printBanner();

  // Create skills directory if needed
  if (!existsSync(SKILLS_DIR)) {
    mkdirSync(SKILLS_DIR, { recursive: true });
    console.log(`\x1b[32m✓ Created ${SKILLS_DIR}\x1b[0m`);
  }

  // Create skill directory
  mkdirSync(TARGET_DIR, { recursive: true });

  // Copy SKILL.md
  const skillContent = readFileSync(SKILL_FILE, 'utf8');
  writeFileSync(join(TARGET_DIR, 'SKILL.md'), skillContent);

  console.log(`\x1b[32m✓ Installed skill to: ${TARGET_DIR}\x1b[0m\n`);

  console.log('\x1b[33m📋 Setup required:\x1b[0m');
  console.log('  1. Get a TikHub API key at \x1b[4mhttps://user.tikhub.io\x1b[0m');
  console.log('  2. Add to ~/.claude/settings.json:');
  console.log('\x1b[90m     {');
  console.log('       "env": {');
  console.log('         "TIKHUB_API_KEY": "your-api-key-here"');
  console.log('       }');
  console.log('     }\x1b[0m\n');

  console.log('  3. Install Python dependency:');
  console.log('\x1b[90m     pip3 install httpx\x1b[0m\n');

  console.log('\x1b[32m✨ Done! Restart Claude Code and ask it to scrape XHS data.\x1b[0m');
  console.log('\x1b[90m   Example: "帮我抓取这条小红书笔记的数据：<url>"\x1b[0m\n');
}

const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === '--help' || cmd === '-h') {
  console.log('Usage: npx bubu-xhs-scraper-skill [install]');
  console.log('Installs the XHS Scraper skill for Claude Code.');
} else {
  // Default action is install
  install();
}
