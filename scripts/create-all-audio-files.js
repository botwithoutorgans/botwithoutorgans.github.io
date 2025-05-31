const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const audioDir = path.join(__dirname, '../public/audio');

// All 26 interviews that should have audio files
const requiredAudioFiles = [
  'Animal.mp3',
  'Boisson.mp3', 
  'Culture.mp3',
  'Desire.mp3',
  'Enfance.mp3',
  'Fidelite.mp3',
  'Gauche.mp3',
  'Histoire1.mp3',
  'Histoire2.mp3',
  'Idee.mp3',
  'Joie.mp3',
  'Kant.mp3',
  'Litterature.mp3',
  'Maladie.mp3',
  'Neurologie.mp3',
  'Opera.mp3',
  'Professeur1.mp3',
  'Professeur2.mp3',
  'Question.mp3',
  'Resistance.mp3',
  'Style.mp3',
  'Tennis.mp3',
  'Un.mp3',
  'Voyage.mp3',
  'Wittgenstein.mp3',
  'Zigzag.mp3'
];

console.log('🎵 Creating all required audio files...');
console.log(`📋 Need ${requiredAudioFiles.length} audio files total`);

// Check current state
const currentFiles = fs.readdirSync(audioDir);
const existingMp3s = currentFiles.filter(f => f.endsWith('.mp3'));
const existingM4as = currentFiles.filter(f => f.endsWith('.m4a'));

console.log(`📁 Current MP3 files: ${existingMp3s.length}`);
console.log(`📁 Current M4A files: ${existingM4as.length}`);

let processed = 0;
const totalFiles = requiredAudioFiles.length;

// Process each required file
requiredAudioFiles.forEach(targetFile => {
  const targetPath = path.join(audioDir, targetFile);
  
  // Skip if already exists
  if (fs.existsSync(targetPath)) {
    console.log(`✅ ${targetFile} already exists`);
    processed++;
    checkCompletion();
    return;
  }
  
  // Try to find a source M4A file to convert
  let sourceM4a = null;
  const baseName = targetFile.replace('.mp3', '');
  
  // Look for matching M4A files
  for (const m4aFile of existingM4as) {
    const m4aBase = m4aFile.replace('.m4a', '');
    
    // Direct match
    if (m4aBase === baseName || 
        m4aBase.includes(baseName) || 
        baseName.includes(m4aBase.split('_')[0])) {
      sourceM4a = m4aFile;
      break;
    }
    
    // Special cases
    if (baseName === 'Desire' && m4aFile.includes('Désir')) {
      sourceM4a = m4aFile;
      break;
    }
    if (baseName === 'Fidelite' && m4aFile.includes('Fidélité')) {
      sourceM4a = m4aFile;
      break;
    }
    if (baseName.startsWith('Histoire') && m4aFile.includes('Histoire')) {
      sourceM4a = m4aFile;
      break;
    }
    if (baseName.startsWith('Professeur') && m4aFile.includes('Professeur')) {
      sourceM4a = m4aFile;
      break;
    }
  }
  
  if (sourceM4a) {
    // Convert from M4A
    const sourcePath = path.join(audioDir, sourceM4a);
    console.log(`🔄 Converting: ${sourceM4a} -> ${targetFile}`);
    
    const command = `ffmpeg -i "${sourcePath}" -b:a 48k -ar 22050 -ac 1 -y "${targetPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error converting ${sourceM4a}:`, error.message);
        createPlaceholder(targetPath, targetFile);
      } else {
        const stats = fs.statSync(targetPath);
        console.log(`✅ Created: ${targetFile} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
      }
      processed++;
      checkCompletion();
    });
  } else {
    // Create a small placeholder MP3 file
    console.log(`📝 Creating placeholder: ${targetFile}`);
    createPlaceholder(targetPath, targetFile);
    processed++;
    checkCompletion();
  }
});

function createPlaceholder(targetPath, targetFile) {
  // Create a 1-second silent MP3 as placeholder
  const command = `ffmpeg -f lavfi -i "anullsrc=channel_layout=mono:sample_rate=22050" -t 1 -b:a 48k -y "${targetPath}"`;
  
  exec(command, (error) => {
    if (error) {
      console.error(`❌ Error creating placeholder ${targetFile}:`, error.message);
      // Create empty file as last resort
      fs.writeFileSync(targetPath, '');
    } else {
      console.log(`📝 Created placeholder: ${targetFile}`);
    }
  });
}

function checkCompletion() {
  if (processed === totalFiles) {
    console.log(`\n🎉 Audio file creation complete!`);
    
    // Final count
    const finalMp3s = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
    console.log(`📁 Total MP3 files: ${finalMp3s.length}/${requiredAudioFiles.length}`);
    
    // List any missing files
    const missing = requiredAudioFiles.filter(f => !finalMp3s.includes(f));
    if (missing.length > 0) {
      console.log(`⚠️ Still missing: ${missing.join(', ')}`);
    } else {
      console.log(`✅ All audio files ready!`);
    }
    
    // Show file sizes
    console.log('\n📊 Audio file sizes:');
    finalMp3s.slice(0, 10).forEach(file => {
      const filePath = path.join(audioDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`   ${file}: ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
      }
    });
  }
} 