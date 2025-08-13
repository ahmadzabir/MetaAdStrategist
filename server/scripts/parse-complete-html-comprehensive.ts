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

async function parseCompleteHtmlComprehensive() {
  console.log("🚀 COMPREHENSIVE PARSING - ALL HTML DATA...");
  
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
    
    // Stack to track parent hierarchy [level, id]
    const parentStack: Array<{level: number, id: string}> = [];
    
    // Parse line by line with proper context tracking
    const lines = htmlContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect main sections
      if (line.includes('<!-- DEMOGRAPHICS -->') || line.includes('<h2>Demographics</h2>')) {
        currentCategoryType = 'demographics';
        console.log("📊 Processing Demographics section...");
        
        // Add Demographics root
        allCategories.push({
          id: 'demographics',
          name: 'Demographics', 
          parentId: null,
          level: 1,
          size: 'Unknown',
          categoryType: 'demographics'
        });
        parentStack.length = 0;
        parentStack.push({level: 1, id: 'demographics'});
        continue;
      }
      
      if (line.includes('<!-- INTERESTS -->') || line.includes('<h2>Interests</h2>')) {
        currentCategoryType = 'interests';
        console.log("🎯 Processing Interests section...");
        
        // Add Interests root
        allCategories.push({
          id: 'interests',
          name: 'Interests',
          parentId: null, 
          level: 1,
          size: 'Unknown',
          categoryType: 'interests'
        });
        parentStack.length = 0;
        parentStack.push({level: 1, id: 'interests'});
        continue;
      }
      
      if (line.includes('<!-- BEHAVIORS -->') || line.includes('<h2>Behaviors</h2>')) {
        currentCategoryType = 'behaviors';
        console.log("⚡ Processing Behaviors section...");
        
        // Add Behaviors root
        allCategories.push({
          id: 'behaviors',
          name: 'Behaviors',
          parentId: null,
          level: 1, 
          size: 'Unknown',
          categoryType: 'behaviors'
        });
        parentStack.length = 0;
        parentStack.push({level: 1, id: 'behaviors'});
        continue;
      }
      
      if (!currentCategoryType) continue;
      
      // Parse data-level elements
      const levelMatch = line.match(/data-level="(\d+)"/);
      if (!levelMatch) continue;
      
      const level = parseInt(levelMatch[1]);
      
      // Skip level 1 since we already added root categories
      if (level === 1) continue;
      
      let name = '';
      let size = 'Unknown';
      
      // Extract name and size based on content type
      if (line.includes('<h2>') || line.includes('<h3>') || line.includes('<h4>') || line.includes('<h5>')) {
        // Header elements (level 2, 3, 4, 5 section headers)
        const headerMatch = line.match(/<h[2-5]>([^<]+)<\/h[2-5]>/);
        if (headerMatch) {
          name = headerMatch[1].trim();
        }
      } else if (line.includes('<span class="item-name">')) {
        // Leaf items with size info
        const nameMatch = line.match(/<span class="item-name">([^<]+)<\/span>/);
        const sizeMatch = line.match(/<span class="item-size">\(([^)]+)\)<\/span>/);
        
        if (nameMatch) {
          name = nameMatch[1].trim();
        }
        if (sizeMatch) {
          size = sizeMatch[1].replace('Size: ', '').trim();
        }
      }
      
      if (!name || name.includes('(Add specific') || name.includes('placeholder')) continue;
      
      // Adjust parent stack based on current level
      while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
        parentStack.pop();
      }
      
      // Get parent ID
      const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1].id : null;
      
      // Generate clean ID
      const cleanName = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      
      const id = parentId ? `${parentId}-${cleanName}` : `${currentCategoryType}-${cleanName}`;
      
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
      
      // Add to parent stack for potential children
      parentStack.push({level, id});
      
      console.log(`  L${level}: ${name} → ${id}`);
    }
    
    console.log(`\n📊 Comprehensive parsing complete! Found ${allCategories.length} categories`);
    
    // Show breakdown by section
    const breakdown = {
      demographics: allCategories.filter(c => c.categoryType === 'demographics').length,
      interests: allCategories.filter(c => c.categoryType === 'interests').length,
      behaviors: allCategories.filter(c => c.categoryType === 'behaviors').length
    };
    
    console.log(`📋 Section breakdown:`);
    console.log(`  - Demographics: ${breakdown.demographics} categories`);
    console.log(`  - Interests: ${breakdown.interests} categories`);
    console.log(`  - Behaviors: ${breakdown.behaviors} categories`);
    
    // Show level breakdown
    const levelBreakdown = {
      level1: allCategories.filter(c => c.level === 1).length,
      level2: allCategories.filter(c => c.level === 2).length,
      level3: allCategories.filter(c => c.level === 3).length,
      level4: allCategories.filter(c => c.level === 4).length,
      level5: allCategories.filter(c => c.level === 5).length
    };
    
    console.log(`📊 Level distribution:`);
    console.log(`  - Level 1: ${levelBreakdown.level1} (root categories)`);
    console.log(`  - Level 2: ${levelBreakdown.level2} (major sections)`);
    console.log(`  - Level 3: ${levelBreakdown.level3} (subcategories)`);
    console.log(`  - Level 4: ${levelBreakdown.level4} (specific targets)`);
    console.log(`  - Level 5: ${levelBreakdown.level5} (precise targets)`);
    
    // Verify we got the key categories mentioned by user
    const workCategories = allCategories.filter(c => c.name.includes('Work') || c.parentId?.includes('work'));
    const industriesCategories = allCategories.filter(c => c.name.includes('Industries') || c.name.includes('business-to-business enterprise'));
    
    console.log(`\n🔍 Verification of key missing data:`);
    console.log(`  - Work related: ${workCategories.length} categories`);
    console.log(`  - Industries/Business: ${industriesCategories.length} categories`);
    
    workCategories.forEach(cat => {
      console.log(`    Work: L${cat.level} ${cat.name} (${cat.id})`);
    });
    
    industriesCategories.slice(0, 5).forEach(cat => {
      console.log(`    Industry: L${cat.level} ${cat.name} (${cat.id})`);
    });
    
    // Upload all to Firebase
    console.log(`\n🚀 Uploading ${allCategories.length} categories to Firebase...`);
    const categoriesWithTimestamp = allCategories.map(cat => ({
      ...cat,
      createdAt: new Date()
    }));
    
    await firebaseStorage.batchUploadTargetingCategories(categoriesWithTimestamp);
    
    console.log("✅ Comprehensive upload complete!");
    
    // Final verification
    console.log("\n🔍 Final hierarchy verification...");
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    console.log(`📊 Built hierarchy with ${hierarchical.length} root categories:`);
    hierarchical.forEach(root => {
      console.log(`\n📋 ${root.name} (Level ${root.level}, ${root.children?.length || 0} children):`);
      
      root.children?.forEach(child => {
        console.log(`  L${child.level}: ${child.name} (${child.children?.length || 0} children)`);
        if (child.name === 'Work' && child.children) {
          child.children.forEach(workChild => {
            console.log(`    L${workChild.level}: ${workChild.name} (${workChild.children?.length || 0} children)`);
            if (workChild.name === 'Industries' && workChild.children) {
              console.log(`      Found ${workChild.children.length} industry categories including:`);
              workChild.children.slice(0, 3).forEach(industry => {
                console.log(`        L${industry.level}: ${industry.name}`);
              });
            }
          });
        }
      });
    });
    
    console.log(`\n🎉 COMPREHENSIVE PARSING SUCCESS! All ${allCategories.length} categories loaded with proper hierarchy!`);
    
  } catch (error) {
    console.error("❌ Error in comprehensive parsing:", error);
    throw error;
  }
}

// Run the script
parseCompleteHtmlComprehensive().catch(console.error);