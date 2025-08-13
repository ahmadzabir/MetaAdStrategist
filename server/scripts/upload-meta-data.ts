import * as fs from 'fs';
import { flattenMetaData, validateMetaData, type MetaTargetingItem } from '../utils/data-processor';
import { FirebaseStorage } from '../services/firebase';

async function uploadMetaData() {
  try {
    console.log('Reading Meta targeting data...');
    
    // Read the attached file
    const filePath = '../attached_assets/Pasted--id-demographics-name-Demographics-size-level-1--1755043633611_1755043633613.txt';
    const rawData = fs.readFileSync(filePath, 'utf8');
    
    console.log('Parsing JSON data...');
    const jsonData = JSON.parse(rawData);
    
    console.log('Validating data format...');
    if (!validateMetaData(jsonData)) {
      throw new Error('Invalid Meta targeting data format');
    }
    
    console.log('Flattening hierarchical data...');
    const flattened = flattenMetaData(jsonData as MetaTargetingItem[]);
    
    console.log(`Processing ${flattened.length} targeting categories...`);
    
    // Upload to Firebase in batches
    const firebaseStorage = new FirebaseStorage();
    const batchSize = 100;
    
    for (let i = 0; i < flattened.length; i += batchSize) {
      const batch = flattened.slice(i, i + batchSize);
      console.log(`Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(flattened.length/batchSize)} (${batch.length} items)`);
      
      await firebaseStorage.bulkInsertTargetingCategories(batch);
      
      // Small delay to avoid overwhelming Firebase
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Successfully uploaded ${flattened.length} targeting categories to Firebase!`);
    
    // Show some examples
    console.log('\nSample categories uploaded:');
    flattened.slice(0, 5).forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.name} (${cat.id}) - ${cat.size}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error uploading Meta data:', error);
    process.exit(1);
  }
}

uploadMetaData();