const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const audioDir = path.join(__dirname, '../public/audio');

// Mapping of complex filenames to simple names
const filenameMapping = {
  "L'Abécédaire_de_GILLES_DELEUZE_-_A_-_Animal.mp3": "Animal.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-_B_-_Boisson.mp3": "Boisson.mp3",
  "C_-_Culture.mp3": "Culture.mp3",
  "D_-_Désir.mp3": "Desire.mp3",
  "E_-_Enfance.mp3": "Enfance.mp3",
  "F_-_Fidélité._(HD).mp3": "Fidelite.mp3",
  "G_-_Gauche.mp3": "Gauche.mp3",
  "L'Abecedaire_de_GILLES_DELEUZE_-__H_-_Histoire_de_la_philosophie_Part_I.mp3": "Histoire1.mp3",
  "L'Abecedaire_de_GILLES_DELEUZE_-__H_-_Histoire_de_la_philosophie_Part_II.mp3": "Histoire2.mp3",
  "L'Abecedaire_de_GILLES_DELEUZE_-__I_-_Idée.mp3": "Idee.mp3",
  "L'Abecedaire_de_GILLES_DELEUZE_-_J_-_Joie.mp3": "Joie.mp3",
  "L'Abecedaire_de_GILLES_DELEUZE_-_K_-_Kant.mp3": "Kant.mp3",
  "L'Abecedaire_de_GILLES_DELEUZE_-_L_-_Littérature.mp3": "Litterature.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-_M_-_Maladie.mp3": "Maladie.mp3",
  "L'Abecedaire_de_GILLES_DELEUZE_-_N_-_Neurologie.mp3": "Neurologie.mp3",
  "L'Abecedaire_de_GILLES_DELEUZE_-_O_-_Opéra.mp3": "Opera.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-___P_-_Professeur_Part_1.mp3": "Professeur1.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-___P_-_Professeur_Part_2.mp3": "Professeur2.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-__Q_-_Question.mp3": "Question.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-_R_-_Résistance.mp3": "Resistance.mp3",
  "S_-_Style.mp3": "Style.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-__T_-_Tennis.mp3": "Tennis.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-__U_-_Un.mp3": "Un.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-_V_-_Voyage.mp3": "Voyage.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-_W_-_Wittgenstein.mp3": "Wittgenstein.mp3",
  "L'Abécédaire_de_GILLES_DELEUZE_-_Z_-_Zig_zag.mp3": "Zigzag.mp3"
};

console.log('Simplifying audio filenames and compressing...');

// First, check what files exist
const existingFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
console.log('Found files:', existingFiles.length);

let processed = 0;
const totalFiles = Object.keys(filenameMapping).length;

// Process each file mapping
Object.entries(filenameMapping).forEach(([oldName, newName]) => {
  const oldPath = path.join(audioDir, oldName);
  const newPath = path.join(audioDir, newName);
  
  console.log(`\nProcessing: ${oldName} -> ${newName}`);
  
  if (fs.existsSync(oldPath)) {
    // Compress and rename in one step using ffmpeg
    const command = `ffmpeg -i "${oldPath}" -b:a 48k -ar 22050 -ac 1 -y "${newPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error processing ${oldName}:`, error.message);
      } else {
        // Remove original file
        fs.unlinkSync(oldPath);
        
        // Check file sizes
        const newStats = fs.statSync(newPath);
        console.log(`✓ Created: ${newName} (${(newStats.size / 1024 / 1024).toFixed(1)}MB)`);
      }
      
      processed++;
      if (processed === totalFiles) {
        console.log(`\n🎉 All ${totalFiles} files processed!`);
        console.log('Audio files are now simplified and compressed.');
        
        // Clean up any remaining complex-named files
        const remainingFiles = fs.readdirSync(audioDir).filter(f => 
          f.endsWith('.mp3') && !Object.values(filenameMapping).includes(f)
        );
        
        if (remainingFiles.length > 0) {
          console.log('\nCleaning up remaining complex filenames...');
          remainingFiles.forEach(file => {
            const filePath = path.join(audioDir, file);
            fs.unlinkSync(filePath);
            console.log(`🗑️ Removed: ${file}`);
          });
        }
      }
    });
  } else {
    console.log(`⚠️ File not found: ${oldName}`);
    processed++;
  }
}); 