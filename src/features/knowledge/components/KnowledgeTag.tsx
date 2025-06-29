import React, { useState, useRef, useEffect } from 'react';
import { KnowledgeTag, ConfidenceLevel } from '../../../shared/types';
import './KnowledgeTag.css';

interface KnowledgeTagProps {
  tag: KnowledgeTag;
  onEdit: (id: string, updates: Partial<KnowledgeTag>) => void;
  onDelete: (id: string) => void;
}

export const KnowledgeTagComponent: React.FC<KnowledgeTagProps> = ({
  tag,
  onEdit,
  onDelete
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(tag.title);
  const [editConfidence, setEditConfidence] = useState(tag.confidence);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
        setIsEditing(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit(tag.id, {
      title: editTitle.trim(),
      confidence: editConfidence
    });
    setIsEditing(false);
    setShowPopup(false);
  };

  const handleCancel = () => {
    setEditTitle(tag.title);
    setEditConfidence(tag.confidence);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(tag.id);
    setShowPopup(false);
  };

  const getConfidenceColor = (confidence: ConfidenceLevel): string => {
    switch (confidence) {
      case 'Beginner': return '#f39c12';
      case 'Intermediate': return '#3498db';
      case 'Expert': return '#27ae60';
    }
  };

  return (
    <div className="knowledge-tag-wrapper">
      <div 
        className="knowledge-tag"
        onClick={() => setShowPopup(true)}
        style={{ borderColor: getConfidenceColor(tag.confidence) }}
      >
        <span className="tag-title">{tag.title}</span>
        <span 
          className="tag-confidence"
          style={{ color: getConfidenceColor(tag.confidence) }}
        >
          {tag.confidence}
        </span>
      </div>

      {showPopup && (
        <div className="tag-popup" ref={popupRef}>
          {!isEditing ? (
            <div className="popup-content">
              <div className="popup-header">
                <h3>{tag.title}</h3>
                <span className="popup-confidence">{tag.confidence}</span>
              </div>
              <div className="popup-meta">
                <small>Added {tag.createdAt.toLocaleDateString()}</small>
                <small>{tag.source === 'discovered' ? '🤖 AI Discovered' : '✋ Manual'}</small>
              </div>
              <div className="popup-actions">
                <button onClick={handleEdit} className="edit-btn">Edit</button>
                <button onClick={handleDelete} className="delete-btn">Delete</button>
              </div>
            </div>
          ) : (
            <div className="popup-edit">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="edit-title-input"
                placeholder="Tag title"
              />
              <select
                value={editConfidence}
                onChange={(e) => setEditConfidence(e.target.value as ConfidenceLevel)}
                className="edit-confidence-select"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn">Save</button>
                <button onClick={handleCancel} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 