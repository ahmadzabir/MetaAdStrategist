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

async function completeHtmlExtractor() {
  console.log("🔍 COMPLETE HTML EXTRACTOR - Every single category from HTML...");
  
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
    
    // Split content into sections
    const sections = htmlContent.split(/<!-- (DEMOGRAPHICS|INTERESTS|BEHAVIORS) -->/);
    let sectionIndex = 0;
    
    for (let i = 1; i < sections.length; i += 2) {
      const sectionName = sections[i] as 'DEMOGRAPHICS' | 'INTERESTS' | 'BEHAVIORS';
      const sectionContent = sections[i + 1];
      
      if (!sectionContent) continue;
      
      const categoryType = sectionName.toLowerCase() as 'demographics' | 'interests' | 'behaviors';
      console.log(`\n📊 Extracting ALL data from ${sectionName}...`);
      
      const lines = sectionContent.split('\n');
      const parentStack: Array<{level: number, id: string, name: string}> = [];
      
      // Initialize with root
      parentStack.push({ level: 1, id: categoryType, name: sectionName });
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip non-targeting lines
        if (!trimmedLine || !trimmedLine.includes('targeting-option')) continue;
        
        // Extract level
        const levelMatch = trimmedLine.match(/data-level="(\d+)"/);
        if (!levelMatch) continue;
        
        const level = parseInt(levelMatch[1]);
        if (level === 1) continue; // Skip root
        
        let name = '';
        let size = 'Unknown';
        
        // Extract name and size
        if (trimmedLine.includes('<h2>') || trimmedLine.includes('<h3>') || 
            trimmedLine.includes('<h4>') || trimmedLine.includes('<h5>')) {
          const headerMatch = trimmedLine.match(/<h[2-5]>([^<]+)<\/h[2-5]>/);
          if (headerMatch) {
            name = headerMatch[1].trim();
          }
        } else if (trimmedLine.includes('<span class="item-name">')) {
          const nameMatch = trimmedLine.match(/<span class="item-name">([^<]+)<\/span>/);
          const sizeMatch = trimmedLine.match(/<span class="item-size">\(([^)]+)\)<\/span>/);
          
          if (nameMatch) {
            name = nameMatch[1].trim();
          }
          if (sizeMatch) {
            size = sizeMatch[1].replace('Size: ', '').trim();
          }
        }
        
        // Skip if no valid name or placeholder
        if (!name || name.includes('(Add specific') || name.includes('placeholder')) continue;
        
        // Clean up HTML entities
        name = name.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        
        // Adjust parent stack
        while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
          parentStack.pop();
        }
        
        // Get parent
        const parent = parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;
        const parentId = parent ? parent.id : null;
        
        // Generate ID
        const cleanName = name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 50);
        
        let categoryId = parentId ? `${parentId}-${cleanName}` : `${categoryType}-${cleanName}`;
        
        // Ensure uniqueness
        let finalId = categoryId;
        let counter = 1;
        while (allCategories.some(cat => cat.id === finalId)) {
          finalId = `${categoryId}_${counter}`;
          counter++;
        }
        
        // Create category
        const category: ParsedCategory = {
          id: finalId,
          name,
          parentId,
          level,
          size,
          categoryType
        };
        
        allCategories.push(category);
        parentStack.push({ level, id: finalId, name });
        
        // Log with indentation
        const indent = '  '.repeat(level - 1);
        console.log(`${indent}L${level}: ${name} (${size})`);
      }
    }
    
    console.log(`\n📊 Extracted ${allCategories.length} complete categories from HTML`);
    
    // Show verification of key missing sections
    const entertainmentItems = allCategories.filter(c => c.parentId?.includes('entertainment'));
    const foodDrinkItems = allCategories.filter(c => c.parentId?.includes('food_and_drink'));
    const fitnessItems = allCategories.filter(c => c.parentId?.includes('fitness_and_wellness'));
    const digitalActivitiesReal = allCategories.filter(c => c.parentId?.includes('digital_activities') && c.level === 3);
    
    console.log(`\n🔍 Previously missing data verification:`);
    console.log(`  - Entertainment subcategories: ${entertainmentItems.length}`);
    console.log(`  - Food and drink subcategories: ${foodDrinkItems.length}`);
    console.log(`  - Fitness and wellness subcategories: ${fitnessItems.length}`);
    console.log(`  - Digital Activities L3 items: ${digitalActivitiesReal.length}`);
    
    // Upload with timestamp
    const categoriesWithTimestamp = allCategories.map(cat => ({
      ...cat,
      createdAt: new Date()
    }));
    
    console.log(`\n🚀 Uploading ${allCategories.length} complete categories...`);
    await firebaseStorage.batchUploadTargetingCategories(categoriesWithTimestamp);
    
    console.log("✅ Upload complete!");
    
    // Final verification
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    console.log(`\n🎯 COMPLETE DATA STRUCTURE: ${hierarchical.length} root categories`);
    
    hierarchical.forEach(root => {
      console.log(`\n📋 ${root.name} (${root.children?.length || 0} L2 children):`);
      
      // Show all L2 categories to verify completeness
      root.children?.forEach(l2 => {
        console.log(`  L2: ${l2.name} (${l2.children?.length || 0} L3 children)`);
        
        // Show detailed breakdown for Entertainment and other key Interests sections
        if ((l2.name === 'Entertainment' || l2.name === 'Food and drink' || 
             l2.name === 'Fitness and wellness') && l2.children && l2.children.length > 0) {
          console.log(`    📺 ${l2.name} L3 categories:`);
          l2.children.slice(0, 10).forEach(l3 => {
            console.log(`      L3: ${l3.name} (${l3.children?.length || 0} L4 children)`);
          });
          if (l2.children.length > 10) {
            console.log(`      ... and ${l2.children.length - 10} more L3 categories`);
          }
        }
      });
    });
    
    const totalCategories = await firebaseStorage.getAllTargetingCategories();
    console.log(`\n🎉 COMPLETE HTML EXTRACTION SUCCESS! ${totalCategories.length} authentic categories with all missing data!`);
    
  } catch (error) {
    console.error("❌ Error in complete HTML extractor:", error);
    throw error;
  }
}

completeHtmlExtractor().catch(console.error);