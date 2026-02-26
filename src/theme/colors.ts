export const Colors = {
  primary: '#4A90E2',
  primaryDark: '#357ABD',
  primaryLight: '#E8F4FF',

  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceAlt: '#F9F9F9',

  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',

  border: '#E0E0E0',
  borderLight: '#D0D0D0',

  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',

  avatarColors: [
    '#4A90E2',
    '#50C878',
    '#FF6B6B',
    '#FFD93D',
    '#6C5CE7',
    '#FF8A5C',
    '#00CEC9',
    '#FD79A8',
  ],
} as const;

export const getAvatarColor = (name: string): string => {
  const index =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    Colors.avatarColors.length;
  return Colors.avatarColors[index];
};
