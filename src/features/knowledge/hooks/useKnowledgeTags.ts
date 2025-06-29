import { useState, useEffect } from 'react';
import { KnowledgeTag } from '../../../shared/types';
import { saveKnowledgeTags, loadKnowledgeTags } from '../../../shared/utils/storage';

export const useKnowledgeTags = () => {
  const [tags, setTags] = useState<KnowledgeTag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load tags on mount
  useEffect(() => {
    const loadedTags = loadKnowledgeTags();
    setTags(loadedTags);
    setIsLoading(false);
  }, []);

  // Save tags whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveKnowledgeTags(tags);
    }
  }, [tags, isLoading]);

  const addTag = (tagData: Omit<KnowledgeTag, 'id' | 'createdAt'>) => {
    const newTag: KnowledgeTag = {
      ...tagData,
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  const editTag = (id: string, updates: Partial<KnowledgeTag>) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  };

  const clearAllTags = () => {
    setTags([]);
  };

  // Filter tags based on search term
  const filteredTags = tags.filter(tag =>
    tag.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get tags by confidence level
  const getTagsByConfidence = (confidence: KnowledgeTag['confidence']) => {
    return filteredTags.filter(tag => tag.confidence === confidence);
  };

  // Get tag counts
  const tagCounts = {
    total: tags.length,
    beginner: tags.filter(tag => tag.confidence === 'Beginner').length,
    intermediate: tags.filter(tag => tag.confidence === 'Intermediate').length,
    expert: tags.filter(tag => tag.confidence === 'Expert').length,
    discovered: tags.filter(tag => tag.source === 'discovered').length,
    manual: tags.filter(tag => tag.source === 'manual').length
  };

  return {
    tags,
    filteredTags,
    searchTerm,
    setSearchTerm,
    isLoading,
    addTag,
    editTag,
    deleteTag,
    clearAllTags,
    getTagsByConfidence,
    tagCounts
  };
}; 