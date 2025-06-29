import React from 'react';
import { KnowledgeTag } from '../../../shared/types';
import './SuggestedTags.css';

interface SuggestedTagsProps {
  tags: Omit<KnowledgeTag, 'id' | 'createdAt'>[];
  onAddTag: (tag: Omit<KnowledgeTag, 'id' | 'createdAt'>) => void;
  title?: string;
  className?: string;
}

export const SuggestedTags: React.FC<SuggestedTagsProps> = ({ 
  tags, 
  onAddTag, 
  title = "💡 Suggested tags:",
  className = ""
}) => {
  if (tags.length === 0) return null;

  return (
    <div className={`suggested-tags ${className}`}>
      <p className="suggested-tags-title">{title}</p>
      <div className="suggested-tags-list">
        {tags.map((tag, index) => (
          <button
            key={index}
            onClick={() => onAddTag(tag)}
            className="suggested-tag-btn"
          >
            + {tag.title} ({tag.confidence})
          </button>
        ))}
      </div>
    </div>
  );
}; 