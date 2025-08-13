import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * COMPREHENSIVE EXTRACTION - Captures ALL HTML structures
 * Handles both <span class="item-name"> and <h2>/<h3>/<h4>/<h5> patterns
 */

interface ComprehensiveCategory {
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
  id: string;
}

function parseAllHtmlStructures(): ComprehensiveCategory[] {
  console.log('🔍 Comprehensive extraction of ALL HTML structures...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const categories: ComprehensiveCategory[] = [];
  const lines = htmlContent.split('\n');
  
  let parentStack: { [level: number]: string } = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for targeting-option div with level
    const levelMatch = line.match(/<div class="targeting-option level-(\d+)"/);
    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      let name = '';
      let size = 'Unknown';
      
      // Look for different name patterns in this line and next few lines
      const searchLines = [line, ...lines.slice(i + 1, i + 10)];
      const combinedContent = searchLines.join(' ');
      
      // Pattern 1: <span class="item-name">Name</span> <span class="item-size">(Size: X)</span>
      const spanPattern = /<span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span>/;
      const spanMatch = combinedContent.match(spanPattern);
      
      if (spanMatch) {
        name = spanMatch[1].trim();
        size = spanMatch[2].trim();
      } else {
        // Pattern 2: <h2>Name</h2>, <h3>Name</h3>, etc.
        const headerPatterns = [
          /<h2>([^<]+)<\/h2>/,
          /<h3>([^<]+)<\/h3>/,
          /<h4>([^<]+)<\/h4>/,
          /<h5>([^<]+)<\/h5>/
        ];
        
        for (const pattern of headerPatterns) {
          const headerMatch = combinedContent.match(pattern);
          if (headerMatch) {
            name = headerMatch[1].trim();
            break;
          }
        }
      }
      
      // Skip invalid entries
      if (!name || name.includes('...') || name.includes('placeholder') || 
          name.length < 2 || name.includes('Add ') || name.includes('(Add')) {
        continue;
      }
      
      // Advanced category type determination
      let categoryType: 'interests' | 'behaviors' | 'demographics' = 'interests';
      const context = (name + combinedContent).toLowerCase();
      
      // Comprehensive behavior keywords
      if (context.match(/behavior|purchase|shopping|creator|anniversary|mobile|device|engaged|frequent|traveler|commuter|automotive|digital|consumer|facebook|instagram|twitter|linkedin|android|ios|decision|maker|luxury|premium|early_adopter|technology|online|bulk|deal|impulsive|buyer|business_decision|all_creators|mobile_device|frequent_international|engaged_shopper|frequent_online|luxury_shopper/)) {
        categoryType = 'behaviors';
      }
      // Comprehensive demographics keywords
      else if (context.match(/demographic|age|education|occupation|degree|income|services|architecture|engineering|management|healthcare|sales|construction|production|administrative|business_and_finance|arts_entertainment|life_physical_social|computer_mathematical|legal|community_social|education_training|protective_service|food_preparation|building_grounds|personal_care|sales_related|office_administrative|farming_fishing|construction_extraction|installation_maintenance|transportation|military|associate|bachelor|master|professional|doctorate|high_school|college|university|household_income|financial|life_events|away_from|birthday|zip_codes/)) {
        categoryType = 'demographics';
      }
      
      // Special section-based determination
      if (i > 0) {
        const previousLines = lines.slice(Math.max(0, i - 50), i).join(' ').toLowerCase();
        if (previousLines.includes('<!-- demographics -->')) {
          categoryType = 'demographics';
        } else if (previousLines.includes('<!-- behaviors -->')) {
          categoryType = 'behaviors';
        } else if (previousLines.includes('<!-- interests -->')) {
          categoryType = 'interests';
        }
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
  }
  
  return categories;
}

async function executeComprehensiveRebuild() {
  console.log('🔥 Comprehensive HTML structure rebuild...');
  
  try {
    // Clear database
    if (storage.clearAllTargetingCategories) {
      await storage.clearAllTargetingCategories();
      console.log('✅ Database cleared');
    }
    
    // Extract all categories using comprehensive approach
    const categories = parseAllHtmlStructures();
    
    // Show detailed extraction stats
    const levelStats = categories.reduce((acc, cat) => {
      acc[cat.level] = (acc[cat.level] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('📊 Comprehensive extraction results:');
    const target = { 1: 3, 2: 27, 3: 248, 4: 381, 5: 14 };
    let totalMissing = 0;
    
    Object.keys(target).forEach(level => {
      const current = levelStats[level] || 0;
      const expected = target[level];
      const missing = expected - current;
      const status = missing === 0 ? '✅' : `❌ Missing ${missing}`;
      console.log(`  L${level}: ${current}/${expected} ${status}`);
      if (missing > 0) totalMissing += missing;
    });
    
    console.log(`  Total: ${categories.length}/673 ${totalMissing === 0 ? '✅' : `❌ Missing ${totalMissing}`}`);
    
    // Show samples from each level
    console.log('\n📋 Sample categories by level:');
    for (let level = 1; level <= 5; level++) {
      const levelCategories = categories.filter(cat => cat.level === level);
      if (levelCategories.length > 0) {
        console.log(`  L${level}: ${levelCategories[0].name} (${levelCategories[0].categoryType})`);
      }
    }
    
    // Upload to database
    console.log('\n📥 Uploading to database...');
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
    
    console.log('\n🎯 Final database verification:');
    Object.keys(target).forEach(level => {
      const current = finalStats[level] || 0;
      const expected = target[level];
      const status = current === expected ? '✅' : `❌ ${current}/${expected}`;
      console.log(`  L${level}: ${status}`);
    });
    
    const finalTotal = finalCategories.length;
    console.log(`  Total: ${finalTotal}/673 ${finalTotal === 673 ? '✅ COMPLETE!' : `❌ Missing ${673 - finalTotal}`}`);
    
    if (finalTotal === 673) {
      console.log('\n🎉 SUCCESS! All 673 authentic Meta targeting categories restored!');
    } else {
      console.log(`\n⚠️  Still need to recover ${673 - finalTotal} more categories`);
    }
    
  } catch (error) {
    console.error('❌ Comprehensive rebuild failed:', error);
  }
}

executeComprehensiveRebuild().catch(console.error);