const fs = require('fs');
const path = require('path');

// Mapping from old complex filenames to new simple ones
const filenameMapping = {
  "L'Abécédaire de GILLES DELEUZE - A comme Animal  (HD).m4a.txt": "Animal.mp3",
  "L'Abécédaire de GILLES DELEUZE - B comme Boisson  (HD).m4a.txt": "Boisson.mp3", 
  "L'Abécédaire de GILLES DELEUZE  - C comme Culture  (HD).m4a.txt": "Culture.mp3",
  "L'Abécédaire de GILLES DELEUZE  - D comme Désir  (HD).m4a.txt": "Desire.mp3",
  "L'Abécédaire de GILLES DELEUZE  - E comme Enfance  (HD).m4a.txt": "Enfance.mp3",
  "L'Abécédaire de GILLES DELEUZE  - F comme Fidélité. (HD).m4a.txt": "Fidelite.mp3",
  "L'Abécédaire de GILLES DELEUZE  - G comme Gauche  (HD).m4a.txt": "Gauche.mp3",
  "L'Abecedaire de GILLES DELEUZE -  H comme Histoire de la philosophie Part I.m4a.txt": "Histoire1.mp3",
  "L'Abecedaire de GILLES DELEUZE -  H comme Histoire de la philosophie Part II.m4a.txt": "Histoire2.mp3",
  "L'Abecedaire de GILLES DELEUZE -  I comme Idée.m4a.txt": "Idee.mp3",
  "L'Abecedaire de GILLES DELEUZE - J comme Joie.m4a.txt": "Joie.mp3",
  "L'Abecedaire de GILLES DELEUZE - K comme Kant.m4a.txt": "Kant.mp3",
  "L'Abecedaire de GILLES DELEUZE - L comme Littérature.m4a.txt": "Litterature.mp3",
  "L'Abécédaire de GILLES DELEUZE - M comme Maladie  (HD).m4a.txt": "Maladie.mp3",
  "L'Abecedaire de GILLES DELEUZE - N comme Neurologie.m4a.txt": "Neurologie.mp3",
  "L'Abecedaire de GILLES DELEUZE - O comme Opéra.m4a.txt": "Opera.mp3",
  "L'Abécédaire de GILLES DELEUZE -   P comme Professeur Part 1.m4a.txt": "Professeur1.mp3",
  "L'Abécédaire de GILLES DELEUZE -   P comme Professeur Part 2.m4a.txt": "Professeur2.mp3",
  "L'Abécédaire de GILLES DELEUZE -  Q comme Question.m4a.txt": "Question.mp3",
  "L'Abécédaire de GILLES DELEUZE - R comme Résistance  (HD).m4a.txt": "Resistance.mp3",
  "L'Abécédaire de GILLES DELEUZE  - S comme Style  (HD).m4a.txt": "Style.mp3",
  "L'Abécédaire de GILLES DELEUZE -  T comme Tennis.m4a.txt": "Tennis.mp3",
  "L'Abécédaire de GILLES DELEUZE -  U comme Un.m4a.txt": "Un.mp3",
  "L'Abécédaire de GILLES DELEUZE - V comme Voyage  (HD).m4a.txt": "Voyage.mp3",
  "L'Abécédaire de GILLES DELEUZE - W comme Wittgenstein.m4a.txt": "Wittgenstein.mp3",
  "L'Abécédaire de GILLES DELEUZE - Z comme Zig zag.m4a.txt": "Zigzag.mp3"
};

console.log('Updating interviews data with simplified audio filenames...');

const interviewsPath = path.join(__dirname, '../public/interviews-data.json');

// Read current interviews data
const interviewsData = JSON.parse(fs.readFileSync(interviewsPath, 'utf8'));

console.log(`Found ${interviewsData.interviews.length} interviews to update`);

// Update each interview's audioFilename
interviewsData.interviews.forEach(interview => {
  const oldFilename = interview.filename;
  const newAudioFilename = filenameMapping[oldFilename];
  
  if (newAudioFilename) {
    interview.audioFilename = newAudioFilename;
    console.log(`✓ Updated ${interview.letter} - ${interview.title}: ${newAudioFilename}`);
  } else {
    console.log(`⚠️ No mapping found for: ${oldFilename}`);
  }
});

// Update metadata
interviewsData.metadata.processedAt = new Date().toISOString();
interviewsData.metadata.audioFormat = "MP3 (compressed)";
interviewsData.metadata.note = "Audio files simplified and compressed for web delivery";

// Write updated data
fs.writeFileSync(interviewsPath, JSON.stringify(interviewsData, null, 2));

console.log('✅ Interviews data updated successfully!');
console.log(`Total interviews: ${interviewsData.metadata.totalInterviews}`);
console.log(`Total words: ${interviewsData.metadata.totalWords.toLocaleString()}`); 