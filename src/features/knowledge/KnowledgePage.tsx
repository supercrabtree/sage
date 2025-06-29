import React, { useState } from 'react';
import './KnowledgePage.css';
import { KnowledgeTagComponent, AIQuiz } from './components';
import { useKnowledgeTags } from './hooks';
import { ConfidenceLevel, KnowledgeTag } from '../../shared/types';

export const KnowledgePage: React.FC = () => {
  const {
    filteredTags,
    searchTerm,
    setSearchTerm,
    isLoading,
    addTag,
    editTag,
    deleteTag,
    tagCounts
  } = useKnowledgeTags();

  const [showAddTagForm, setShowAddTagForm] = useState(false);
  const [newTagTitle, setNewTagTitle] = useState('');
  const [newTagConfidence, setNewTagConfidence] = useState<ConfidenceLevel>('Beginner');

  const handleAddManualTag = () => {
    if (newTagTitle.trim()) {
      addTag({
        title: newTagTitle.trim(),
        confidence: newTagConfidence,
        source: 'manual'
      });
      setNewTagTitle('');
      setShowAddTagForm(false);
    }
  };

  const handleAddDiscoveredTag = (tagData: Omit<KnowledgeTag, 'id' | 'createdAt'>) => {
    addTag(tagData);
  };

  if (isLoading) {
    return (
      <div className="knowledge-container">
        <div className="loading-spinner">Loading your knowledge...</div>
      </div>
    );
  }

  return (
    <div className="knowledge-container">
      <div className="knowledge-header">
        <h1 className="knowledge-title">My Knowledge 🧠</h1>
        <div className="knowledge-stats">
          <span className="stat-item">
            📚 {tagCounts.total} total
          </span>
          <span className="stat-item">
            🟡 {tagCounts.beginner} beginner
          </span>
          <span className="stat-item">
            🔵 {tagCounts.intermediate} intermediate
          </span>
          <span className="stat-item">
            🟢 {tagCounts.expert} expert
          </span>
        </div>
      </div>
      
      <div className="knowledge-content">
        <div className="tags-section">
          <div className="tags-header">
            <h2>🏷️ Knowledge Tags</h2>
            <div className="tags-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button
                onClick={() => setShowAddTagForm(!showAddTagForm)}
                className="add-tag-btn"
                data-testid="add-tag-button"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {showAddTagForm && (
            <div className="add-tag-form" data-testid="add-tag-form">
              <input
                type="text"
                placeholder="Tag title (e.g., 'React useEffect patterns')"
                value={newTagTitle}
                onChange={(e) => setNewTagTitle(e.target.value)}
                className="tag-title-input"
                data-testid="tag-title-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAddManualTag()}
              />
              <select
                value={newTagConfidence}
                onChange={(e) => setNewTagConfidence(e.target.value as ConfidenceLevel)}
                className="tag-confidence-select"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              <div className="form-actions">
                <button onClick={handleAddManualTag} className="save-tag-btn">
                  Add
                </button>
                <button onClick={() => setShowAddTagForm(false)} className="cancel-tag-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="tags-container">
            {filteredTags.length === 0 ? (
              <div className="empty-tags-state">
                {searchTerm ? (
                  <p>No tags found matching "{searchTerm}"</p>
                ) : (
                  <div className="empty-message">
                    <p>🌱 No knowledge tags yet!</p>
                    <p>Use the AI quiz below to discover what you know, or add tags manually.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="tags-grid">
                {filteredTags.map((tag) => (
                  <KnowledgeTagComponent
                    key={tag.id}
                    tag={tag}
                    onEdit={editTag}
                    onDelete={deleteTag}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="quiz-section">
          <AIQuiz
            existingTags={filteredTags}
            onAddTag={handleAddDiscoveredTag}
          />
        </div>
      </div>
    </div>
  );
}; 