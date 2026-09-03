// src/presets/magicFxPresets.ts
import { MagicFxShaderPreset, BrushSettings } from '../types';

export interface MagicFxDefinition {
  id: MagicFxShaderPreset;
  name: string;
  tagline: string;
  color: string;
  materialType: 'glow' | 'animated_fx' | 'shaded' | 'shadeless';
  shaderEffect?: 'plasma' | 'fire' | 'lightning' | 'hologram' | 'aurora' | 'rainbow_flow' | 'voronoi_pulse' | 'glitch' | 'matrix_rain';
  roughness: number;
  metalness: number;
  emissiveIntensity: number;
  opacity: number;
}

export const MAGIC_FX_PRESETS: MagicFxDefinition[] = [
  {
    id: 'neon_glow',
    name: 'Neon Glow',
    tagline: 'Electric Luminous Core',
    color: '#00f5d4',
    materialType: 'glow',
    roughness: 0.05,
    metalness: 0.0,
    emissiveIntensity: 2.6,
    opacity: 1.0,
  },
  {
    id: 'lava',
    name: 'Lava Flow',
    tagline: 'Undulating Magma Ribbon',
    color: '#ff5400',
    materialType: 'animated_fx',
    shaderEffect: 'fire',
    roughness: 0.2,
    metalness: 0.1,
    emissiveIntensity: 2.2,
    opacity: 1.0,
  },
  {
    id: 'slime',
    name: 'Slime Goo',
    tagline: 'Translucent Glossy Acid',
    color: '#39ff14',
    materialType: 'shaded',
    roughness: 0.08,
    metalness: 0.12,
    emissiveIntensity: 0.6,
    opacity: 0.88,
  },
  {
    id: 'cel_shaded',
    name: 'Cel-Shaded Toon',
    tagline: 'Banded Anime Shading',
    color: '#fee440',
    materialType: 'shadeless',
    roughness: 0.85,
    metalness: 0.0,
    emissiveIntensity: 0.0,
    opacity: 1.0,
  },
  {
    id: 'cyber_plasma',
    name: 'Cyber Plasma',
    tagline: 'Pulsing Energy Stream',
    color: '#f72585',
    materialType: 'animated_fx',
    shaderEffect: 'plasma',
    roughness: 0.1,
    metalness: 0.0,
    emissiveIntensity: 2.1,
    opacity: 0.95,
  },
  {
    id: 'hologram',
    name: 'Hologram Scan',
    tagline: 'Iridescent Quantum Fringe',
    color: '#7209b7',
    materialType: 'animated_fx',
    shaderEffect: 'hologram',
    roughness: 0.15,
    metalness: 0.2,
    emissiveIntensity: 1.7,
    opacity: 0.82,
  },
];

export function applyMagicFxToBrushSettings(
  fxId: MagicFxShaderPreset,
  current: BrushSettings
): BrushSettings {
  const fx = MAGIC_FX_PRESETS.find((p) => p.id === fxId) || MAGIC_FX_PRESETS[0];
  return {
    ...current,
    magicFx: fx.id,
    color: fx.color,
    materialType: fx.materialType,
    shaderEffect: (fx.shaderEffect as any) ?? current.shaderEffect,
    roughness: fx.roughness,
    metalness: fx.metalness,
    emissiveIntensity: fx.emissiveIntensity,
    opacity: fx.opacity,
  };
}
