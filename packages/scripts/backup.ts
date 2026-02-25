import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const BACKUP_DIR = '/home/ubuntu/nanobot-backup';
const REPO_URL = 'https://github.com/colbyfayock/.nanobot.git';
const SOURCE_DIRS = [
  { src: '/home/ubuntu/.nanobot/workspace/', dest: 'workspace/', exclude: ['node_modules', 'dist', '.git'] },
  { src: '/home/ubuntu/.nanobot/cron/jobs.json', dest: 'cron-jobs.json', exclude: [] }
];

function ensureBackupDir(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function cloneOrPullRepo(): void {
  if (!fs.existsSync(path.join(BACKUP_DIR, '.git'))) {
    console.log('Cloning repository...');
    execSync(`git clone ${REPO_URL} .`, { cwd: BACKUP_DIR });
    execSync('git config user.email "cosmo@nanobot.ai"', { cwd: BACKUP_DIR });
    execSync('git config user.name "Nanobot Backup"', { cwd: BACKUP_DIR });
  }
}

function syncFiles(): void {
  for (const dir of SOURCE_DIRS) {
    if (fs.existsSync(dir.src)) {
      const destPath = path.join(BACKUP_DIR, dir.dest);
      const parentDir = path.dirname(destPath);
      
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      if (fs.statSync(dir.src).isDirectory()) {
        console.log(`Syncing ${dir.dest}...`);
        const excludeArgs = dir.exclude.map(e => `--exclude='${e}'`).join(' ');
        execSync(`rsync -av --delete ${excludeArgs} "${dir.src}" "${destPath}"`);
      } else {
        console.log(`Copying ${path.basename(dir.src)}...`);
        fs.copyFileSync(dir.src, destPath);
      }
    }
  }
}

function commitAndPush(): void {
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    execSync('git add -A', { cwd: BACKUP_DIR });
    execSync(`git commit -m "Backup: ${date}"`, { cwd: BACKUP_DIR });
    console.log('Pushing to GitHub...');
    execSync('git push origin main', { cwd: BACKUP_DIR });
    console.log('Backup completed successfully');
  } catch (error) {
    console.log('No changes to backup or push failed');
  }
}

function main(): void {
  console.log(`Starting backup at ${new Date().toISOString()}`);
  
  try {
    ensureBackupDir();
    cloneOrPullRepo();
    syncFiles();
    commitAndPush();
    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
