import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dir = process.cwd();
const token = process.env.GITHUB_TOKEN || process.argv[2];

async function pushRepo() {
  if (!token) {
    console.log('\n⚠️ GitHub Personal Access Token is required to push to https://github.com/himanshid6/moviechatbot.git');
    console.log('Usage:');
    console.log('  node scripts/git-push.js <YOUR_GITHUB_TOKEN>');
    console.log('  or set GITHUB_TOKEN in your .env\n');
    process.exit(1);
  }

  console.log('🚀 Pushing to https://github.com/himanshid6/moviechatbot.git on branch main...');

  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({ username: token }),
    force: false
  });

  console.log('✓ Successfully pushed to GitHub!', pushResult);
}

pushRepo().catch(err => {
  console.error('Push error:', err.message || err);
});
