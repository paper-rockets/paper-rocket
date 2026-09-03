// src/presets/playBrushPresets.ts
import { PlayBrushPresetId, BrushSettings } from '../types';

export interface PlayBrushDefinition {
  id: PlayBrushPresetId;
  name: string;
  tagline: string;
  profile: 'tube' | 'ribbon' | 'conformal';
  size: number;
  opacity: number;
  materialType: 'shaded' | 'glow' | 'shadeless';
  roughness: number;
  metalness: number;
  emissiveIntensity: number;
  archSegments: number;
  domeFactor: number;
}

export const PLAY_BRUSH_PRESETS: PlayBrushDefinition[] = [
  {
    id: 'tube',
    name: 'Volumetric Tube',
    tagline: '3D Cylindrical Air Pipe',
    profile: 'tube',
    size: 0.04,
    opacity: 1.0,
    materialType: 'shaded',
    roughness: 0.35,
    metalness: 0.25,
    emissiveIntensity: 0.0,
    archSegments: 5,
    domeFactor: 0.0,
  },
  {
    id: 'ribbon',
    name: 'Calligraphic Ribbon',
    tagline: 'Silky Flat Spatial Ribbon',
    profile: 'ribbon',
    size: 0.035,
    opacity: 1.0,
    materialType: 'shaded',
    roughness: 0.2,
    metalness: 0.1,
    emissiveIntensity: 0.0,
    archSegments: 3,
    domeFactor: 0.0,
  },
  {
    id: 'stardust',
    name: 'Star Dust Bead',
    tagline: 'Surface-Hugging Luminous Bead',
    profile: 'conformal',
    size: 0.03,
    opacity: 1.0,
    materialType: 'glow',
    roughness: 0.1,
    metalness: 0.0,
    emissiveIntensity: 1.8,
    archSegments: 5,
    domeFactor: 0.3,
  },
];

export function applyPlayBrushPreset(
  brushId: PlayBrushPresetId,
  current: BrushSettings
): BrushSettings {
  const preset = PLAY_BRUSH_PRESETS.find((b) => b.id === brushId) || PLAY_BRUSH_PRESETS[0];
  return {
    ...current,
    profile: preset.profile,
    size: preset.size,
    opacity: preset.opacity,
    materialType: preset.materialType,
    roughness: preset.roughness,
    metalness: preset.metalness,
    emissiveIntensity: preset.emissiveIntensity,
    archSegments: preset.archSegments,
    domeFactor: preset.domeFactor,
  };
}
