import React from 'react';
import './mode_toggle.css';

interface ModeToggleButtonProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

function ModeToggleButton({ isDarkMode, onToggle }: ModeToggleButtonProps): React.ReactElement {
  return (
    <button onClick={onToggle}>
      {isDarkMode ? 'Light' : 'Dark'}
    </button>
  );
}

export default ModeToggleButton;