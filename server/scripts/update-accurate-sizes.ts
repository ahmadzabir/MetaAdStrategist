import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * UPDATE ACCURATE SIZES
 * Extract exact size values from HTML and update database
 */

interface SizeUpdate {
  id: string;
  name: string;
  size: string;
}

function extractAccurateSizes(): Map<string, string> {
  console.log('Extracting accurate sizes from HTML...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const sizeMap = new Map<string, string>();
  
  // Pattern to find all item-name and item-size pairs
  const pattern = /<span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span>/g;
  
  let match;
  while ((match = pattern.exec(htmlContent)) !== null) {
    const name = match[1].trim();
    const size = match[2].trim();
    
    // Clean the name to match our ID generation logic
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);
    
    sizeMap.set(name, size);
    sizeMap.set(cleanName, size);
  }
  
  console.log(`Found ${sizeMap.size / 2} accurate sizes`);
  return sizeMap;
}

async function updateDatabaseSizes() {
  console.log('Updating database with accurate sizes...');
  
  try {
    // Get accurate sizes from HTML
    const sizeMap = extractAccurateSizes();
    
    // Get all current categories
    const categories = await storage.listTargetingCategories();
    console.log(`Processing ${categories.length} categories...`);
    
    let updatedCount = 0;
    const updates: SizeUpdate[] = [];
    
    for (const category of categories) {
      let newSize = category.size;
      
      // Try to find accurate size by name
      if (sizeMap.has(category.name)) {
        newSize = sizeMap.get(category.name)!;
      } else {
        // Try by cleaned name
        const cleanName = category.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);
        if (sizeMap.has(cleanName)) {
          newSize = sizeMap.get(cleanName)!;
        }
      }
      
      // Update if size changed and it's not "Unknown"
      if (newSize !== category.size && newSize !== 'Unknown') {
        updates.push({
          id: category.id,
          name: category.name,
          size: newSize
        });
        updatedCount++;
      }
    }
    
    console.log(`Found ${updatedCount} categories to update`);
    
    // Show sample updates
    console.log('\nSample size updates:');
    updates.slice(0, 10).forEach(update => {
      console.log(`  ${update.name}: "${update.size}"`);
    });
    
    // Batch update the sizes
    for (const update of updates) {
      if (storage.updateTargetingCategory) {
        await storage.updateTargetingCategory(update.id, { size: update.size });
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} categories with accurate sizes`);
    
    // Show some statistics about the sizes
    const finalCategories = await storage.listTargetingCategories();
    const sizeStats = {
      withNumbers: 0,
      notAvailable: 0,
      unknown: 0,
      belowThousand: 0
    };
    
    finalCategories.forEach(cat => {
      const size = cat.size.toLowerCase();
      if (size.includes('not available')) sizeStats.notAvailable++;
      else if (size.includes('unknown')) sizeStats.unknown++;
      else if (size.includes('below 1000')) sizeStats.belowThousand++;
      else if (/\d/.test(size)) sizeStats.withNumbers++;
    });
    
    console.log('\nSize distribution:');
    console.log(`  With numbers: ${sizeStats.withNumbers}`);
    console.log(`  Not available: ${sizeStats.notAvailable}`);
    console.log(`  Below 1000: ${sizeStats.belowThousand}`);
    console.log(`  Unknown: ${sizeStats.unknown}`);
    
  } catch (error) {
    console.error('Size update failed:', error);
  }
}

updateDatabaseSizes().catch(console.error);