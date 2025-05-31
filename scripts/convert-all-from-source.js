const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const audioDir = path.join(__dirname, '../public/audio');

// Mapping from source M4A filenames to simple MP3 names
const sourceToSimpleMapping = {
  "L'Abécédaire de GILLES DELEUZE - A comme Animal  (HD).m4a": "Animal.mp3",
  "L'Abécédaire de GILLES DELEUZE - B comme Boisson  (HD).m4a": "Boisson.mp3",
  "L'Abécédaire de GILLES DELEUZE  - C comme Culture  (HD).m4a": "Culture.mp3",
  "L'Abécédaire de GILLES DELEUZE  - D comme Désir  (HD).m4a": "Desire.mp3",
  "L'Abécédaire de GILLES DELEUZE  - E comme Enfance  (HD).m4a": "Enfance.mp3",
  "L'Abécédaire de GILLES DELEUZE  - F comme Fidélité. (HD).m4a": "Fidelite.mp3",
  "L'Abécédaire de GILLES DELEUZE  - G comme Gauche  (HD).m4a": "Gauche.mp3",
  "L'Abecedaire de GILLES DELEUZE -  H comme Histoire de la philosophie Part I.m4a": "Histoire1.mp3",
  "L'Abecedaire de GILLES DELEUZE -  H comme Histoire de la philosophie Part II.m4a": "Histoire2.mp3",
  "L'Abecedaire de GILLES DELEUZE -  I comme Idée.m4a": "Idee.mp3",
  "L'Abecedaire de GILLES DELEUZE - J comme Joie.m4a": "Joie.mp3",
  "L'Abecedaire de GILLES DELEUZE - K comme Kant.m4a": "Kant.mp3",
  "L'Abecedaire de GILLES DELEUZE - L comme Littérature.m4a": "Litterature.mp3",
  "L'Abécédaire de GILLES DELEUZE - M comme Maladie  (HD).m4a": "Maladie.mp3",
  "L'Abecedaire de GILLES DELEUZE - N comme Neurologie.m4a": "Neurologie.mp3",
  "L'Abecedaire de GILLES DELEUZE - O comme Opéra.m4a": "Opera.mp3",
  "L'Abécédaire de GILLES DELEUZE -   P comme Professeur Part 1.m4a": "Professeur1.mp3",
  "L'Abécédaire de GILLES DELEUZE -   P comme Professeur Part 2.m4a": "Professeur2.mp3",
  "L'Abécédaire de GILLES DELEUZE -  Q comme Question.m4a": "Question.mp3",
  "L'Abécédaire de GILLES DELEUZE - R comme Résistance  (HD).m4a": "Resistance.mp3",
  "L'Abécédaire de GILLES DELEUZE  - S comme Style  (HD).m4a": "Style.mp3",
  "L'Abécédaire de GILLES DELEUZE -  T comme Tennis.m4a": "Tennis.mp3",
  "L'Abécédaire de GILLES DELEUZE -  U comme Un.m4a": "Un.mp3",
  "L'Abécédaire de GILLES DELEUZE - V comme Voyage  (HD).m4a": "Voyage.mp3",
  "L'Abécédaire de GILLES DELEUZE - W comme Wittgenstein.m4a": "Wittgenstein.mp3",
  "L'Abécédaire de GILLES DELEUZE - Z comme Zig zag.m4a": "Zigzag.mp3"
};

console.log('🎵 Converting all source M4A files to optimized MP3s...');
console.log(`📋 Processing ${Object.keys(sourceToSimpleMapping).length} files`);

// Get all M4A files in public/audio
const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.m4a'));
console.log(`📁 Found ${audioFiles.length} M4A files in public/audio`);

let processed = 0;
let successful = 0;
const totalFiles = Object.keys(sourceToSimpleMapping).length;

// Process each mapping
Object.entries(sourceToSimpleMapping).forEach(([sourceFilename, targetFilename]) => {
  const sourcePath = path.join(audioDir, sourceFilename);
  const targetPath = path.join(audioDir, targetFilename);
  
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️ Source not found: ${sourceFilename}`);
    processed++;
    checkCompletion();
    return;
  }
  
  // Check if target already exists and is good size
  if (fs.existsSync(targetPath)) {
    const stats = fs.statSync(targetPath);
    if (stats.size > 1024 * 1024) { // > 1MB means it's real, not placeholder
      console.log(`✅ ${targetFilename} already exists (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
      processed++;
      successful++;
      checkCompletion();
      return;
    } else {
      // Remove small placeholder and recreate
      fs.unlinkSync(targetPath);
    }
  }
  
  console.log(`🔄 Converting: ${sourceFilename.substring(0, 50)}... -> ${targetFilename}`);
  
  // Convert with optimization for web delivery
  // Using 64k bitrate, 22050 Hz, mono for good quality but smaller size
  const command = `ffmpeg -i "${sourcePath}" -b:a 64k -ar 22050 -ac 1 -y "${targetPath}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error converting ${sourceFilename}:`, error.message);
    } else {
      const stats = fs.statSync(targetPath);
      const originalStats = fs.statSync(sourcePath);
      const reduction = ((originalStats.size - stats.size) / originalStats.size * 100).toFixed(1);
      
      console.log(`✅ Created: ${targetFilename}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(1)}MB (${reduction}% reduction)`);
      successful++;
    }
    
    processed++;
    checkCompletion();
  });
});

function checkCompletion() {
  if (processed === totalFiles) {
    console.log(`\n🎉 Conversion complete!`);
    console.log(`✅ Successfully converted: ${successful}/${totalFiles} files`);
    
    // List all MP3 files with sizes
    const mp3Files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
    console.log(`\n📁 Total MP3 files: ${mp3Files.length}`);
    
    console.log('\n📊 Final MP3 file sizes:');
    mp3Files.forEach(file => {
      const filePath = path.join(audioDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(1);
        console.log(`   ${file}: ${size}MB`);
      }
    });
    
    // Calculate total size
    const totalSize = mp3Files.reduce((sum, file) => {
      const filePath = path.join(audioDir, file);
      if (fs.existsSync(filePath)) {
        return sum + fs.statSync(filePath).size;
      }
      return sum;
    }, 0);
    
    console.log(`\n📦 Total MP3 size: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log('🎵 All audio files ready for web delivery!');
  }
} 