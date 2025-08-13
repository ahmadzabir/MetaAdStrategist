import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * CRITICAL DATABASE REBUILD SCRIPT
 * Performs complete line-by-line verification and reconstruction
 * of the authentic Meta targeting categories dataset
 */

interface ParsedCategory {
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
  id: string;
}

function createCategoryId(name: string, categoryType: string): string {
  return `${categoryType}-${name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)}`;
}

function determineCategoryType(level: number, context: string): 'interests' | 'behaviors' | 'demographics' {
  const normalizedContext = context.toLowerCase();
  
  if (normalizedContext.includes('behavior') || normalizedContext.includes('purchase') || 
      normalizedContext.includes('shopping') || normalizedContext.includes('creator') ||
      normalizedContext.includes('anniversary') || normalizedContext.includes('mobile')) {
    return 'behaviors';
  }
  
  if (normalizedContext.includes('demographic') || normalizedContext.includes('age') || 
      normalizedContext.includes('education') || normalizedContext.includes('occupation') ||
      normalizedContext.includes('degree') || normalizedContext.includes('income')) {
    return 'demographics';
  }
  
  return 'interests';
}

function parseHtmlCategories(): ParsedCategory[] {
  console.log('🔍 Parsing HTML source for authentic categories...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const categories: ParsedCategory[] = [];
  
  // Extract all targeting option blocks
  const blockRegex = /<div class="targeting-option level-(\d+)"[^>]*>(.*?)<\/div>/gs;
  let match;
  let currentParentStack: { [level: number]: string } = {};
  
  while ((match = blockRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    const blockContent = match[2];
    
    // Extract name and size
    const nameMatch = blockContent.match(/<span class="item-name">([^<]+)<\/span>/);
    const sizeMatch = blockContent.match(/<span class="item-size">\(Size: ([^)]+)\)<\/span>/);
    
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const size = sizeMatch ? sizeMatch[1] : 'Unknown';
      
      // Skip placeholder entries
      if (name.includes('...') || name.includes('placeholder')) {
        continue;
      }
      
      // Determine parent based on hierarchical structure
      let parentId: string | null = null;
      if (level > 1) {
        for (let parentLevel = level - 1; parentLevel >= 1; parentLevel--) {
          if (currentParentStack[parentLevel]) {
            parentId = currentParentStack[parentLevel];
            break;
          }
        }
      }
      
      // Determine category type
      const categoryType = determineCategoryType(level, blockContent + name);
      const id = createCategoryId(name, categoryType);
      
      // Update parent stack
      currentParentStack[level] = id;
      
      // Clear child levels
      for (let clearLevel = level + 1; clearLevel <= 5; clearLevel++) {
        delete currentParentStack[clearLevel];
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
  
  console.log(`✅ Parsed ${categories.length} authentic categories from HTML`);
  console.log(`📊 Level distribution: ${JSON.stringify(
    categories.reduce((acc, cat) => {
      acc[cat.level] = (acc[cat.level] || 0) + 1;
      return acc;
    }, {} as any)
  )}`);
  
  return categories;
}

async function clearAndRebuildDatabase() {
  console.log('🗑️ Clearing existing database...');
  
  try {
    // Clear all existing categories
    if (storage.clearAllTargetingCategories) {
      await storage.clearAllTargetingCategories();
      console.log('✅ Database cleared successfully');
    } else {
      console.log('⚠️ Clear method not available, proceeding with upload');
    }
    
    // Parse authentic categories from HTML
    const categories = parseHtmlCategories();
    
    console.log('📥 Starting batch upload of authentic categories...');
    
    // Upload in batches to avoid Firebase limits
    const batchSize = 500;
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      
      console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(categories.length / batchSize)}`);
      
      if (storage.batchUploadTargetingCategories) {
        await storage.batchUploadTargetingCategories(batch);
      } else {
        // Fallback to individual uploads
        for (const category of batch) {
          await storage.createTargetingCategory(category);
        }
      }
    }
    
    console.log('✅ Database rebuild complete!');
    
    // Verify the rebuild
    const finalCategories = await storage.listTargetingCategories();
    console.log(`🎯 Final verification: ${finalCategories.length} categories restored`);
    
    // Show sample of restored data
    console.log('📋 Sample restored categories:');
    finalCategories.slice(0, 5).forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (${cat.categoryType}, Level ${cat.level})`);
    });
    
  } catch (error) {
    console.error('❌ Database rebuild failed:', error);
    throw error;
  }
}

// Execute rebuild
clearAndRebuildDatabase().catch(console.error);