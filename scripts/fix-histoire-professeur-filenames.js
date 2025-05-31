const fs = require('fs');
const path = require('path');

console.log('Fixing Histoire and Professeur audio filename references...');

const interviewsPath = path.join(__dirname, '../public/interviews-data.json');
const interviewsData = JSON.parse(fs.readFileSync(interviewsPath, 'utf8'));

console.log(`Found ${interviewsData.interviews.length} interviews to check`);

let histoireCount = 1;
let professeurCount = 1;

// Update each interview's audioFilename for Histoire and Professeur
interviewsData.interviews.forEach(interview => {
  if (interview.title === 'Histoire de la philosophie') {
    const newFilename = `Histoire${histoireCount}.mp3`;
    interview.audioFilename = newFilename;
    console.log(`✓ Updated ${interview.letter} - ${interview.title}: ${newFilename}`);
    histoireCount++;
  } else if (interview.title === 'Professeur') {
    const newFilename = `Professeur${professeurCount}.mp3`;
    interview.audioFilename = newFilename;
    console.log(`✓ Updated ${interview.letter} - ${interview.title}: ${newFilename}`);
    professeurCount++;
  }
});

// Update metadata
interviewsData.metadata.processedAt = new Date().toISOString();
interviewsData.metadata.note = "Audio files simplified and compressed for web delivery - Histoire and Professeur split into parts";

// Write updated data
fs.writeFileSync(interviewsPath, JSON.stringify(interviewsData, null, 2));

console.log('✅ Audio filename references updated successfully!');
console.log(`Total interviews: ${interviewsData.metadata.totalInterviews}`);
console.log(`Total words: ${interviewsData.metadata.totalWords.toLocaleString()}`); 