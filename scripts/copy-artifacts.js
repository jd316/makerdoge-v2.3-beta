const fs = require('fs-extra');
const path = require('path');

async function copyArtifacts() {
  const sourceDir = path.join(__dirname, '..', 'artifacts', 'contracts');
  const targetDir = path.join(__dirname, '..', 'frontend', 'src', 'artifacts', 'contracts');

  try {
    await fs.ensureDir(targetDir);
    await fs.copy(sourceDir, targetDir);
    console.log('Artifacts copied successfully');
  } catch (err) {
    console.error('Error copying artifacts:', err);
  }
}

copyArtifacts();
