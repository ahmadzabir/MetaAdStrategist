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

function generateId(name: string, parentId: string | null, categoryType: string): string {
  const cleanName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  if (parentId) {
    return `${parentId}-${cleanName}`;
  } else {
    return `${categoryType}-${cleanName}`;
  }
}

function extractFromJsonData(data: any, parentId: string | null, level: number, categoryType: 'demographics' | 'interests' | 'behaviors', allCategories: ParsedCategory[]) {
  if (Array.isArray(data)) {
    data.forEach(item => extractFromJsonData(item, parentId, level, categoryType, allCategories));
  } else if (data && typeof data === 'object') {
    if (data.name) {
      // Generate unique ID
      let id = generateId(data.name, parentId, categoryType);
      let counter = 1;
      while (allCategories.some(cat => cat.id === id)) {
        id = generateId(data.name, parentId, categoryType) + `_${counter}`;
        counter++;
      }
      
      const size = data.size || data.placeholder || "Unknown";
      
      const category: ParsedCategory = {
        id,
        name: data.name,
        parentId,
        level,
        size,
        categoryType
      };
      
      allCategories.push(category);
      
      // Process children
      if (data.children && Array.isArray(data.children)) {
        data.children.forEach((child: any) => {
          extractFromJsonData(child, id, level + 1, categoryType, allCategories);
        });
      }
    }
  }
}

