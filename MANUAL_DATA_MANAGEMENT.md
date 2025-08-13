# Manual Data Management Guide

## Current Data Status
- **Storage**: Firebase Firestore database
- **Current Count**: 636/673 authentic Meta targeting categories (94.5% complete)
- **Structure**: 5-level hierarchy (L1:3, L2:26, L3:234, L4:359, L5:14)

## How to Add New Categories

### Method 1: Using the Database Scripts
1. Create a new script file in `server/scripts/`
2. Use the storage interface to add categories:

```typescript
import { storage } from '../storage-factory';

const newCategory = {
  id: 'interests-your_new_category',
  name: 'Your New Category',
  size: '1,234,567',
  level: 3,
  parentId: 'interests-parent_category', // Must exist
  categoryType: 'interests' // or 'behaviors' or 'demographics'
};

await storage.createTargetingCategory(newCategory);
```

### Method 2: Using the API Directly
Send a POST request to `/api/targeting-categories`:

```bash
curl -X POST http://localhost:5000/api/targeting-categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your New Category",
    "size": "1,234,567",
    "level": 3,
    "parentId": "interests-parent_category",
    "categoryType": "interests"
  }'
```

## How to Edit Existing Categories

### Update a Category
```typescript
await storage.updateTargetingCategory('category-id', {
  name: 'Updated Name',
  size: '2,345,678'
});
```

### Delete a Category
```typescript
await storage.deleteTargetingCategory('category-id');
```

## Database Access Options

### 1. Firebase Console (Recommended)
- Go to Firebase Console for your project
- Navigate to Firestore Database
- Browse the `targeting_categories` collection
- Add, edit, or delete documents directly

### 2. Using Database Scripts
- Create scripts in `server/scripts/` folder
- Run with: `cd server && npx tsx scripts/your-script.ts`

### 3. API Endpoints
- GET `/api/targeting-categories` - List all
- GET `/api/targeting-categories/hierarchical` - Tree structure
- POST `/api/targeting-categories` - Create new
- PUT `/api/targeting-categories/:id` - Update
- DELETE `/api/targeting-categories/:id` - Delete

## Category Structure Requirements

### Essential Fields
- `id`: Unique identifier (format: `{type}-{name}`)
- `name`: Display name
- `size`: Audience size (e.g., "1,234,567" or "Not available")
- `level`: Hierarchy level (1-5)
- `parentId`: Parent category ID (null for level 1)
- `categoryType`: 'interests', 'behaviors', or 'demographics'

### Level Guidelines
- **Level 1**: Main categories (Demographics, Interests, Behaviors)
- **Level 2**: Primary subcategories
- **Level 3**: Secondary subcategories  
- **Level 4**: Specific targeting options
- **Level 5**: Very specific targeting options

## Current Missing Categories
To complete the authentic dataset, we need 37 more categories:
- L2: 1 missing
- L3: 14 missing  
- L4: 22 missing

These can be found by comparing against the original HTML source in `attached_assets/meta-data.html_1755059333942.txt`.

## Backup and Restore
- Database is automatically backed up by Firebase
- Use the extraction scripts to rebuild from HTML source if needed
- All scripts are preserved in `server/scripts/` for future use