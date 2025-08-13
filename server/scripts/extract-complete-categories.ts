import * as fs from 'fs';

/**
 * COMPLETE CATEGORY EXTRACTION SCRIPT
 * Extracts all 673 authentic categories with proper level distribution
 */

interface AuthenticCategory {
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: 'interests' | 'behaviors' | 'demographics';
  id: string;
}

function parseCompleteHtmlStructure(): AuthenticCategory[] {
  console.log('🔍 Extracting complete authentic dataset...');
  
  const htmlContent = fs.readFileSync('../attached_assets/meta-data.html_1755059333942.txt', 'utf-8');
  const categories: AuthenticCategory[] = [];
  
  // Split content into lines for more accurate parsing
  const lines = htmlContent.split('\n');
  let currentLevel = 0;
  let parentStack: { [level: number]: string } = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for targeting option divs with level
    const levelMatch = line.match(/<div class="targeting-option level-(\d+)"/);
    if (levelMatch) {
      currentLevel = parseInt(levelMatch[1]);
      
      // Look ahead for the name and size in subsequent lines
      let name = '';
      let size = 'Unknown';
      
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j].trim();
        
        // Extract name
        const nameMatch = nextLine.match(/<span class="item-name">([^<]+)<\/span>/);
        if (nameMatch) {
          name = nameMatch[1].trim();
        }
        
        // Extract size
        const sizeMatch = nextLine.match(/<span class="item-size">\(Size: ([^)]+)\)<\/span>/);
        if (sizeMatch) {
          size = sizeMatch[1].trim();
        }
        
        // Stop if we find the closing div
        if (nextLine.includes('</div>')) {
          break;
        }
      }
      
      if (name && !name.includes('...') && !name.includes('placeholder')) {
        // Determine category type based on context and level
        let categoryType: 'interests' | 'behaviors' | 'demographics' = 'interests';
        
        const context = name.toLowerCase();
        if (context.includes('behavior') || context.includes('purchase') || 
            context.includes('shopping') || context.includes('creator') ||
            context.includes('anniversary') || context.includes('mobile') ||
            context.includes('device') || context.includes('engaged')) {
          categoryType = 'behaviors';
        } else if (context.includes('demographic') || context.includes('age') || 
                   context.includes('education') || context.includes('occupation') ||
                   context.includes('degree') || context.includes('income') ||
                   context.includes('services') || context.includes('architecture')) {
          categoryType = 'demographics';
        }
        
        // Generate ID
        const id = `${categoryType}-${name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 50)}`;
        
        // Determine parent
        let parentId: string | null = null;
        if (currentLevel > 1) {
          for (let parentLevel = currentLevel - 1; parentLevel >= 1; parentLevel--) {
            if (parentStack[parentLevel]) {
              parentId = parentStack[parentLevel];
              break;
            }
          }
        }
        
        // Update parent stack
        parentStack[currentLevel] = id;
        
        // Clear child levels
        for (let clearLevel = currentLevel + 1; clearLevel <= 5; clearLevel++) {
          delete parentStack[clearLevel];
        }
        
        categories.push({
          id,
          name,
          size,
          level: currentLevel,
          parentId,
          categoryType
        });
      }
    }
  }
  
  // Verify level distribution
  const levelDistribution = categories.reduce((acc, cat) => {
    acc[cat.level] = (acc[cat.level] || 0) + 1;
    return acc;
  }, {} as any);
  
  console.log('✅ Extracted categories by level:');
  Object.keys(levelDistribution).sort().forEach(level => {
    console.log(`  L${level}: ${levelDistribution[level]}`);
  });
  console.log(`  Total: ${categories.length}`);
  
  return categories;
}

// Export function for use in rebuild script
export { parseCompleteHtmlStructure };

// Run extraction if called directly
if (require.main === module) {
  const categories = parseCompleteHtmlStructure();
  console.log('\n📋 Sample categories:');
  categories.slice(0, 10).forEach((cat, index) => {
    console.log(`  ${index + 1}. ${cat.name} (L${cat.level}, ${cat.categoryType})`);
  });
}