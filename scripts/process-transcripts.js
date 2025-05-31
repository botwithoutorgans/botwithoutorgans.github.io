const fs = require('fs');
const path = require('path');

// This script processes the Deleuze transcript files and creates a JSON data file
// for use in the chatbot application

const TRANSCRIPTS_DIR = path.join(__dirname, '../transcripts');
const OUTPUT_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'interviews-data.json');

// Mapping of letters to their metadata
const INTERVIEW_METADATA = {
  'A': { title: 'Animal', topics: ['animality', 'becoming-animal', 'ethics', 'difference'] },
  'B': { title: 'Boisson', topics: ['drink', 'alcohol', 'pleasure', 'sobriety'] },
  'C': { title: 'Culture', topics: ['culture', 'intellectuals', 'knowledge', 'education'] },
  'D': { title: 'Désir', topics: ['desire', 'unconscious', 'psychoanalysis', 'machines'] },
  'E': { title: 'Enfance', topics: ['childhood', 'memory', 'experience', 'time'] },
  'F': { title: 'Fidélité', topics: ['fidelity', 'friendship', 'loyalty', 'relationships'] },
  'G': { title: 'Gauche', topics: ['left-wing', 'politics', 'revolution', 'resistance'] },
  'H': { title: 'Histoire de la philosophie', topics: ['philosophy', 'history', 'thinkers', 'concepts'] },
  'I': { title: 'Idée', topics: ['ideas', 'concepts', 'thinking', 'creativity'] },
  'J': { title: 'Joie', topics: ['joy', 'affects', 'Spinoza', 'ethics'] },
  'K': { title: 'Kant', topics: ['Kant', 'critique', 'judgment', 'transcendental'] },
  'L': { title: 'Littérature', topics: ['literature', 'writing', 'authors', 'language'] },
  'M': { title: 'Maladie', topics: ['illness', 'body', 'health', 'suffering'] },
  'N': { title: 'Neurologie', topics: ['neurology', 'brain', 'consciousness', 'perception'] },
  'O': { title: 'Opéra', topics: ['opera', 'music', 'art', 'aesthetics'] },
  'P': { title: 'Professeur', topics: ['teaching', 'professor', 'education', 'transmission'] },
  'Q': { title: 'Question', topics: ['questions', 'problems', 'inquiry', 'philosophy'] },
  'R': { title: 'Résistance', topics: ['resistance', 'power', 'politics', 'struggle'] },
  'S': { title: 'Style', topics: ['style', 'writing', 'expression', 'singularity'] },
  'T': { title: 'Tennis', topics: ['tennis', 'sport', 'body', 'movement'] },
  'U': { title: 'Un', topics: ['one', 'unity', 'multiplicity', 'difference'] },
  'V': { title: 'Voyage', topics: ['travel', 'movement', 'nomadism', 'territory'] },
  'W': { title: 'Wittgenstein', topics: ['Wittgenstein', 'language', 'logic', 'philosophy'] },
  'Z': { title: 'Zig zag', topics: ['zigzag', 'movement', 'lines', 'escape'] }
};

function extractLetter(filename) {
  const match = filename.match(/- ([A-Z]) comme/);
  return match ? match[1] : '';
}

function cleanText(text) {
  // Clean up HTML entities and normalize text
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function processTranscripts() {
  console.log('Processing Deleuze interview transcripts...');
  
  if (!fs.existsSync(TRANSCRIPTS_DIR)) {
    console.error('Transcripts directory not found:', TRANSCRIPTS_DIR);
    return;
  }

  const files = fs.readdirSync(TRANSCRIPTS_DIR)
    .filter(file => file.endsWith('.txt'));
  
  const interviews = [];

  files.forEach(filename => {
    console.log('Processing:', filename);
    
    const letter = extractLetter(filename);
    if (!letter) {
      console.warn('Could not extract letter from:', filename);
      return;
    }

    const metadata = INTERVIEW_METADATA[letter];
    if (!metadata) {
      console.warn('No metadata for letter:', letter);
      return;
    }

    const filePath = path.join(TRANSCRIPTS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = cleanText(content);
    
    interviews.push({
      letter,
      title: metadata.title,
      filename,
      audioFilename: filename.replace('.txt', ''),
      content: cleanedContent,
      topics: metadata.topics,
      length: cleanedContent.length,
      wordCount: cleanedContent.split(/\s+/).length
    });
  });

  // Sort by letter
  interviews.sort((a, b) => a.letter.localeCompare(b.letter));

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write the processed data
  const outputData = {
    metadata: {
      totalInterviews: interviews.length,
      processedAt: new Date().toISOString(),
      totalWords: interviews.reduce((sum, interview) => sum + interview.wordCount, 0)
    },
    interviews
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
  
  console.log(`\nProcessing complete!`);
  console.log(`- Processed ${interviews.length} interviews`);
  console.log(`- Total words: ${outputData.metadata.totalWords.toLocaleString()}`);
  console.log(`- Output saved to: ${OUTPUT_FILE}`);
  
  // Print summary
  console.log('\nInterview Summary:');
  interviews.forEach(interview => {
    console.log(`  ${interview.letter} - ${interview.title}: ${interview.wordCount.toLocaleString()} words`);
  });
}

// Run the script
if (require.main === module) {
  processTranscripts();
}

module.exports = { processTranscripts }; 