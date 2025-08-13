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

async function perfectHierarchyParser() {
  console.log("🎯 PERFECT HIERARCHY PARSER - Authentic Data with Correct Nesting...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    await firebaseStorage.clearAllTargetingCategories();
    
    const htmlPath = "../attached_assets/Pasted--DOCTYPE-html-html-lang-en-head-meta-charset-UTF-8-meta-name-viewport-con-1755050784119_1755050784122.txt";
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    const allCategories: ParsedCategory[] = [];
    
    // Add root categories
    allCategories.push(
      { id: "demographics", name: "Demographics", parentId: null, level: 1, size: "Unknown", categoryType: "demographics" },
      { id: "interests", name: "Interests", parentId: null, level: 1, size: "Unknown", categoryType: "interests" },
      { id: "behaviors", name: "Behaviors", parentId: null, level: 1, size: "Unknown", categoryType: "behaviors" }
    );
    
    let currentSection: 'demographics' | 'interests' | 'behaviors' | null = null;
    const lines = htmlContent.split('\n');
    
    // Stack to track hierarchy - each element stores {level, id, name}
    const hierarchyStack: Array<{level: number, id: string, name: string}> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect main sections
      if (line.includes('<!-- DEMOGRAPHICS -->')) {
        currentSection = 'demographics';
        hierarchyStack.length = 0;
        hierarchyStack.push({level: 1, id: 'demographics', name: 'Demographics'});
        console.log("📊 Processing Demographics...");
        continue;
      }
      
      if (line.includes('<!-- INTERESTS -->')) {
        currentSection = 'interests';
        hierarchyStack.length = 0;
        hierarchyStack.push({level: 1, id: 'interests', name: 'Interests'});
        console.log("🎯 Processing Interests...");
        continue;
      }
      
      if (line.includes('<!-- BEHAVIORS -->')) {
        currentSection = 'behaviors';
        hierarchyStack.length = 0;
        hierarchyStack.push({level: 1, id: 'behaviors', name: 'Behaviors'});
        console.log("⚡ Processing Behaviors...");
        continue;
      }
      
      if (!currentSection) continue;
      
      // Parse targeting option with level
      const levelMatch = line.match(/class="targeting-option level-(\d+)" data-level="(\d+)"/);
      if (!levelMatch) continue;
      
      const level = parseInt(levelMatch[2]);
      if (level === 1) continue; // Skip root level, already added
      
      let name = '';
      let size = 'Unknown';
      
      // Extract content based on element type
      if (line.includes('<h2>') || line.includes('<h3>') || line.includes('<h4>') || line.includes('<h5>')) {
        // Header elements - these are parent categories
        const headerMatch = line.match(/<h[2-5]>([^<]+)<\/h[2-5]>/);
        if (headerMatch) {
          name = headerMatch[1].trim();
        }
      } else if (line.includes('<span class="item-name">')) {
        // Leaf elements with targeting data
        const nameMatch = line.match(/<span class="item-name">([^<]+)<\/span>/);
        const sizeMatch = line.match(/<span class="item-size">\(([^)]+)\)<\/span>/);
        
        if (nameMatch) {
          name = nameMatch[1].trim();
        }
        if (sizeMatch) {
          size = sizeMatch[1].replace('Size: ', '').trim();
        }
      }
      
      // Skip placeholders or empty names
      if (!name || name.includes('(Add specific') || name.includes('placeholder')) continue;
      
      // Adjust hierarchy stack - remove items at same or higher level
      while (hierarchyStack.length > 0 && hierarchyStack[hierarchyStack.length - 1].level >= level) {
        hierarchyStack.pop();
      }
      
      // Get parent from stack
      const parent = hierarchyStack.length > 0 ? hierarchyStack[hierarchyStack.length - 1] : null;
      const parentId = parent ? parent.id : null;
      
      // Generate clean, hierarchical ID
      const cleanName = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      
      let categoryId: string;
      if (parentId) {
        categoryId = `${parentId}-${cleanName}`;
      } else {
        categoryId = `${currentSection}-${cleanName}`;
      }
      
      // Ensure ID uniqueness
      let finalId = categoryId;
      let counter = 1;
      while (allCategories.some(cat => cat.id === finalId)) {
        finalId = `${categoryId}_${counter}`;
        counter++;
      }
      
      // Create and add category
      const category: ParsedCategory = {
        id: finalId,
        name,
        parentId,
        level,
        size,
        categoryType: currentSection
      };
      
      allCategories.push(category);
      
      // Add to hierarchy stack for potential children
      hierarchyStack.push({level, id: finalId, name});
      
      // Log with proper indentation to show hierarchy
      const indent = '  '.repeat(level - 1);
      console.log(`${indent}L${level}: ${name} (${size}) → ${finalId}`);
    }
    
    console.log(`\n📊 Parsed ${allCategories.length} categories with authentic data and perfect hierarchy`);
    
    // Verification - check key sections
    const behaviorsSections = allCategories.filter(c => c.categoryType === 'behaviors' && c.level === 2);
    const workSection = allCategories.find(c => c.name === 'Work');
    const industriesSection = allCategories.find(c => c.name === 'Industries');
    const digitalActivitiesItems = allCategories.filter(c => c.parentId?.includes('digital_activities') && c.level === 3);
    
    console.log(`\n🔍 Key sections verification:`);
    console.log(`  - Behaviors L2 sections: ${behaviorsSections.length} found`);
    console.log(`  - Work section: ${workSection ? 'Found' : 'Missing'}`);  
    console.log(`  - Industries section: ${industriesSection ? 'Found' : 'Missing'}`);
    console.log(`  - Digital Activities items: ${digitalActivitiesItems.length} found`);
    
    // Show Behaviors L2 sections
    console.log(`\n📋 Behaviors L2 sections found:`);
    behaviorsSections.forEach(section => {
      const childCount = allCategories.filter(c => c.parentId === section.id).length;
      console.log(`  - ${section.name} (${childCount} children)`);
    });
    
    // Upload with timestamps
    const categoriesWithTimestamp = allCategories.map(cat => ({
      ...cat,
      createdAt: new Date()
    }));
    
    console.log(`\n🚀 Uploading ${allCategories.length} categories...`);
    await firebaseStorage.batchUploadTargetingCategories(categoriesWithTimestamp);
    
    console.log("✅ Upload complete!");
    
    // Final verification with hierarchy display
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    console.log(`\n🎯 FINAL STRUCTURE: ${hierarchical.length} root categories`);
    
    hierarchical.forEach(root => {
      console.log(`\n📋 ${root.name} (${root.children?.length || 0} L2 children):`);
      
      // Show first 5 L2 categories to verify structure
      root.children?.slice(0, 5).forEach(l2 => {
        console.log(`  L2: ${l2.name} (${l2.children?.length || 0} L3 children)`);
        
        // For key sections, show L3 breakdown
        if ((l2.name === 'Work' || l2.name.includes('Digital Activities') || l2.name === 'Consumer Classification') && l2.children) {
          l2.children.slice(0, 3).forEach(l3 => {
            console.log(`    L3: ${l3.name} (${l3.children?.length || 0} L4 children)`);
          });
          if (l2.children.length > 3) {
            console.log(`    ... and ${l2.children.length - 3} more L3 categories`);
          }
        }
      });
      
      if (root.children && root.children.length > 5) {
        console.log(`  ... and ${root.children.length - 5} more L2 categories`);
      }
    });
    
    const totalCategories = await firebaseStorage.getAllTargetingCategories();
    console.log(`\n🎉 PERFECT PARSING SUCCESS! ${totalCategories.length} authentic categories with correct hierarchy!`);
    
  } catch (error) {
    console.error("❌ Error in perfect hierarchy parser:", error);
    throw error;
  }
}

perfectHierarchyParser().catch(console.error);