async function extractCompleteDataset() {
  console.log("🎯 EXTRACTING COMPLETE DATASET from HTML file...");
  
  const firebaseStorage = new FirebaseStorage();
  
  try {
    await firebaseStorage.clearAllTargetingCategories();
    
    const htmlPath = "../attached_assets/Pasted--DOCTYPE-html-html-lang-en-head-meta-charset-UTF-8-meta-name-viewport-con-1755053132286_1755053132288.txt";
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    // Extract the JavaScript data section
    const dataStart = htmlContent.indexOf('const targetingData = [');
    const dataEnd = htmlContent.indexOf('];', dataStart) + 2;
    
    if (dataStart === -1 || dataEnd === -1) {
      throw new Error("Could not find targetingData in HTML file");
    }
    
    const dataSection = htmlContent.substring(dataStart, dataEnd);
    let jsonString = dataSection.replace('const targetingData = ', '');
    
    // Clean up the JavaScript to make it valid JSON
    jsonString = jsonString
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // Quote object keys
      .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_\s]*[a-zA-Z0-9_])\s*([,}])/g, ': "$1"$2')  // Quote unquoted string values
      .replace(/"/g, '"')  // Fix quote marks
      .replace(/"/g, '"');  // Fix quote marks
    
    // Parse the JSON data
    const targetingData = JSON.parse(jsonString);
    
    console.log(`📊 Found ${targetingData.length} root categories in HTML data`);
    
    const allCategories: ParsedCategory[] = [];
    
    // Add root categories
    allCategories.push(
      { id: "demographics", name: "Demographics", parentId: null, level: 1, size: "Unknown", categoryType: "demographics" },
      { id: "interests", name: "Interests", parentId: null, level: 1, size: "Unknown", categoryType: "interests" },
      { id: "behaviors", name: "Behaviors", parentId: null, level: 1, size: "Unknown", categoryType: "behaviors" }
    );
    
    // Process each main section
    targetingData.forEach((section: any) => {
      let categoryType: 'demographics' | 'interests' | 'behaviors';
      
      if (section.name === 'Demographics') {
        categoryType = 'demographics';
      } else if (section.name === 'Interests') {
        categoryType = 'interests';
      } else if (section.name === 'Behaviors') {
        categoryType = 'behaviors';
      } else {
        return; // Skip unknown sections
      }
      
      console.log(`\n📊 Processing ${section.name}...`);
      
      // Process children of this section
      if (section.children && Array.isArray(section.children)) {
        section.children.forEach((child: any) => {
          extractFromJsonData(child, categoryType, 2, categoryType, allCategories);
        });
      }
    });
    
    console.log(`\n📊 Extracted ${allCategories.length} complete categories from HTML data`);
    
    // Show verification
    const demographicsCount = allCategories.filter(c => c.categoryType === 'demographics').length;
    const interestsCount = allCategories.filter(c => c.categoryType === 'interests').length;
    const behaviorsCount = allCategories.filter(c => c.categoryType === 'behaviors').length;
    
    console.log(`\n🔍 Category breakdown:`);
    console.log(`  - Demographics: ${demographicsCount} categories`);
    console.log(`  - Interests: ${interestsCount} categories`);
    console.log(`  - Behaviors: ${behaviorsCount} categories`);
    
    // Check specific sections that were missing
    const entertainmentItems = allCategories.filter(c => c.name.toLowerCase().includes('entertainment') || c.parentId?.includes('entertainment'));
    const foodDrinkItems = allCategories.filter(c => c.name.toLowerCase().includes('food') || c.parentId?.includes('food'));
    const workIndustries = allCategories.filter(c => c.parentId?.includes('industries'));
    const digitalActivities = allCategories.filter(c => c.parentId?.includes('digital_activities'));
    
    console.log(`\n📋 Key sections verification:`);
    console.log(`  - Entertainment related: ${entertainmentItems.length} categories`);
    console.log(`  - Food and drink related: ${foodDrinkItems.length} categories`);
    console.log(`  - Work industries: ${workIndustries.length} categories`);
    console.log(`  - Digital activities: ${digitalActivities.length} categories`);
    
    // Upload with timestamps
    const categoriesWithTimestamp = allCategories.map(cat => ({
      ...cat,
      createdAt: new Date()
    }));
    
    console.log(`\n🚀 Uploading ${allCategories.length} categories...`);
    await firebaseStorage.batchUploadTargetingCategories(categoriesWithTimestamp);
    
    console.log("✅ Upload complete!");
    
    // Final verification
    const hierarchical = await firebaseStorage.getHierarchicalTargetingCategories();
    
    console.log(`\n🎯 FINAL STRUCTURE: ${hierarchical.length} root categories`);
    
    hierarchical.forEach(root => {
      console.log(`\n📋 ${root.name} (${root.children?.length || 0} L2 children):`);
      
      root.children?.slice(0, 8).forEach(l2 => {
        console.log(`  L2: ${l2.name} (${l2.children?.length || 0} L3 children)`);
        
        // Show Entertainment detailed structure
        if (l2.name === 'Entertainment' && l2.children) {
          console.log(`    🎬 Entertainment sections:`);
          l2.children.slice(0, 5).forEach(l3 => {
            console.log(`      L3: ${l3.name} (${l3.children?.length || 0} L4 children)`);
          });
        }
        
        // Show Food and drink detailed structure  
        if (l2.name === 'Food and drink' && l2.children) {
          console.log(`    🍕 Food and drink sections:`);
          l2.children.forEach(l3 => {
            console.log(`      L3: ${l3.name} (${l3.children?.length || 0} L4 children)`);
          });
        }
        
        // Show Work → Industries
        if (l2.name === 'Work' && l2.children) {
          l2.children.forEach(l3 => {
            if (l3.name === 'Industries' && l3.children) {
              console.log(`    🏢 Industries (${l3.children.length} categories):`);
              l3.children.slice(0, 3).forEach(l4 => {
                console.log(`      L4: ${l4.name}`);
              });
              if (l3.children.length > 3) {
                console.log(`      ... and ${l3.children.length - 3} more industries`);
              }
            }
          });
        }
      });
      
      if (root.children && root.children.length > 8) {
        console.log(`  ... and ${root.children.length - 8} more L2 categories`);
      }
    });
    
    const totalCategories = await firebaseStorage.getAllTargetingCategories();
    console.log(`\n🎉 COMPLETE EXTRACTION SUCCESS! ${totalCategories.length} authentic categories with perfect data!`);
    
  } catch (error) {
    console.error("❌ Error extracting complete dataset:", error);
    throw error;
  }
}

extractCompleteDataset().catch(console.error);