// Utility to flatten hierarchical Meta targeting data for Firebase storage
export interface MetaTargetingItem {
  id: string;
  name: string;
  size: string;
  level: number;
  parent_id: string | null;
  children?: MetaTargetingItem[];
}

export interface FlattenedTargetingCategory {
  id: string;
  name: string;
  size: string;
  level: number;
  parentId: string | null;
  categoryType: string;
}

export function flattenMetaData(data: MetaTargetingItem[]): FlattenedTargetingCategory[] {
  const flattened: FlattenedTargetingCategory[] = [];
  
  function processItem(item: MetaTargetingItem) {
    // Determine category type from ID
    let categoryType = 'interests';
    if (item.id.startsWith('demographics')) {
      categoryType = 'demographics';
    } else if (item.id.startsWith('behaviors')) {
      categoryType = 'behaviors';
    }

    // Clean size data - extract numbers from "Size: X" format
    let cleanSize = item.size;
    if (cleanSize.startsWith('Size: ')) {
      cleanSize = cleanSize.replace('Size: ', '');
    }
    if (cleanSize === 'Not available' || cleanSize === '' || cleanSize === 'Below 1000') {
      cleanSize = 'Unknown';
    }

    flattened.push({
      id: item.id,
      name: item.name,
      size: cleanSize,
      level: item.level,
      parentId: item.parent_id,
      categoryType
    });

    // Process children recursively
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => processItem(child));
    }
  }

  data.forEach(item => processItem(item));
  return flattened;
}

export function validateMetaData(data: any): data is MetaTargetingItem[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every(item => 
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.level === 'number' &&
    (item.parent_id === null || typeof item.parent_id === 'string')
  );
}