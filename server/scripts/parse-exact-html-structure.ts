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

async function parseExactHtmlStructure() {
  console.log("🎯 EXACT HTML STRUCTURE PARSING - Full Fidelity...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    await firebaseStorage.clearAllTargetingCategories();
    
    const htmlPath = "../attached_assets/Pasted--DOCTYPE-html-html-lang-en-head-meta-charset-UTF-8-meta-name-viewport-con-1755050784119_1755050784122.txt";
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    const allCategories: ParsedCategory[] = [];
    let currentCategoryType: 'demographics' | 'interests' | 'behaviors' | null = null;
    
    // Use a more robust parent tracking approach
    const levelStack: Array<{level: number, id: string, element: string}> = [];
    
    const lines = htmlContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect section boundaries with improved logic
      if (line.includes('<!-- DEMOGRAPHICS -->')) {
        currentCategoryType = 'demographics';
        console.log("📊 Processing Demographics...");
        levelStack.length = 0;
        continue;
      }
      
      if (line.includes('<!-- INTERESTS -->')) {
        currentCategoryType = 'interests';
        console.log("🎯 Processing Interests...");
        levelStack.length = 0;
        continue;
      }
      
      if (line.includes('<!-- BEHAVIORS -->')) {
        currentCategoryType = 'behaviors';
        console.log("⚡ Processing Behaviors...");
        levelStack.length = 0;
        continue;
      }
      
      if (!currentCategoryType) continue;
      
      // Match level and extract content with better parsing
      const levelMatch = line.match(/class="targeting-option level-(\d+)" data-level="(\d+)"/);
      if (!levelMatch) continue;
      
      const level = parseInt(levelMatch[2]);
      let name = '';
      let size = 'Unknown';
      
      // Parse different element types
      if (line.includes('<h2>')) {
        const match = line.match(/<h2>([^<]+)<\/h2>/);
        if (match) name = match[1].trim();
      } else if (line.includes('<h3>')) {
        const match = line.match(/<h3>([^<]+)<\/h3>/);
        if (match) name = match[1].trim();
      } else if (line.includes('<h4>')) {
        const match = line.match(/<h4>([^<]+)<\/h4>/);
        if (match) name = match[1].trim();
      } else if (line.includes('<h5>')) {
        const match = line.match(/<h5>([^<]+)<\/h5>/);
        if (match) name = match[1].trim();
      } else if (line.includes('<span class="item-name">')) {
        const nameMatch = line.match(/<span class="item-name">([^<]+)<\/span>/);
        const sizeMatch = line.match(/<span class="item-size">\(([^)]+)\)<\/span>/);
        
        if (nameMatch) name = nameMatch[1].trim();
        if (sizeMatch) size = sizeMatch[1].replace('Size: ', '').trim();
      }
      
      // Skip empty, placeholder, or invalid entries
      if (!name || name.includes('(Add specific') || name.includes('placeholder')) continue;
      
      // Add root category if at level 1
      if (level === 1 && currentCategoryType) {
        const rootCategory: ParsedCategory = {
          id: currentCategoryType,
          name: name,
          parentId: null,
          level: 1,
          size: 'Unknown',
          categoryType: currentCategoryType
        };
        allCategories.push(rootCategory);
        levelStack.length = 0;
        levelStack.push({level: 1, id: currentCategoryType, element: 'root'});
        console.log(`  L1: ${name} → ${currentCategoryType}`);
        continue;
      }
      
      // Adjust the level stack - pop elements that are at same or higher level
      while (levelStack.length > 0 && levelStack[levelStack.length - 1].level >= level) {
        levelStack.pop();
      }
      
      // Find parent ID
      const parentId = levelStack.length > 0 ? levelStack[levelStack.length - 1].id : null;
      
      // Generate clean, unique ID
      const cleanName = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 60);
      
      let id: string;
      if (parentId) {
        id = `${parentId}-${cleanName}`;
      } else {
        id = `${currentCategoryType}-${cleanName}`;
      }
      
      // Ensure ID uniqueness by checking existing categories
      let finalId = id;
      let counter = 1;
      while (allCategories.some(cat => cat.id === finalId)) {
        finalId = `${id}_${counter}`;
        counter++;
      }
      
      const category: ParsedCategory = {
        id: finalId,
        name,
        parentId,
        level,
        size,
        categoryType: currentCategoryType
      };
      
      allCategories.push(category);
      levelStack.push({level, id: finalId, element: name});
      
      console.log(`  L${level}: ${name} → ${finalId}`);
    }
    
    console.log(`\n📊 Exact structure parsing complete: ${allCategories.length} categories`);
    
    // Verify we captured the key sections the user mentioned
    const workSection = allCategories.find(c => c.name === 'Work');
    const workIndustries = allCategories.filter(c => c.parentId?.includes('work') && c.name === 'Industries');
    const businessEnterprise = allCategories.filter(c => c.name.includes('business-to-business enterprise'));
    
    console.log('\n🔍 Key sections verification:');
    console.log(`  - Work section: ${workSection ? 'Found' : 'MISSING'}`);
    console.log(`  - Industries under Work: ${workIndustries.length} found`);
    console.log(`  - Business enterprise categories: ${businessEnterprise.length} found`);
    
    // Show Behaviors L2 categories  
    const behaviorsL2 = allCategories.filter(c => c.categoryType === 'behaviors' && c.level === 2);
    console.log(`\n📋 Behaviors L2 categories (${behaviorsL2.length} found):`);
    behaviorsL2.forEach(cat => {
      console.log(`  - ${cat.name}`);
    });
    
    // Upload with timestamp
    const categoriesWithTimestamp = allCategories.map(cat => ({
      ...cat,
      createdAt: new Date()
    }));
    
    console.log(`\n🚀 Uploading ${allCategories.length} categories...`);
    await firebaseStorage.batchUploadTargetingCategories(categoriesWithTimestamp);
    
    console.log("✅ Upload complete!");
    
    // Final verification with hierarchy display
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    console.log(`\n🎯 Final hierarchy: ${hierarchical.length} root categories`);
    
    hierarchical.forEach(root => {
      console.log(`\n📋 ${root.name} (L${root.level}, ${root.children?.length || 0} children):`);
      
      root.children?.forEach(child => {
        console.log(`  L${child.level}: ${child.name} (${child.children?.length || 0} children)`);
        
        // Special focus on Work to verify Industries structure
        if (child.name === 'Work' && child.children) {
          child.children.forEach(workChild => {
            console.log(`    L${workChild.level}: ${workChild.name} (${workChild.children?.length || 0} children)`);
            if (workChild.name === 'Industries' && workChild.children) {
              console.log(`      Found ${workChild.children.length} industry categories:`);
              workChild.children.slice(0, 5).forEach(industry => {
                console.log(`        L${industry.level}: ${industry.name} - ${industry.size}`);
              });
              if (workChild.children.length > 5) {
                console.log(`        ... and ${workChild.children.length - 5} more industries`);
              }
            }
          });
        }
      });
    });
    
    const finalCount = await firebaseStorage.getAllTargetingCategories();
    console.log(`\n🎉 EXACT PARSING SUCCESS! ${finalCount.length} categories with perfect hierarchy!`);
    
  } catch (error) {
    console.error("❌ Error in exact parsing:", error);
    throw error;
  }
}

parseExactHtmlStructure().catch(console.error);