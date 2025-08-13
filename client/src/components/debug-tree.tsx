import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface DebugTreeProps {
  categories: HierarchicalTargetingCategory[];
}

function DebugNode({ category, level = 0 }: { category: HierarchicalTargetingCategory, level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = category.children && category.children.length > 0;
  
  return (
    <div style={{ marginLeft: `${level * 20}px`, border: '1px solid #ccc', margin: '2px', padding: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {hasChildren ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ background: 'none', border: '1px solid black', padding: '2px' }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div style={{ width: '20px' }} />
        )}
        
        <span style={{ fontWeight: level === 1 ? 'bold' : 'normal' }}>
          {category.name} (L{category.level}) 
          {hasChildren && ` - ${category.children!.length} children`}
        </span>
      </div>
      
      {hasChildren && isExpanded && (
        <div style={{ marginTop: '4px' }}>
          {category.children!.map((child, index) => (
            <DebugNode key={`${child.id}-${index}`} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DebugTree({ categories }: DebugTreeProps) {
  return (
    <div style={{ border: '2px solid red', padding: '10px' }}>
      <h3>DEBUG TREE ({categories.length} root categories)</h3>
      {categories.map((category, index) => (
        <DebugNode key={`${category.id}-${index}`} category={category} />
      ))}
    </div>
  );
}