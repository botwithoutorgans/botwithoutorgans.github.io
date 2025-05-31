const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '../public/audio');
const compressedDir = path.join(audioDir, 'compressed');

console.log('Compressing MP3 files for better web performance...');

// Create compressed directory if it doesn't exist
if (!fs.existsSync(compressedDir)) {
  fs.mkdirSync(compressedDir);
}

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
        compressFiles();
      }
    });
  } else {
    compressFiles();
  }
});

function compressFiles() {
  const mp3Files = fs.readdirSync(audioDir).filter(file => 
    file.endsWith('.mp3') && !file.includes('compressed')
  );
  
  if (mp3Files.length === 0) {
    console.log('No MP3 files found to compress.');
    return;
  }

  console.log(`Found ${mp3Files.length} MP3 files to compress...`);
  
  let completed = 0;
  const totalFiles = mp3Files.length;
  
  mp3Files.forEach(file => {
    const inputPath = path.join(audioDir, file);
    const outputPath = path.join(audioDir, file); // Replace original
    const tempPath = path.join(compressedDir, file);
    
    console.log(`Compressing: ${file}`);
    
    // Compress with good quality settings for speech:
    // -b:a 64k: 64kbps bitrate (good for speech)
    // -ar 22050: 22kHz sample rate (sufficient for speech)
    // -ac 1: Mono (speech doesn't need stereo)
    const command = `ffmpeg -i "${inputPath}" -b:a 64k -ar 22050 -ac 1 -y "${tempPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error compressing ${file}:`, error.message);
      } else {
        // Replace original with compressed version
        fs.copyFileSync(tempPath, outputPath);
        fs.unlinkSync(tempPath); // Remove temp file
        
        // Check file sizes
        const originalStats = fs.statSync(inputPath);
        const compressedStats = fs.statSync(outputPath);
        const compressionRatio = ((originalStats.size - compressedStats.size) / originalStats.size * 100).toFixed(1);
        
        console.log(`✓ Compressed: ${file}`);
        console.log(`  Original: ${(originalStats.size / 1024 / 1024).toFixed(1)}MB`);
        console.log(`  Compressed: ${(compressedStats.size / 1024 / 1024).toFixed(1)}MB`);
        console.log(`  Reduction: ${compressionRatio}%`);
      }
      
      completed++;
      if (completed === totalFiles) {
        // Cleanup compressed directory
        if (fs.existsSync(compressedDir)) {
          fs.rmSync(compressedDir, { recursive: true });
        }
        
        console.log(`\nCompression complete! ${totalFiles} files processed.`);
        console.log('Audio files are now optimized for web streaming.');
      }
    });
  });
} 