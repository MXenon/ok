// Usage : node scripts/release.js <patch|minor|major>
// Incrémente la version (SemVer) dans package.json, crée le commit et le tag git annoté vX.Y.Z.
// Le push du tag (git push --follow-tags) déclenche le déploiement en production dans Jenkins.
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const bump = process.argv[2];
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage : node scripts/release.js <patch|minor|major>');
  process.exit(1);
}

const cwd = path.join(__dirname, '..');
const run = (cmd, args) => execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();

if (run('git', ['status', '--porcelain'])) {
  console.error('Le dépôt contient des modifications non commitées : commitez-les avant de publier.');
  process.exit(1);
}

const version = run('npm', ['version', bump, '--no-git-tag-version']).replace(/^v/, '');
const tag = `v${version}`;
run('git', ['add', 'package.json', 'package-lock.json']);
run('git', ['commit', '-m', `chore(release): ${tag}`]);
run('git', ['tag', '-a', tag, '-m', `Release ${tag}`]);

console.log(`Version ${tag} créée. Publiez-la avec : git push --follow-tags`);
