import * as fs from 'fs';

/**
 * COMPLETE HTML TO JSON CONVERTER
 * Parse every single category from HTML and create comprehensive JSON dataset
 */

interface Category {
  id: string;
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
}

function parseCompleteHTML(): Category[] {
  console.log('🔍 Converting complete HTML to JSON...');
  
  const htmlContent = fs.readFileSync('../attached_assets/Pasted--DOCTYPE-html-html-lang-en-head-meta-charset-UTF-8-meta-name-viewp-1755075457775_1755075457776.txt', 'utf-8');
  const categories: Category[] = [];
  const lines = htmlContent.split('\n');
  
  let currentSection = '';
  let parentStack: { [level: number]: string } = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Track main sections
    if (line.includes('<!-- DEMOGRAPHICS -->')) currentSection = 'demographics';
    else if (line.includes('<!-- INTERESTS -->')) currentSection = 'interests';
    else if (line.includes('<!-- BEHAVIORS -->')) currentSection = 'behaviors';
    
    // Find targeting-option divs
    const levelMatch = line.match(/<div class="targeting-option level-(\d+)"/);
    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      let name = '';
      let size = 'Unknown';
      
      // Look for content in current line and next few lines
      const searchRange = Math.min(i + 10, lines.length);
      let foundContent = false;
      
      for (let j = i; j < searchRange && !foundContent; j++) {
        const searchLine = lines[j].trim();
        
        // Pattern 1: item-name with size
        const spanMatch = searchLine.match(/<span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span>/);
        if (spanMatch) {
          name = spanMatch[1].trim();
          size = spanMatch[2].trim();
          foundContent = true;
          continue;
        }
        
        // Pattern 2: item-name only
        const nameOnlyMatch = searchLine.match(/<span class="item-name">([^<]+)<\/span>/);
        if (nameOnlyMatch) {
          name = nameOnlyMatch[1].trim();
          foundContent = true;
          continue;
        }
        
        // Pattern 3: Headers (h2, h3, h4, h5)
        const headerMatch = searchLine.match(/<h([2-5])>([^<]+)<\/h[2-5]>/);
        if (headerMatch) {
          name = headerMatch[2].trim();
          foundContent = true;
          continue;
        }
        
        // Stop at next targeting-option
        if (j > i && searchLine.includes('<div class="targeting-option')) {
          break;
        }
      }
      
      // Skip invalid entries
      if (!name || name.includes('placeholder') || name.includes('Add ') || name.length < 2) {
        continue;
      }
      
      // Determine category type
      let categoryType: 'interests' | 'behaviors' | 'demographics' = 'interests';
      
      if (currentSection === 'demographics') {
        categoryType = 'demographics';
      } else if (currentSection === 'behaviors') {
        categoryType = 'behaviors';
      } else if (currentSection === 'interests') {
        categoryType = 'interests';
      }
      
      // Generate unique ID
      const cleanName = name.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 50);
      const id = `${categoryType}_${cleanName}`;
      
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
  }
  
  return categories;
}

function generateHardcodedData() {
  console.log('📊 Generating hardcoded targeting categories...');
  
  const categories = parseCompleteHTML();
  
  // Statistics
  const levelStats = categories.reduce((acc, cat) => {
    acc[cat.level] = (acc[cat.level] || 0) + 1;
    return acc;
  }, {} as any);
  
  console.log(`Total categories: ${categories.length}`);
  console.log('Level distribution:');
  Object.keys(levelStats).sort().forEach(level => {
    console.log(`  L${level}: ${levelStats[level]}`);
  });
  
  // Generate TypeScript file
  const jsonData = JSON.stringify(categories, null, 2);
  
  const tsContent = `// Auto-generated targeting categories from authentic Meta HTML source
// Generated on: ${new Date().toISOString()}
// Total categories: ${categories.length}

export interface TargetingCategory {
  id: string;
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
}

export const TARGETING_CATEGORIES: TargetingCategory[] = ${jsonData};

// Statistics
export const CATEGORY_STATS = {
  total: ${categories.length},
  levels: ${JSON.stringify(levelStats, null, 2)},
  byType: {
    demographics: ${categories.filter(c => c.categoryType === 'demographics').length},
    interests: ${categories.filter(c => c.categoryType === 'interests').length},
    behaviors: ${categories.filter(c => c.categoryType === 'behaviors').length}
  }
};
`;
  
  fs.writeFileSync('../shared/targeting-categories.ts', tsContent);
  console.log('✅ Generated ../shared/targeting-categories.ts');
  
  return categories;
}

generateHardcodedData();