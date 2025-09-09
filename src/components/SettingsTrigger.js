import React from 'react';

const SettingsTrigger = ({ onClick }) => {
  // Create SVG icon using React.createElement
  const SettingsIcon = () => React.createElement('svg', {
    width: '20',
    height: '20',
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, React.createElement('path', {
    d: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L19 6.6C18.8 6 18.5 5.4 18.1 4.9L19 3L17 1L15.4 1.9C14.9 1.5 14.3 1.2 13.7 1L13.4 0H10.6L10.3 1C9.7 1.2 9.1 1.5 8.6 1.9L7 1L5 3L5.9 4.9C5.5 5.4 5.2 6 5 6.6L3 7V9L5 9.4C5.2 10 5.5 10.6 5.9 11.1L5 13L7 15L8.6 14.1C9.1 14.5 9.7 14.8 10.3 15L10.6 16H13.4L13.7 15C14.3 14.8 14.9 14.5 15.4 14.1L17 15L19 13L18.1 11.1C18.5 10.6 18.8 10 19 9.4L21 9ZM12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8Z'
  }));

  return React.createElement('button', {
    onClick: onClick,
    className: 'lmstudio-trigger-btn w-full flex items-center justify-center p-2 bg-transparent border border-cyan-500/30 rounded-sm hover:border-cyan-400 hover:bg-gray-800/50 transition-all duration-200 group',
    style: {
      width: '100%',
      padding: '8px',
      background: 'transparent',
      border: '1px solid rgba(0, 255, 255, 0.3)',
      color: '#00ffff',
      cursor: 'pointer',
      fontFamily: "'Courier New', monospace",
      fontSize: '14px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }
  }, 
    React.createElement(SettingsIcon, {
      style: {
        width: '20px',
        height: '20px',
        color: '#00ffff'
      }
    }),
    React.createElement('span', {
      style: {
        marginLeft: '8px',
        color: '#00ffff'
      }
    }, 'SETTINGS')
  );
};

export default SettingsTrigger;