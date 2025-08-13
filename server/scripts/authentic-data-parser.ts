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

async function parseAuthenticData() {
  console.log("🔍 AUTHENTIC DATA PARSER - Complete HTML parsing...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    await firebaseStorage.clearAllTargetingCategories();
    
    const htmlPath = "../attached_assets/Pasted--DOCTYPE-html-html-lang-en-head-meta-charset-UTF-8-meta-name-viewport-con-1755050784119_1755050784122.txt";
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    console.log("📄 HTML file loaded, parsing structure...");
    
    const allCategories: ParsedCategory[] = [];
    
    // Add root categories
    allCategories.push(
      { id: "demographics", name: "Demographics", parentId: null, level: 1, size: "Unknown", categoryType: "demographics" },
      { id: "interests", name: "Interests", parentId: null, level: 1, size: "Unknown", categoryType: "interests" },
      { id: "behaviors", name: "Behaviors", parentId: null, level: 1, size: "Unknown", categoryType: "behaviors" }
    );
    
    // Split into sections
    const sections = htmlContent.split(/<!-- (DEMOGRAPHICS|INTERESTS|BEHAVIORS) -->/);
    
    for (let i = 0; i < sections.length; i++) {
      const sectionType = sections[i];
      const sectionContent = sections[i + 1];
      
      if (!sectionContent || !['DEMOGRAPHICS', 'INTERESTS', 'BEHAVIORS'].includes(sectionType)) continue;
      
      const categoryType = sectionType.toLowerCase() as 'demographics' | 'interests' | 'behaviors';
      console.log(`\n📊 Processing ${sectionType}...`);
      
      // Parse the section content line by line with proper hierarchy tracking
      const lines = sectionContent.split('\n');
      const parentStack: Array<{level: number, id: string, name: string}> = [];
      
      // Initialize with root
      parentStack.push({ level: 1, id: categoryType, name: sectionType });
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines or non-targeting lines
        if (!trimmedLine || !trimmedLine.includes('targeting-option')) continue;
        
        // Extract level
        const levelMatch = trimmedLine.match(/data-level="(\d+)"/);
        if (!levelMatch) continue;
        
        const level = parseInt(levelMatch[1]);
        if (level === 1) continue; // Skip root level
        
        let name = '';
        let size = 'Unknown';
        
        // Extract name and size based on element type
        if (trimmedLine.includes('<h2>') || trimmedLine.includes('<h3>') || trimmedLine.includes('<h4>') || trimmedLine.includes('<h5>')) {
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
        
        // Skip if no valid name or placeholder content
        if (!name || name.includes('(Add specific') || name.includes('placeholder')) continue;
        
        // Adjust parent stack for current level
        while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
          parentStack.pop();
        }
        
        // Get parent ID
        const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1].id : null;
        
        // Generate clean ID
        const cleanName = name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 60);
        
        let id: string;
        if (parentId) {
          id = `${parentId}-${cleanName}`;
        } else {
          id = `${categoryType}-${cleanName}`;
        }
        
        // Ensure uniqueness
        let finalId = id;
        let counter = 1;
        while (allCategories.some(cat => cat.id === finalId)) {
          finalId = `${id}_${counter}`;
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
        
        console.log(`  L${level}: ${name} (${size})`);
      }
    }
    
    console.log(`\n📊 Parsed ${allCategories.length} authentic categories from HTML`);
    
    // Show verification of key sections
    const anniversaryItems = allCategories.filter(c => c.parentId?.includes('anniversary'));
    const digitalActivitiesItems = allCategories.filter(c => c.parentId?.includes('digital_activities') && !c.parentId?.includes('team'));
    const travelItems = allCategories.filter(c => c.parentId?.includes('travel'));
    const workIndustries = allCategories.filter(c => c.parentId?.includes('industries'));
    
    console.log(`\n🔍 Data verification:`);
    console.log(`  - Anniversary items: ${anniversaryItems.length}`);
    console.log(`  - Digital Activities items: ${digitalActivitiesItems.length}`);
    console.log(`  - Travel items: ${travelItems.length}`);
    console.log(`  - Work Industries: ${workIndustries.length}`);
    
    // Upload with timestamp
    const categoriesWithTimestamp = allCategories.map(cat => ({
      ...cat,
      createdAt: new Date()
    }));
    
    console.log(`\n🚀 Uploading ${allCategories.length} authentic categories...`);
    await firebaseStorage.batchUploadTargetingCategories(categoriesWithTimestamp);
    
    console.log("✅ Upload complete!");
    
    // Final verification
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    console.log(`\n🎯 Final structure: ${hierarchical.length} root categories`);
    
    hierarchical.forEach(root => {
      console.log(`\n📋 ${root.name} (${root.children?.length || 0} L2 children):`);
      
      root.children?.slice(0, 10).forEach(l2 => {
        console.log(`  L2: ${l2.name} (${l2.children?.length || 0} L3 children)`);
        
        // Show sample of L3 for categories with many children
        if (l2.children && l2.children.length > 0) {
          l2.children.slice(0, 3).forEach(l3 => {
            console.log(`    L3: ${l3.name} (${l3.children?.length || 0} L4 children)`);
          });
          if (l2.children.length > 3) {
            console.log(`    ... and ${l2.children.length - 3} more L3 categories`);
          }
        }
      });
      
      if (root.children && root.children.length > 10) {
        console.log(`  ... and ${root.children.length - 10} more L2 categories`);
      }
    });
    
    const finalCount = await firebaseStorage.getAllTargetingCategories();
    console.log(`\n🎉 AUTHENTIC DATA PARSING COMPLETE! ${finalCount.length} real categories from HTML!`);
    
  } catch (error) {
    console.error("❌ Error parsing authentic data:", error);
    throw error;
  }
}

parseAuthenticData().catch(console.error);