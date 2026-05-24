const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.html'])
const skipDirs = new Set(['node_modules', '.git', 'build', '.next'])

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else {
      const ext = path.extname(entry.name)
      if (!exts.has(ext)) continue
      let content = fs.readFileSync(full, 'utf8')
      const orig = content
      // Replacements (careful ordering)
      content = content.replace(/\bAutoRevealed\.com\b/gi, 'carreaders.com')
      content = content.replace(/\bAutoRevealed\b/g, 'Carreaders')
      content = content.replace(/\bautorevealed\b/g, 'carreaders')
      content = content.replace(/info@carreaders\.com/gi, 'info@carreaders.com')
      content = content.replace(/Info@carreaders\.com/gi, 'info@carreaders.com')
      content = content.replace(/https:\/\/carreaders\.com/gi, 'https://carreaders.com')

      if (content !== orig) {
        fs.writeFileSync(full, content, 'utf8')
        console.log('Updated', full)
      }
    }
  }
}

console.log('Starting brand rename...')
walk(root)
console.log('Done.')
