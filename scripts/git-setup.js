import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

const dir = process.cwd();

async function setupAndCommit() {
  console.log('📦 Initializing Git repository...');
  await git.init({ fs, dir, defaultBranch: 'main' });

  // Read all files recursively (excluding ignored)
  const ignoredDirs = new Set(['node_modules', '.git', 'dist']);
  const ignoredFiles = new Set(['cinematch.db', '.env', 'package-lock.json']);

  function getFiles(currentDir, relativePath = '') {
    let results = [];
    const list = fs.readdirSync(currentDir);
    for (const file of list) {
      const filePath = path.join(currentDir, file);
      const relPath = path.join(relativePath, file).replace(/\\/g, '/');
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!ignoredDirs.has(file)) {
          results = results.concat(getFiles(filePath, relPath));
        }
      } else {
        if (!ignoredFiles.has(file) && !file.endsWith('.db') && !file.endsWith('.db-journal') && !file.endsWith('.db-wal')) {
          results.push(relPath);
        }
      }
    }
    return results;
  }

  const filesToAdd = getFiles(dir);
  console.log(`Adding ${filesToAdd.length} files to Git staging...`);

  for (const filepath of filesToAdd) {
    await git.add({ fs, dir, filepath });
  }

  console.log('Committing changes...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'himanshid6',
      email: 'himanshid6@users.noreply.github.com'
    },
    message: 'feat: Initial commit for CineMatch — AI Movie Recommendation Companion'
  });

  console.log(`✓ Committed successfully! Commit SHA: ${sha}`);

  // Set remote origin
  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: 'https://github.com/himanshid6/moviechatbot.git',
    force: true
  });

  console.log('✓ Remote "origin" set to https://github.com/himanshid6/moviechatbot.git');
}

setupAndCommit().catch(err => {
  console.error('Git setup error:', err);
});
