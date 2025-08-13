import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * FINAL COMPLETE EXTRACTION SCRIPT
 * Line-by-line parsing to capture ALL 673 authentic categories
 */

interface FinalCategory {
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
  id: string;
}

function extractEveryCategory(): FinalCategory[] {
  console.log('🔍 Final comprehensive extraction of ALL authentic categories...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const categories: FinalCategory[] = [];
  const lines = htmlContent.split('\n');
  
  let parentStack: { [level: number]: string } = {};
  let currentDiv: { level: number; content: string[] } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Start of targeting option
    const startMatch = line.match(/<div class="targeting-option level-(\d+)"[^>]*>/);
    if (startMatch) {
      const level = parseInt(startMatch[1]);
      currentDiv = { level, content: [] };
      continue;
    }
    
    // Collect content inside div
    if (currentDiv) {
      currentDiv.content.push(line);
      
      // End of targeting option div
      if (line.includes('</div>')) {
        // Process the collected content
        const content = currentDiv.content.join(' ');
        const level = currentDiv.level;
        
        // Extract name
        const nameMatch = content.match(/<span class="item-name">([^<]+)<\/span>/);
        if (nameMatch) {
          const name = nameMatch[1].trim();
          
          // Skip placeholders
          if (name.includes('...') || name.includes('placeholder') || name.length < 2) {
            currentDiv = null;
            continue;
          }
          
          // Extract size
          const sizeMatch = content.match(/<span class="item-size">\(Size: ([^)]+)\)<\/span>/);
          const size = sizeMatch ? sizeMatch[1].trim() : 'Unknown';
          
          // Determine category type with enhanced logic
          let categoryType: 'interests' | 'behaviors' | 'demographics' = 'interests';
          const context = (name + content).toLowerCase();
          
          // Enhanced behavior detection
          if (context.match(/behavior|purchase|shopping|creator|anniversary|mobile|device|engaged|frequent|traveler|commuter|automotive|digital|consumer|anniversary|all_creators|business_decision|mobile_device|android|ios|facebook|instagram|twitter|linkedin|frequent_international|luxury|premium|frequent_traveler|early_adopter|technology|online_shopping|engaged_shopper|frequent_online_shopper|luxury_shopper|bulk_buyer|deal_seeker|impulsive_buyer/)) {
            categoryType = 'behaviors';
          }
          // Enhanced demographics detection
          else if (context.match(/demographic|age|education|occupation|degree|income|services|architecture|engineering|management|healthcare|sales|construction|production|administrative|business_and_finance|arts_entertainment|life_physical_social|computer_mathematical|legal|community_social|education_training|protective_service|food_preparation|building_grounds|personal_care|sales_related|office_administrative|farming_fishing|construction_extraction|installation_maintenance|production|transportation|military|associate_degree|bachelor|master|professional|doctorate|high_school|college|university/)) {
            categoryType = 'demographics';
          }
          
          // Generate unique ID
          const baseId = name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 40);
          const id = `${categoryType}-${baseId}`;
          
          // Determine parent
          let parentId: string | null = null;
          if (level > 1) {
            for (let parentLevel = level - 1; parentLevel >= 1; parentLevel--) {
              if (parentStack[parentLevel]) {
                parentId = parentStack[parentLevel];
                break;
              }
            }
          }
          
          // Update parent stack
          parentStack[level] = id;
          
          // Clear child levels
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
        
        currentDiv = null;
      }
    }
  }
  
  // Final validation and stats
  const levelStats = categories.reduce((acc, cat) => {
    acc[cat.level] = (acc[cat.level] || 0) + 1;
    return acc;
  }, {} as any);
  
  console.log('📊 Final extraction results:');
  const target = { 1: 3, 2: 27, 3: 248, 4: 381, 5: 14 };
  let totalMissing = 0;
  
  Object.keys(target).forEach(level => {
    const current = levelStats[level] || 0;
    const expected = target[level];
    const missing = expected - current;
    console.log(`  L${level}: ${current}/${expected} ${missing > 0 ? `(Missing ${missing})` : '✅'}`);
    if (missing > 0) totalMissing += missing;
  });
  
  console.log(`  Total: ${categories.length}/673 ${totalMissing > 0 ? `(Missing ${totalMissing})` : '✅'}`);
  
  return categories;
}

async function executeCompleteRebuild() {
  console.log('🔥 Executing final complete rebuild...');
  
  try {
    // Clear database
    if (storage.clearAllTargetingCategories) {
      await storage.clearAllTargetingCategories();
      console.log('✅ Database cleared');
    }
    
    // Extract all categories
    const categories = extractEveryCategory();
    
    // Upload to database
    console.log('📥 Uploading all categories...');
    if (storage.batchUploadTargetingCategories) {
      await storage.batchUploadTargetingCategories(categories);
    } else {
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
    
    console.log('🎯 Database verification:');
    const target = { 1: 3, 2: 27, 3: 248, 4: 381, 5: 14 };
    Object.keys(target).forEach(level => {
      const current = finalStats[level] || 0;
      const expected = target[level];
      const status = current === expected ? '✅' : `❌ ${current}/${expected}`;
      console.log(`  L${level}: ${status}`);
    });
    console.log(`  Total: ${finalCategories.length}/673 ${finalCategories.length === 673 ? '✅' : '❌'}`);
    
    if (finalCategories.length === 673) {
      console.log('🎉 SUCCESS! All 673 authentic categories restored!');
    } else {
      console.log(`⚠️  Still missing ${673 - finalCategories.length} categories`);
    }
    
  } catch (error) {
    console.error('❌ Final rebuild failed:', error);
    throw error;
  }
}

// Execute
executeCompleteRebuild().catch(console.error);