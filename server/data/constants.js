const SECTIONS = [
  { id: 'math',     label: 'Mathématiques',         icon: '∑',  color: '#6366f1' },
  { id: 'sciences', label: 'Sciences Expérimentales', icon: '🔬', color: '#10b981' },
  { id: 'eco',      label: 'Économie & Gestion',    icon: '📈', color: '#f59e0b' },
  { id: 'tech',     label: 'Technique',              icon: '⚙️', color: '#3b82f6' },
  { id: 'lettres',  label: 'Lettres',                icon: '📚', color: '#ec4899' },
  { id: 'info',     label: 'Informatique',           icon: '💻', color: '#8b5cf6' },
  { id: 'sport',    label: 'Sport',                  icon: '🏃', color: '#ef4444' },
];

const SUBJECTS = {
  math:     ['Mathématiques', 'Sciences Physiques', 'Sciences Naturelles', 'Philosophie', 'Arabe', 'Français', 'Anglais', 'Informatique', 'Option'],
  sciences: ['Sciences Naturelles', 'Sciences Physiques', 'Mathématiques', 'Chimie', 'Philosophie', 'Arabe', 'Français', 'Anglais', 'Informatique', 'Option'],
  eco:      ['Économie', 'Gestion', 'Mathématiques', 'Histoire-Géo', 'Droit', 'Arabe', 'Français', 'Anglais', 'Informatique', 'Option'],
  tech:     ['Technologie', 'Mathématiques', 'Sciences Physiques', 'Dessin Technique', 'Arabe', 'Français', 'Anglais', 'Informatique', 'Option'],
  lettres:  ['Arabe', 'Français', 'Philosophie', 'Histoire-Géo', 'Anglais', 'Mathématiques', 'Informatique', 'Sciences Naturelles', 'Pensée Islamique', 'Option'],
  info:     ['Informatique', 'Mathématiques', 'Algorithmes', 'Base de Données', 'Arabe', 'Français', 'Anglais', 'Sciences Physiques', 'Philosophie', 'Option'],
  sport:    ['Spécialité Sport', 'Sciences Naturelles', 'Sciences Physiques', 'Arabe', 'Français', 'Anglais', 'Mathématiques', 'Philosophie', 'Informatique', 'Option'],
};

const EXAM_TYPES = ['Principale', 'Contrôle']; // removed 'Pratique' to fix the bad URL datasets issue

module.exports = { SECTIONS, SUBJECTS, EXAM_TYPES };
