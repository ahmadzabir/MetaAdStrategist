import * as fs from 'fs';
import { storage } from '../storage-factory';

/**
 * PRECISE EXTRACTION - Based on actual HTML patterns observed
 */

interface PreciseCategory {
  id: string;
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
}

function extractPreciseCategories(): PreciseCategory[] {
  console.log('Performing precise extraction...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const categories: PreciseCategory[] = [];
  const lines = htmlContent.split('\n');
  
  let currentContext = '';
  let parentStack: { [level: number]: string } = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Track section context
    if (line.includes('<!-- DEMOGRAPHICS -->')) currentContext = 'demographics';
    else if (line.includes('<!-- INTERESTS -->')) currentContext = 'interests';  
    else if (line.includes('<!-- BEHAVIORS -->')) currentContext = 'behaviors';
    
    // Pattern 1: Simple item-name span entries
    const spanMatch = line.match(/<div class="targeting-option level-(\d+)"[^>]*><span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span><\/div>/);
    if (spanMatch) {
      const level = parseInt(spanMatch[1]);
      const name = spanMatch[2].trim();
      const size = spanMatch[3].trim();
      
      addCategory(categories, parentStack, name, size, level, currentContext);
      continue;
    }
    
    // Pattern 2: Level div with header in next lines
    const levelMatch = line.match(/<div class="targeting-option level-(\d+)"/);
    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      
      // Look ahead for header or span
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        
        // Header pattern
        const headerMatch = nextLine.match(/<h[2-5]>([^<]+)<\/h[2-5]>/);
        if (headerMatch) {
          const name = headerMatch[1].trim();
          addCategory(categories, parentStack, name, 'Unknown', level, currentContext);
          i = j; // Skip processed lines
          break;
        }
        
        // Span pattern  
        const nextSpanMatch = nextLine.match(/<span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span>/);
        if (nextSpanMatch) {
          const name = nextSpanMatch[1].trim();
          const size = nextSpanMatch[2].trim();
          addCategory(categories, parentStack, name, size, level, currentContext);
          i = j; // Skip processed lines
          break;
        }
      }
    }
  }
  
  return categories;
}

function addCategory(
  categories: PreciseCategory[], 
  parentStack: { [level: number]: string },
  name: string, 
  size: string, 
  level: number, 
  context: string
) {
  if (!name || name.includes('placeholder') || name.includes('Add ') || name.length < 2) {
    return;
  }
  
  // Determine category type
  let categoryType: 'interests' | 'behaviors' | 'demographics' = 'interests';
  
  if (context === 'demographics' || 
      name.toLowerCase().includes('degree') || 
      name.toLowerCase().includes('education') ||
      name.toLowerCase().includes('income') ||
      name.toLowerCase().includes('birthday') ||
      name.toLowerCase().includes('anniversary')) {
    categoryType = 'demographics';
  } else if (context === 'behaviors' ||
             name.toLowerCase().includes('behavior') ||
             name.toLowerCase().includes('creator') ||
             name.toLowerCase().includes('mobile') ||
             name.toLowerCase().includes('device')) {
    categoryType = 'behaviors';
  }
  
  // Generate ID
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);
  const id = `${categoryType}-${cleanName}`;
  
  // Parent relationship
  let parentId: string | null = null;
  if (level > 1 && parentStack[level - 1]) {
    parentId = parentStack[level - 1];
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

async function executePreciseRestore() {
  console.log('Executing precise restore...');
  
  try {
    // Clear database
    if (storage.clearAllTargetingCategories) {
      await storage.clearAllTargetingCategories();
      console.log('Database cleared');
    }
    
    // Extract categories
    const categories = extractPreciseCategories();
    
    console.log(`Extracted ${categories.length} categories`);
    
    // Show distribution
    const levels = categories.reduce((acc, cat) => {
      acc[cat.level] = (acc[cat.level] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('Distribution:');
    Object.keys(levels).sort().forEach(level => {
      console.log(`L${level}: ${levels[level]}`);
    });
    
    // Upload
    if (storage.batchUploadTargetingCategories) {
      await storage.batchUploadTargetingCategories(categories);
    }
    
    // Verify
    const final = await storage.listTargetingCategories();
    console.log(`Final: ${final.length} categories in database`);
    
  } catch (error) {
    console.error('Precise restore failed:', error);
  }
}

executePreciseRestore().catch(console.error);