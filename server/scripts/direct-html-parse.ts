import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * DIRECT HTML PARSING - Simple and reliable approach
 * Uses basic string matching to extract all 673 categories
 */

interface DirectCategory {
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
  id: string;
}

function parseDirectFromHtml(): DirectCategory[] {
  console.log('🔍 Direct HTML parsing approach...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const categories: DirectCategory[] = [];
  
  // Simple regex to find all targeting options with item-name spans
  const matches = htmlContent.matchAll(/<div class="targeting-option level-(\d+)"[^>]*>[\s\S]*?<span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span>[\s\S]*?<\/div>/g);
  
  let parentStack: { [level: number]: string } = {};
  
  for (const match of matches) {
    const level = parseInt(match[1]);
    const name = match[2].trim();
    const size = match[3].trim();
    
    // Skip invalid entries
    if (!name || name.includes('...') || name.includes('placeholder')) {
      continue;
    }
    
    // Determine category type
    let categoryType: 'interests' | 'behaviors' | 'demographics' = 'interests';
    const context = name.toLowerCase();
    
    if (context.includes('behavior') || context.includes('purchase') || 
        context.includes('shopping') || context.includes('creator') ||
        context.includes('anniversary') || context.includes('mobile') ||
        context.includes('device') || context.includes('engaged') ||
        context.includes('frequent') || context.includes('traveler') ||
        context.includes('commuter') || context.includes('automotive') ||
        context.includes('digital') || context.includes('consumer') ||
        name.includes('All creators') || name.includes('Business Decision') ||
        name.includes('Mobile Device') || name.includes('Android') ||
        name.includes('iOS') || name.includes('Facebook') ||
        name.includes('Instagram') || name.includes('Twitter') ||
        name.includes('LinkedIn')) {
      categoryType = 'behaviors';
    } else if (context.includes('demographic') || context.includes('age') || 
               context.includes('education') || context.includes('occupation') ||
               context.includes('degree') || context.includes('income') ||
               context.includes('services') || context.includes('architecture') ||
               context.includes('engineering') || context.includes('management') ||
               context.includes('healthcare') || context.includes('sales') ||
               context.includes('construction') || context.includes('production') ||
               context.includes('administrative') || context.includes('associate') ||
               context.includes('bachelor') || context.includes('master') ||
               context.includes('professional') || context.includes('doctorate') ||
               context.includes('high school') || context.includes('college') ||
               context.includes('university') || context.includes('household income')) {
      categoryType = 'demographics';
    }
    
    // Generate ID
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
  
  return categories;
}

async function executeDirectRebuild() {
  console.log('🔥 Direct HTML parsing rebuild...');
  
  try {
    // Clear database
    if (storage.clearAllTargetingCategories) {
      await storage.clearAllTargetingCategories();
      console.log('✅ Database cleared');
    }
    
    // Parse categories directly
    const categories = parseDirectFromHtml();
    
    // Show extraction stats
    const levelStats = categories.reduce((acc, cat) => {
      acc[cat.level] = (acc[cat.level] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('📊 Direct parsing results:');
    const target = { 1: 3, 2: 27, 3: 248, 4: 381, 5: 14 };
    Object.keys(target).forEach(level => {
      const current = levelStats[level] || 0;
      const expected = target[level];
      console.log(`  L${level}: ${current}/${expected}`);
    });
    console.log(`  Total: ${categories.length}/673`);
    
    // Upload to database
    console.log('📥 Uploading to database...');
    if (storage.batchUploadTargetingCategories) {
      await storage.batchUploadTargetingCategories(categories);
    } else {
      for (const category of categories) {
        await storage.createTargetingCategory(category);
      }
    }
    
    // Final verification
    const finalCategories = await storage.listTargetingCategories();
    console.log(`🎯 Final database: ${finalCategories.length} categories`);
    
  } catch (error) {
    console.error('❌ Direct rebuild failed:', error);
  }
}

executeDirectRebuild().catch(console.error);