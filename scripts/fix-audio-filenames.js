const fs = require('fs');
const path = require('path');

// Function to generate simplified filename
function generateSimplifiedAudioFilename(originalFilename) {
  const match = originalFilename.match(/([A-Z]) comme (.+?)(?:\s*\(HD\))?\.m4a$/i);
  if (match) {
    const [, letter, title] = match;
    return `${letter}_-_${title.trim().replace(/\s+/g, '_')}.m4a`;
  }
  return originalFilename.replace(/\s+/g, '_');
}

// Read the current interviews data
const interviewsDataPath = path.join(__dirname, '../public/interviews-data.json');
if (!fs.existsSync(interviewsDataPath)) {
  console.error('interviews-data.json not found!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(interviewsDataPath, 'utf8'));

// Update all audio filenames
console.log('Updating audio filenames...');
let updatedCount = 0;

data.interviews.forEach(interview => {
  const originalAudioFilename = interview.audioFilename;
  const newAudioFilename = generateSimplifiedAudioFilename(originalAudioFilename);
  
  if (originalAudioFilename !== newAudioFilename) {
    console.log(`${interview.letter}: ${originalAudioFilename} -> ${newAudioFilename}`);
    interview.audioFilename = newAudioFilename;
    updatedCount++;
  }
});

// Write back the updated data
fs.writeFileSync(interviewsDataPath, JSON.stringify(data, null, 2));
console.log(`Updated ${updatedCount} audio filenames in interviews-data.json`);
console.log('Audio filename update complete!'); 