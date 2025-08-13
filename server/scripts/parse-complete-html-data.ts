import { FirebaseStorage } from "../services/firebase";
import { readFileSync } from "fs";

interface ParsedCategory {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  size: string;
  categoryType: 'demographics' | 'interests' | 'behaviors';
}

async function parseCompleteHtmlData() {
  console.log("🚀 Parsing complete HTML Meta targeting data...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    // Clear all existing data first
    console.log("🗑️ Clearing existing database...");
    await firebaseStorage.clearAllTargetingCategories();
    
    // Load the HTML file
    const htmlPath = "../attached_assets/Pasted--DOCTYPE-html-html-lang-en-head-meta-charset-UTF-8-meta-name-viewport-con-1755050784119_1755050784122.txt";
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    const allCategories: ParsedCategory[] = [];
    let currentCategoryType: 'demographics' | 'interests' | 'behaviors' | null = null;
    const parentStack: Array<{id: string, level: number}> = [];
    
    // Parse line by line
    const lines = htmlContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect category type sections
      if (line.includes('<!-- DEMOGRAPHICS -->') || line.includes('<h2>Demographics</h2>')) {
        currentCategoryType = 'demographics';
        console.log("📊 Processing Demographics section...");
        continue;
      }
      
      if (line.includes('<!-- INTERESTS -->') || line.includes('<h2>Interests</h2>')) {
        currentCategoryType = 'interests';
        console.log("🎯 Processing Interests section...");
        continue;
      }
      
      if (line.includes('<!-- BEHAVIORS -->') || line.includes('<h2>Behaviors</h2>')) {
        currentCategoryType = 'behaviors';
        console.log("⚡ Processing Behaviors section...");
        continue;
      }
      
      if (!currentCategoryType) continue;
      
      // Parse level and content
      const levelMatch = line.match(/data-level="(\d+)"/);
      if (!levelMatch) continue;
      
      const level = parseInt(levelMatch[1]);
      
      // Extract name and size
      let name = '';
      let size = 'Unknown';
      
      if (line.includes('<h2>') || line.includes('<h3>') || line.includes('<h4>') || line.includes('<h5>')) {
        // Header elements
        const headerMatch = line.match(/<h[2-5]>([^<]+)<\/h[2-5]>/);
        if (headerMatch) {
          name = headerMatch[1].trim();
        }
      } else if (line.includes('<span class="item-name">')) {
        // Regular items with size
        const nameMatch = line.match(/<span class="item-name">([^<]+)<\/span>/);
        const sizeMatch = line.match(/<span class="item-size">\(([^)]+)\)<\/span>/);
        
        if (nameMatch) {
          name = nameMatch[1].trim();
        }
        if (sizeMatch) {
          size = sizeMatch[1].replace('Size: ', '').trim();
        }
      }
      
      if (!name) continue;
      
      // Handle parent stack - remove parents that are at the same level or higher
      while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
        parentStack.pop();
      }
      
      // Generate ID
      const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1].id : null;
      const baseId = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      
      let id: string;
      if (level === 1) {
        id = currentCategoryType;
      } else if (parentId) {
        id = `${parentId}-${baseId}`;
      } else {
        id = `${currentCategoryType}-${baseId}`;
      }
      
      // Create category
      const category: ParsedCategory = {
        id,
        name,
        parentId,
        level,
        size,
        categoryType: currentCategoryType
      };
      
      allCategories.push(category);
      
      // Add to parent stack if it could have children (level < 5)
      if (level < 5) {
        parentStack.push({id, level});
      }
      
      console.log(`  Added L${level}: ${name} (${id})`);
    }
    
    console.log(`\n📊 Parsing complete! Found ${allCategories.length} categories:`);
    
    const breakdown = {
      demographics: allCategories.filter(c => c.categoryType === 'demographics').length,
      interests: allCategories.filter(c => c.categoryType === 'interests').length,
      behaviors: allCategories.filter(c => c.categoryType === 'behaviors').length
    };
    
    console.log(`  - Demographics: ${breakdown.demographics}`);
    console.log(`  - Interests: ${breakdown.interests}`);
    console.log(`  - Behaviors: ${breakdown.behaviors}`);
    
    const levelBreakdown = {
      level1: allCategories.filter(c => c.level === 1).length,
      level2: allCategories.filter(c => c.level === 2).length,
      level3: allCategories.filter(c => c.level === 3).length,
      level4: allCategories.filter(c => c.level === 4).length,
      level5: allCategories.filter(c => c.level === 5).length
    };
    
    console.log(`\n📋 Level breakdown:`);
    console.log(`  - Level 1: ${levelBreakdown.level1}`);
    console.log(`  - Level 2: ${levelBreakdown.level2}`);
    console.log(`  - Level 3: ${levelBreakdown.level3}`);
    console.log(`  - Level 4: ${levelBreakdown.level4}`);
    console.log(`  - Level 5: ${levelBreakdown.level5}`);
    
    // Upload to Firebase
    console.log("\n🚀 Uploading to Firebase...");
    await firebaseStorage.batchUploadTargetingCategories(allCategories.map(cat => ({
      ...cat,
      createdAt: new Date()
    })));
    
    console.log("✅ Upload complete!");
    
    // Verify hierarchy
    console.log("\n🔍 Verifying hierarchy...");
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    hierarchical.forEach(root => {
      console.log(`\n📋 ${root.name} (${root.children?.length || 0} children):`);
      
      const printChildren = (categories: any[], indent = '  ') => {
        categories?.forEach(cat => {
          console.log(`${indent}L${cat.level}: ${cat.name} (${cat.children?.length || 0} children)`);
          if (cat.children && cat.children.length > 0 && cat.level < 4) {
            printChildren(cat.children, indent + '  ');
          }
        });
      };
      
      printChildren(root.children);
    });
    
    console.log("\n🎉 Complete data parsing and upload successful!");
    
  } catch (error) {
    console.error("❌ Error parsing HTML data:", error);
    throw error;
  }
}

// Run the script
parseCompleteHtmlData().catch(console.error);