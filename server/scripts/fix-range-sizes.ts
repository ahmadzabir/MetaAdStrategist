import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * FIX RANGE SIZES - Extract size ranges that were missed
 */

interface RangeSizeEntry {
  name: string;
  size: string;
  level: number;
  parentContext: string;
}

function extractRangeSizes(): RangeSizeEntry[] {
  console.log('Extracting range-based sizes...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const lines = htmlContent.split('\n');
  const entries: RangeSizeEntry[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for targeting-option divs with specific patterns
    const levelMatch = line.match(/<div class="targeting-option level-(\d+)"/);
    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      
      // Look ahead for the complete entry pattern
      let entryText = '';
      let foundName = false;
      let foundSize = false;
      let name = '';
      let size = '';
      
      // Collect the next several lines to find complete entry
      for (let j = i; j < Math.min(i + 15, lines.length); j++) {
        const nextLine = lines[j].trim();
        entryText += nextLine + ' ';
        
        // Pattern 1: Standard span pattern (already captured)
        const spanMatch = nextLine.match(/<span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span>/);
        if (spanMatch) {
          name = spanMatch[1].trim();
          size = spanMatch[2].trim();
          foundName = foundSize = true;
          break;
        }
        
        // Pattern 2: Multi-line entries (Argentina cases)
        if (!foundName && nextLine.includes('People who prefer')) {
          name = nextLine.replace(/<[^>]*>/g, '').trim();
          foundName = true;
        }
        
        // Pattern 3: Size on separate line
        if (foundName && !foundSize) {
          const sizeLineMatch = nextLine.match(/Size:\s*([0-9,\s\-]+)/);
          if (sizeLineMatch) {
            size = sizeLineMatch[1].trim();
            foundSize = true;
            break;
          }
          
          // Alternative size pattern: just numbers with dashes
          const rangeMatch = nextLine.match(/^([0-9,]+\s*-\s*[0-9,]+)$/);
          if (rangeMatch) {
            size = rangeMatch[1].trim();
            foundSize = true;
            break;
          }
        }
        
        // Stop if we hit another targeting-option or end of section
        if (j > i && nextLine.includes('<div class="targeting-option')) {
          break;
        }
      }
      
      // Add entry if we found both name and size
      if (foundName && foundSize && name && size && !name.includes('placeholder')) {
        entries.push({
          name: name,
          size: size,
          level: level,
          parentContext: entryText.substring(0, 100)
        });
      }
    }
  }
  
  return entries;
}

async function fixMissingSizes() {
  console.log('Fixing missing range sizes...');
  
  try {
    // Extract all range-based entries from HTML
    const rangeEntries = extractRangeSizes();
    console.log(`Found ${rangeEntries.length} potential range entries`);
    
    // Get current database categories
    const currentCategories = await storage.listTargetingCategories();
    const categoryMap = new Map();
    currentCategories.forEach(cat => {
      categoryMap.set(cat.name, cat);
    });
    
    // Find missing entries
    const missingEntries = rangeEntries.filter(entry => !categoryMap.has(entry.name));
    console.log(`Found ${missingEntries.length} missing entries with range sizes`);
    
    // Show sample missing entries
    console.log('\nSample missing entries:');
    missingEntries.slice(0, 10).forEach(entry => {
      console.log(`  L${entry.level}: "${entry.name}" - Size: "${entry.size}"`);
    });
    
    // Add missing entries to database
    let addedCount = 0;
    for (const entry of missingEntries) {
      // Determine category type and parent
      let categoryType: 'interests' | 'behaviors' | 'demographics' = 'behaviors';
      let parentId: string | null = null;
      
      const context = (entry.name + entry.parentContext).toLowerCase();
      if (context.includes('argentina') || context.includes('consumer classification')) {
        categoryType = 'behaviors';
      }
      
      // Find appropriate parent based on level and context
      if (entry.level > 1) {
        const potentialParents = currentCategories.filter(cat => 
          cat.level === entry.level - 1 && 
          cat.categoryType === categoryType
        );
        
        if (potentialParents.length > 0) {
          // Use first suitable parent for now
          parentId = potentialParents[0].id;
        }
      }
      
      // Generate ID
      const cleanName = entry.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);
      const id = `${categoryType}-${cleanName}`;
      
      // Add to database
      const newCategory = {
        id,
        name: entry.name,
        size: entry.size,
        level: entry.level,
        parentId,
        categoryType
      };
      
      await storage.createTargetingCategory(newCategory);
      addedCount++;
    }
    
    console.log(`\n✅ Added ${addedCount} missing categories with range sizes`);
    
    // Final verification
    const finalCategories = await storage.listTargetingCategories();
    console.log(`Final database: ${finalCategories.length} total categories`);
    
  } catch (error) {
    console.error('Range size fix failed:', error);
  }
}

fixMissingSizes().catch(console.error);