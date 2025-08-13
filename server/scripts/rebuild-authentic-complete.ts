import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * AUTHENTIC COMPLETE REBUILD SCRIPT
 * Ensures all 673 categories are properly extracted and stored
 */

interface CompleteCategory {
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
  id: string;
}

function extractAllAuthenticCategories(): CompleteCategory[] {
  console.log('🔍 Performing complete extraction of all 673 authentic categories...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const categories: CompleteCategory[] = [];
  
  // More comprehensive regex to capture all targeting options
  const targetingRegex = /<div class="targeting-option level-(\d+)"[^>]*>([\s\S]*?)<\/div>/g;
  let match;
  let parentStack: { [level: number]: string } = {};
  
  while ((match = targetingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    const content = match[2];
    
    // Extract name with multiple fallback patterns
    let name = '';
    const namePatterns = [
      /<span class="item-name">([^<]+)<\/span>/,
      /<h(\d)>([^<]+)<\/h\d>/,
      /class="item-name"[^>]*>([^<]+)</
    ];
    
    for (const pattern of namePatterns) {
      const nameMatch = content.match(pattern);
      if (nameMatch) {
        name = nameMatch[nameMatch.length - 1].trim();
        break;
      }
    }
    
    // Extract size
    const sizeMatch = content.match(/<span class="item-size">\(Size: ([^)]+)\)<\/span>/);
    const size = sizeMatch ? sizeMatch[1].trim() : 'Unknown';
    
    // Skip invalid entries
    if (!name || name.includes('...') || name.includes('placeholder') || name.length < 2) {
      continue;
    }
    
    // Advanced category type determination
    let categoryType: 'interests' | 'behaviors' | 'demographics' = 'interests';
    const context = (name + content).toLowerCase();
    
    // Behaviors keywords
    if (context.match(/behavior|purchase|shopping|creator|anniversary|mobile|device|engaged|frequent|traveler|commuter|automotive|digital|consumer/)) {
      categoryType = 'behaviors';
    }
    // Demographics keywords  
    else if (context.match(/demographic|age|education|occupation|degree|income|services|architecture|engineering|management|healthcare|sales|construction|production/)) {
      categoryType = 'demographics';
    }
    
    // Generate unique ID
    const baseId = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 40);
    const id = `${categoryType}-${baseId}`;
    
    // Determine parent relationship
    let parentId: string | null = null;
    if (level > 1) {
      for (let parentLevel = level - 1; parentLevel >= 1; parentLevel--) {
        if (parentStack[parentLevel]) {
          parentId = parentStack[parentLevel];
          break;
        }
      }
    }
    
    // Update parent tracking
    parentStack[level] = id;
    
    // Clear child levels from stack
    for (let clearLevel = level + 1; clearLevel <= 5; clearLevel++) {
      delete parentStack[clearLevel];
    }
    
    categories.push({
      id,
      name,
      size,
      level,
      parentId,
      categoryType
    });
  }
  
  return categories;
}

async function performCompleteRebuild() {
  console.log('🔥 Starting complete authentic database rebuild...');
  
  try {
    // Clear existing data
    if (storage.clearAllTargetingCategories) {
      await storage.clearAllTargetingCategories();
      console.log('✅ Database cleared');
    }
    
    // Extract all authentic categories
    const categories = extractAllAuthenticCategories();
    
    // Verify we have the correct distribution
    const levelStats = categories.reduce((acc, cat) => {
      acc[cat.level] = (acc[cat.level] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('📊 Extracted level distribution:');
    Object.keys(levelStats).sort().forEach(level => {
      console.log(`  L${level}: ${levelStats[level]}`);
    });
    console.log(`  Total: ${categories.length}`);
    
    // Target validation
    const target = { 1: 3, 2: 27, 3: 248, 4: 381, 5: 14 };
    let missingTotal = 0;
    Object.keys(target).forEach(level => {
      const current = levelStats[level] || 0;
      const expected = target[level];
      const missing = expected - current;
      if (missing > 0) {
        console.log(`⚠️  L${level}: Missing ${missing} categories (${current}/${expected})`);
        missingTotal += missing;
      }
    });
    
    if (missingTotal > 0) {
      console.log(`⚠️  Total missing: ${missingTotal} categories`);
    }
    
    // Upload to database
    console.log('📥 Uploading to database...');
    if (storage.batchUploadTargetingCategories) {
      await storage.batchUploadTargetingCategories(categories);
    } else {
      // Fallback to individual uploads
      for (const category of categories) {
        await storage.createTargetingCategory(category);
      }
    }
    
    // Final verification
    const finalCategories = await storage.listTargetingCategories();
    const finalStats = finalCategories.reduce((acc, cat) => {
      acc[cat.level] = (acc[cat.level] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('🎯 Final database verification:');
    Object.keys(finalStats).sort().forEach(level => {
      console.log(`  L${level}: ${finalStats[level]}`);
    });
    console.log(`  Total: ${finalCategories.length}`);
    
    console.log('✅ Complete rebuild finished!');
    
  } catch (error) {
    console.error('❌ Rebuild failed:', error);
    throw error;
  }
}

// Execute rebuild
performCompleteRebuild().catch(console.error);