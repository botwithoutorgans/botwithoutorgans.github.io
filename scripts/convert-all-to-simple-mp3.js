const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '../public/audio');

// Mapping from actual M4A filenames to simple MP3 names
const fileMapping = {
  'Animal.m4a': 'Animal.mp3',
  'Boisson.m4a': 'Boisson.mp3',
  'Culture.m4a': 'Culture.mp3',
  'Désir.m4a': 'Desire.mp3',
  'Enfance.m4a': 'Enfance.mp3',
  'Fidélité.m4a': 'Fidelite.mp3',
  'Gauche.m4a': 'Gauche.mp3',
  'Histoire.m4a': 'Histoire.mp3',
  'Idée.m4a': 'Idee.mp3',
  'Joie.m4a': 'Joie.mp3',
  'Kant.m4a': 'Kant.mp3',
  'Littérature.m4a': 'Litterature.mp3',
  'Maladie.m4a': 'Maladie.mp3',
  'Neurologie.m4a': 'Neurologie.mp3',
  'Opéra.m4a': 'Opera.mp3',
  'Professeur.m4a': 'Professeur.mp3',
  'Question.m4a': 'Question.mp3',
  'Résistance.m4a': 'Resistance.mp3',
  'Style.m4a': 'Style.mp3',
  'Tennis.m4a': 'Tennis.mp3',
  'Un.m4a': 'Un.mp3',
  'Voyage.m4a': 'Voyage.mp3',
  'Wittgenstein.m4a': 'Wittgenstein.mp3',
  'Zig.m4a': 'Zigzag.mp3'
};

console.log('Converting all M4A files to simple MP3 names...');

// Get all M4A files in the directory
const allFiles = fs.readdirSync(audioDir);
const m4aFiles = allFiles.filter(f => f.endsWith('.m4a'));

console.log(`Found ${m4aFiles.length} M4A files:`, m4aFiles.slice(0, 5));

let processed = 0;
const totalFiles = m4aFiles.length;

m4aFiles.forEach(m4aFile => {
  const inputPath = path.join(audioDir, m4aFile);
  
  // Try to find a good simple name
  let outputName = null;
  
  // Check if it's one of our mapped files
  if (fileMapping[m4aFile]) {
    outputName = fileMapping[m4aFile];
  } else {
    // Generate name from the file
    const baseName = m4aFile.replace('.m4a', '');
    
    // Extract simple words
    if (baseName.includes('Animal')) outputName = 'Animal.mp3';
    else if (baseName.includes('Boisson')) outputName = 'Boisson.mp3';
    else if (baseName.includes('Culture')) outputName = 'Culture.mp3';
    else if (baseName.includes('Désir')) outputName = 'Desire.mp3';
    else if (baseName.includes('Enfance')) outputName = 'Enfance.mp3';
    else if (baseName.includes('Fidélité')) outputName = 'Fidelite.mp3';
    else if (baseName.includes('Gauche')) outputName = 'Gauche.mp3';
    else if (baseName.includes('Histoire')) outputName = 'Histoire.mp3';
    else if (baseName.includes('Idée')) outputName = 'Idee.mp3';
    else if (baseName.includes('Joie')) outputName = 'Joie.mp3';
    else if (baseName.includes('Kant')) outputName = 'Kant.mp3';
    else if (baseName.includes('Littérature')) outputName = 'Litterature.mp3';
    else if (baseName.includes('Maladie')) outputName = 'Maladie.mp3';
    else if (baseName.includes('Neurologie')) outputName = 'Neurologie.mp3';
    else if (baseName.includes('Opéra')) outputName = 'Opera.mp3';
    else if (baseName.includes('Professeur')) outputName = 'Professeur.mp3';
    else if (baseName.includes('Question')) outputName = 'Question.mp3';
    else if (baseName.includes('Résistance')) outputName = 'Resistance.mp3';
    else if (baseName.includes('Style')) outputName = 'Style.mp3';
    else if (baseName.includes('Tennis')) outputName = 'Tennis.mp3';
    else if (baseName.includes('Un')) outputName = 'Un.mp3';
    else if (baseName.includes('Voyage')) outputName = 'Voyage.mp3';
    else if (baseName.includes('Wittgenstein')) outputName = 'Wittgenstein.mp3';
    else if (baseName.includes('Zig')) outputName = 'Zigzag.mp3';
    else {
      console.log(`⚠️ Could not determine simple name for: ${m4aFile}`);
      processed++;
      return;
    }
  }
  
  const outputPath = path.join(audioDir, outputName);
  
  // Skip if MP3 already exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️ ${outputName} already exists, skipping`);
    processed++;
    return;
  }
  
  console.log(`🔄 Converting: ${m4aFile} -> ${outputName}`);
  
  // Convert with compression
  const command = `ffmpeg -i "${inputPath}" -b:a 48k -ar 22050 -ac 1 -y "${outputPath}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error converting ${m4aFile}:`, error.message);
    } else {
      const stats = fs.statSync(outputPath);
      console.log(`✅ Created: ${outputName} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
    }
    
    processed++;
    if (processed === totalFiles) {
      console.log(`\n🎉 Conversion complete! Processed ${totalFiles} files.`);
      
      // List final MP3 files
      const finalMp3s = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
      console.log(`📁 Total MP3 files: ${finalMp3s.length}`);
      
      if (finalMp3s.length >= 24) {
        console.log('🎵 Ready for audio playback!');
      }
    }
  });
}); 