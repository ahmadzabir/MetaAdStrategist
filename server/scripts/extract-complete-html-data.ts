import * as fs from 'fs';
import * as path from 'path';
import { FirebaseStorage } from '../services/firebase';

// Read the HTML file and extract all targeting categories
const htmlFilePath = path.join(process.cwd(), '..', 'attached_assets', 'Pasted--DOCTYPE-html-html-lang-en-head-meta-charset-UTF-8-meta-name-viewport-con-1755050784119_1755050784122.txt');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

interface CategoryExtraction {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  size: string;
  categoryType: string;
}

function extractCategories(html: string): CategoryExtraction[] {
  const categories: CategoryExtraction[] = [];
  const lines = html.split('\n');
  
  // Track current hierarchy
  const hierarchyStack: Array<{name: string, id: string, level: number}> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract level from class
    const levelMatch = line.match(/level-(\d+)/);
    if (!levelMatch) continue;
    
    const level = parseInt(levelMatch[1]);
    
    // Pop hierarchy stack to current level
    while (hierarchyStack.length >= level) {
      hierarchyStack.pop();
    }
    
    // Handle header tags (h2, h3, h4, h5) - these are parent categories
    const headerMatch = line.match(/<h[2-5]>([^<]+)<\/h[2-5]>/);
    if (headerMatch) {
      const name = headerMatch[1];
      const id = generateId(name, level, hierarchyStack);
      const parentId = hierarchyStack.length > 0 ? hierarchyStack[hierarchyStack.length - 1].id : null;
      const categoryType = determineCategoryType(name, hierarchyStack);
      
      categories.push({
        id,
        name,
        parentId,
        level,
        size: "Unknown",
        categoryType
      });
      
      hierarchyStack.push({ name, id, level });
      continue;
    }
    
    // Handle item-name spans - these are leaf categories with sizes
    const itemMatch = line.match(/<span class="item-name">([^<]+)<\/span>\s*<span class="item-size">\(Size: ([^)]+)\)<\/span>/);
    if (itemMatch) {
      const name = itemMatch[1];
      const sizeText = itemMatch[2];
      const size = sizeText === "Not available" || sizeText === "Below 1000" ? "Unknown" : sizeText;
      
      const id = generateId(name, level, hierarchyStack);
      const parentId = hierarchyStack.length > 0 ? hierarchyStack[hierarchyStack.length - 1].id : null;
      const categoryType = determineCategoryType(name, hierarchyStack);
      
      categories.push({
        id,
        name,
        parentId,
        level,
        size,
        categoryType
      });
      continue;
    }
    
    // Handle standalone item-name spans without explicit size
    const standaloneMatch = line.match(/<span class="item-name">([^<]+)<\/span>/);
    if (standaloneMatch) {
      const name = standaloneMatch[1];
      const id = generateId(name, level, hierarchyStack);
      const parentId = hierarchyStack.length > 0 ? hierarchyStack[hierarchyStack.length - 1].id : null;
      const categoryType = determineCategoryType(name, hierarchyStack);
      
      categories.push({
        id,
        name,
        parentId,
        level,
        size: "Unknown",
        categoryType
      });
    }
  }
  
  return categories;
}

function generateId(name: string, level: number, hierarchyStack: Array<{name: string, id: string, level: number}>): string {
  // Create hierarchical ID
  const pathParts = hierarchyStack.map(h => slugify(h.name));
  pathParts.push(slugify(name));
  return pathParts.join('-');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '_') // Replace multiple hyphens with underscores
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

function determineCategoryType(name: string, hierarchyStack: Array<{name: string, id: string, level: number}>): string {
  // Look at the root category to determine type
  if (hierarchyStack.length === 0) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('demographic')) return 'demographics';
    if (lowerName.includes('interest')) return 'interests';
    if (lowerName.includes('behavior')) return 'behaviors';
    return 'unknown';
  }
  
  const rootCategory = hierarchyStack[0].name.toLowerCase();
  if (rootCategory.includes('demographic')) return 'demographics';
  if (rootCategory.includes('interest')) return 'interests';
  if (rootCategory.includes('behavior')) return 'behaviors';
  return 'unknown';
}

async function main() {
  console.log('Extracting categories from HTML file...');
  const categories = extractCategories(htmlContent);
  
  console.log(`Extracted ${categories.length} categories`);
  
  // Group by category type
  const byType = categories.reduce((acc, cat) => {
    acc[cat.categoryType] = (acc[cat.categoryType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Categories by type:', byType);
  
  // Save to JSON file for inspection
  fs.writeFileSync(
    path.join(process.cwd(), 'extracted-categories.json'),
    JSON.stringify(categories, null, 2)
  );
  
  console.log('Categories saved to extracted-categories.json');
  
  // Clear database and upload complete dataset
  console.log('Uploading to Firebase...');
  const storage = new FirebaseStorage();
  
  // Delete all existing categories
  console.log('Clearing existing categories...');
  // Note: This would need the clearAllTargetingCategories method
  
  // Upload all categories
  let uploaded = 0;
  for (const category of categories) {
    try {
      await storage.createTargetingCategory({
        name: category.name,
        parentId: category.parentId,
        level: category.level,
        size: category.size,
        categoryType: category.categoryType as any
      });
      uploaded++;
      if (uploaded % 50 === 0) {
        console.log(`Uploaded ${uploaded}/${categories.length} categories...`);
      }
    } catch (error) {
      console.error(`Failed to upload category "${category.name}":`, error);
    }
  }
  
  console.log(`Successfully uploaded ${uploaded} categories`);
}

if (require.main === module) {
  main().catch(console.error);
}