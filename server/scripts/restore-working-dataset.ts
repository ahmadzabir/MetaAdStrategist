import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * RESTORE WORKING DATASET
 * Clean implementation to restore the authentic 673 categories
 */

interface WorkingCategory {
  id: string;
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
}

function extractAuthenticDataset(): WorkingCategory[] {
  console.log('Extracting authentic dataset from HTML source...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const categories: WorkingCategory[] = [];
  
  // Extract all category entries with precise regex
  const categoryPattern = /<div class="targeting-option level-(\d+)"[^>]*>(?:.*?<h[2-5]>([^<]+)<\/h[2-5]>.*?|.*?<span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span>.*?)<\/div>/gs;
  
  let match;
  let parentStack: { [level: number]: string } = {};
  
  while ((match = categoryPattern.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    const headerName = match[2];
    const spanName = match[3];
    const size = match[4] || 'Unknown';
    
    const name = (spanName || headerName || '').trim();
    
    if (!name || name.includes('placeholder') || name.includes('Add ') || name.length < 2) {
      continue;
    }
    
    // Determine category type based on context
    let categoryType: 'interests' | 'behaviors' | 'demographics' = 'interests';
    const context = name.toLowerCase();
    
    if (context.includes('demographic') || context.includes('education') || 
        context.includes('degree') || context.includes('income') || 
        context.includes('occupation') || context.includes('household') ||
        context.includes('birthday') || context.includes('anniversary') ||
        context.includes('away from')) {
      categoryType = 'demographics';
    } else if (context.includes('behavior') || context.includes('purchase') || 
               context.includes('mobile') || context.includes('device') || 
               context.includes('creator') || context.includes('engaged')) {
      categoryType = 'behaviors';
    }
    
    // Generate clean ID
    const cleanId = `${categoryType}-${name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40)}`;
    
    // Parent relationship
    let parentId: string | null = null;
    if (level > 1 && parentStack[level - 1]) {
      parentId = parentStack[level - 1];
    }
    
    parentStack[level] = cleanId;
    
    categories.push({
      id: cleanId,
      name,
      size,
      level,
      parentId,
      categoryType
    });
  }
  
  return categories;
}

async function restoreWorkingState() {
  console.log('Restoring working dataset...');
  
  try {
    // Clear corrupted data
    if (storage.clearAllTargetingCategories) {
      await storage.clearAllTargetingCategories();
      console.log('Cleared corrupted database');
    }
    
    // Extract clean dataset
    const categories = extractAuthenticDataset();
    
    console.log(`Extracted ${categories.length} authentic categories`);
    
    // Verify level distribution
    const levels = categories.reduce((acc, cat) => {
      acc[cat.level] = (acc[cat.level] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('Level distribution:');
    Object.keys(levels).sort().forEach(level => {
      console.log(`L${level}: ${levels[level]}`);
    });
    
    // Upload to database
    if (storage.batchUploadTargetingCategories) {
      await storage.batchUploadTargetingCategories(categories);
      console.log('Uploaded to database');
    }
    
    // Verify final state
    const final = await storage.listTargetingCategories();
    console.log(`Final database: ${final.length} categories`);
    
  } catch (error) {
    console.error('Restore failed:', error);
  }
}

restoreWorkingState().catch(console.error);