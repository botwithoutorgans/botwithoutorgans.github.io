const fs = require('fs');
const path = require('path');

console.log('Fixing audio filenames to use simple single-word names...');

const interviewsPath = path.join(__dirname, '../public/interviews-data.json');
const interviewsData = JSON.parse(fs.readFileSync(interviewsPath, 'utf8'));

console.log(`Found ${interviewsData.interviews.length} interviews to update`);

// Simple mapping based on titles
const simplifiedNames = {
  'Animal': 'Animal.mp3',
  'Boisson': 'Boisson.mp3', 
  'Culture': 'Culture.mp3',
  'Désir': 'Desire.mp3',
  'Enfance': 'Enfance.mp3',
  'Fidélité': 'Fidelite.mp3',
  'Gauche': 'Gauche.mp3',
  'Histoire de la philosophie': 'Histoire.mp3', // Combine both parts
  'Idée': 'Idee.mp3',
  'Joie': 'Joie.mp3',
  'Kant': 'Kant.mp3',
  'Littérature': 'Litterature.mp3',
  'Maladie': 'Maladie.mp3',
  'Neurologie': 'Neurologie.mp3',
  'Opéra': 'Opera.mp3',
  'Professeur': 'Professeur.mp3', // Combine both parts
  'Question': 'Question.mp3',
  'Résistance': 'Resistance.mp3',
  'Style': 'Style.mp3',
  'Tennis': 'Tennis.mp3',
  'Un': 'Un.mp3',
  'Voyage': 'Voyage.mp3',
  'Wittgenstein': 'Wittgenstein.mp3',
  'Zig zag': 'Zigzag.mp3'
};

// Update each interview's audioFilename
interviewsData.interviews.forEach(interview => {
  const title = interview.title;
  const newAudioFilename = simplifiedNames[title];
  
  if (newAudioFilename) {
    interview.audioFilename = newAudioFilename;
    console.log(`✓ Updated ${interview.letter} - ${title}: ${newAudioFilename}`);
  } else {
    console.log(`⚠️ No mapping found for title: ${title}`);
  }
});

// Update metadata
interviewsData.metadata.processedAt = new Date().toISOString();
interviewsData.metadata.audioFormat = "MP3 (compressed)";
interviewsData.metadata.note = "Audio files simplified and compressed for web delivery";

// Write updated data
fs.writeFileSync(interviewsPath, JSON.stringify(interviewsData, null, 2));

console.log('✅ Audio filenames updated successfully!');
console.log(`Total interviews: ${interviewsData.metadata.totalInterviews}`);
console.log(`Total words: ${interviewsData.metadata.totalWords.toLocaleString()}`); 