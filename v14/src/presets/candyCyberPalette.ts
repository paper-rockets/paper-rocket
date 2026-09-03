// src/presets/candyCyberPalette.ts

export interface CandyCyberSwatch {
  hex: string;
  name: string;
  category: 'neon' | 'candy' | 'neutral' | 'metallic';
}

export const CANDY_CYBER_PALETTE: CandyCyberSwatch[] = [
  { hex: '#00f5d4', name: 'Neon Cyan', category: 'neon' },
  { hex: '#f72585', name: 'Electric Fuchsia', category: 'neon' },
  { hex: '#7209b7', name: 'Hyper Violet', category: 'neon' },
  { hex: '#39ff14', name: 'Laser Lime', category: 'neon' },
  { hex: '#fee440', name: 'Sunshine Gold', category: 'candy' },
  { hex: '#ff5400', name: 'Cyber Orange', category: 'neon' },
  { hex: '#ff0054', name: 'Pure Crimson', category: 'candy' },
  { hex: '#ff70a6', name: 'Bubblegum', category: 'candy' },
  { hex: '#e0fbfc', name: 'Arctic Ice', category: 'neutral' },
  { hex: '#0f172a', name: 'Deep Onyx', category: 'neutral' },
  { hex: '#f8fafc', name: 'Studio Paper', category: 'neutral' },
  { hex: '#06d6a0', name: 'Bright Mint', category: 'candy' },
  { hex: '#ff6b6b', name: 'Coral Reef', category: 'candy' },
  { hex: '#4361ee', name: 'Royal Blue', category: 'neon' },
  { hex: '#cbd5e1', name: 'Chrome Silver', category: 'metallic' },
  { hex: '#334155', name: 'Dark Slate', category: 'neutral' },
];

export const CANDY_CYBER_HEX_LIST: string[] = CANDY_CYBER_PALETTE.map((s) => s.hex);
