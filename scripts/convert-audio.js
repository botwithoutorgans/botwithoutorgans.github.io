const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '../public/audio');

console.log('Converting M4A files to MP3 for better browser compatibility...');

// Check if ffmpeg is available
exec('which ffmpeg', (error) => {
  if (error) {
    console.log('FFmpeg not found. Installing via Homebrew...');
    exec('brew install ffmpeg', (installError) => {
      if (installError) {
        console.error('Failed to install FFmpeg. Please install manually:');
        console.error('brew install ffmpeg');
        process.exit(1);
      } else {
        convertFiles();
      }
    });
  } else {
    convertFiles();
  }
});

function convertFiles() {
  const files = fs.readdirSync(audioDir).filter(file => file.endsWith('.m4a'));
  
  if (files.length === 0) {
    console.log('No M4A files found to convert.');
    return;
  }

  console.log(`Found ${files.length} M4A files to convert...`);
  
  let completed = 0;
  
  files.forEach(file => {
    const inputPath = path.join(audioDir, file);
    const outputPath = path.join(audioDir, file.replace('.m4a', '.mp3'));
    
    // Skip if MP3 already exists
    if (fs.existsSync(outputPath)) {
      console.log(`MP3 already exists: ${file.replace('.m4a', '.mp3')}`);
      completed++;
      if (completed === files.length) {
        console.log('Audio conversion complete!');
      }
      return;
    }
    
    console.log(`Converting: ${file}`);
    
    const command = `ffmpeg -i "${inputPath}" -acodec mp3 -ab 128k "${outputPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting ${file}:`, error.message);
      } else {
        console.log(`✓ Converted: ${file} -> ${file.replace('.m4a', '.mp3')}`);
      }
      
      completed++;
      if (completed === files.length) {
        console.log(`\nConversion complete! ${files.length} files processed.`);
        console.log('MP3 files are now available for better browser compatibility.');
      }
    });
  });
} 