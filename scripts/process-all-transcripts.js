const fs = require('fs');
const path = require('path');

// Enhanced interview metadata with all letters
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
  'X': { title: 'Inconnue', topics: ['unknown', 'mystery', 'indeterminate', 'x-factor'] },
  'Y': { title: 'Y', topics: ['unknown', 'variable', 'question', 'indeterminate'] },
  'Z': { title: 'Zig zag', topics: ['zigzag', 'movement', 'lines', 'escape'] }
};

function generateSimplifiedAudioFilename(originalFilename) {
  const match = originalFilename.match(/([A-Z]) comme (.+?)(?:\s*\(HD\))?\.m4a$/i);
  if (match) {
    const [, letter, title] = match;
    return `${letter}_-_${title.trim().replace(/\s+/g, '_')}.m4a`;
  }
  return originalFilename.replace(/\s+/g, '_');
}

function extractTopics(content) {
  // Extract key philosophical terms from content
  const philosophicalTerms = [
    'desire', 'rhizome', 'assemblage', 'becoming', 'multiplicity', 'difference',
    'immanence', 'transcendence', 'body', 'affect', 'concept', 'territory',
    'deterritorialization', 'nomad', 'machine', 'unconscious', 'philosophy',
    'culture', 'politics', 'resistance', 'power', 'joy', 'ethics', 'spinoza',
    'writing', 'literature', 'language', 'thought', 'creativity'
  ];
  
  return philosophicalTerms.filter(term => 
    content.toLowerCase().includes(term)
  ).slice(0, 4);
}

function processTranscripts() {
  const transcriptsDir = path.join(__dirname, '../transcripts');
  const outputPath = path.join(__dirname, '../public/interviews-data.json');
  
  if (!fs.existsSync(transcriptsDir)) {
    console.error('Transcripts directory not found!');
    process.exit(1);
  }
  
  const transcriptFiles = fs.readdirSync(transcriptsDir)
    .filter(file => file.endsWith('.txt'))
    .sort();
  
  console.log(`Found ${transcriptFiles.length} transcript files to process...`);
  
  const interviews = [];
  let totalWords = 0;
  
  transcriptFiles.forEach(filename => {
    try {
      const filePath = path.join(transcriptsDir, filename);
      const content = fs.readFileSync(filePath, 'utf8').trim();
      
      if (!content) {
        console.warn(`Skipping empty file: ${filename}`);
        return;
      }
      
      // Extract letter from filename
      const letterMatch = filename.match(/([A-Z]) comme/);
      const letter = letterMatch ? letterMatch[1] : filename.charAt(0).toUpperCase();
      
      // Get metadata for this letter
      const metadata = INTERVIEW_METADATA[letter];
      if (!metadata) {
        console.warn(`No metadata found for letter: ${letter}`);
        return;
      }
      
      // Generate audio filename
      const audioFilename = filename.replace('.txt', '');
      const simplifiedAudioFilename = generateSimplifiedAudioFilename(audioFilename);
      
      // Extract additional topics from content
      const contentTopics = extractTopics(content);
      const allTopics = [...new Set([...metadata.topics, ...contentTopics])];
      
      const wordCount = content.split(/\s+/).length;
      totalWords += wordCount;
      
      const interview = {
        letter,
        title: metadata.title,
        filename,
        audioFilename: simplifiedAudioFilename,
        content,
        topics: allTopics,
        length: content.length,
        wordCount
      };
      
      interviews.push(interview);
      console.log(`✓ Processed ${letter} - ${metadata.title} (${wordCount.toLocaleString()} words)`);
      
    } catch (error) {
      console.error(`Error processing ${filename}:`, error.message);
    }
  });
  
  // Sort interviews by letter
  interviews.sort((a, b) => a.letter.localeCompare(b.letter));
  
  const outputData = {
    metadata: {
      totalInterviews: interviews.length,
      processedAt: new Date().toISOString(),
      totalWords
    },
    interviews
  };
  
  // Write to output file
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log('\n=== PROCESSING COMPLETE ===');
  console.log(`Total interviews processed: ${interviews.length}`);
  console.log(`Total words: ${totalWords.toLocaleString()}`);
  console.log(`Available letters: ${interviews.map(i => i.letter).join(', ')}`);
  console.log(`Output written to: ${outputPath}`);
  
  return outputData;
}

// Run the processing
processTranscripts(); 