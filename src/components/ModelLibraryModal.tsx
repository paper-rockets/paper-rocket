import React, { useState, useMemo, useEffect } from 'react';
import { SampleModelFactory, PresetModelDefinition } from '../core/sampleModels';
import { StudioEngine } from '../core/studioEngine';
import { ModelDisplayMode } from '../types';
import {
  Upload,
  X,
  Check,
  Search,
  Loader2,
  Sliders,
} from 'lucide-react';

interface ModelLibraryModalProps {
  engine: StudioEngine | null;
  onClose: () => void;
  activeModelName: string;
  onOpenConverter?: () => void;
}

/** Visual 3D geometric preview thumbnail for model cards */
const ModelPreviewThumbnail: React.FC<{ category: string; name: string }> = ({ category, name }) => {
  const isHouse = category.includes('House') || name.toLowerCase().includes('house') || name.toLowerCase().includes('castle') || name.toLowerCase().includes('temple');
  const isVehicle = category.includes('Vehicle') || name.toLowerCase().includes('drone') || name.toLowerCase().includes('bike') || name.toLowerCase().includes('arcade');
  const isCharacter = category.includes('Anime') || category.includes('Character') || name.toLowerCase().includes('goku') || name.toLowerCase().includes('sailor');
  const isAnimal = category.includes('Animal') || name.toLowerCase().includes('cat') || name.toLowerCase().includes('pusheen') || name.toLowerCase().includes('capybara');

  return (
    <div className="w-full h-24 sm:h-28 rounded-xl bg-gradient-to-b from-[#1c1d24] to-[#121317] border border-white/[0.06] flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all">
      {/* Background radial ambient glow */}
      <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent opacity-60" />

      {/* Dynamic 3D Isometric Wireframe Geometry */}
      <svg className="w-16 h-16 sm:w-20 sm:h-20 text-zinc-400 group-hover:text-white group-hover:scale-105 transition-all" viewBox="0 0 64 64" fill="none">
        {isHouse ? (
          /* Isometric 3D House / Building */
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M32 8 L54 22 L32 34 L10 22 Z" fill="currentColor" fillOpacity="0.1" />
            <path d="M10 22 L10 44 L32 56 L32 34 Z" fill="currentColor" fillOpacity="0.05" />
            <path d="M54 22 L54 44 L32 56 L32 34 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M22 41 L22 51 L28 48 L28 38 Z" fill="currentColor" fillOpacity="0.3" />
            <line x1="32" y1="8" x2="32" y2="34" strokeDasharray="2 2" opacity="0.4" />
          </g>
        ) : isVehicle ? (
          /* Isometric 3D Vehicle / Mech Form */
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="32" cy="32" rx="20" ry="10" fill="currentColor" fillOpacity="0.1" />
            <path d="M16 28 L32 16 L48 28 L32 40 Z" fill="currentColor" fillOpacity="0.15" />
            <circle cx="32" cy="28" r="5" fill="currentColor" fillOpacity="0.3" />
            <path d="M12 34 L20 44 L44 44 L52 34" strokeDasharray="3 3" opacity="0.6" />
          </g>
        ) : isAnimal || isCharacter ? (
          /* Organic 3D Form / Character Capsule */
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="32" cy="34" rx="14" ry="16" fill="currentColor" fillOpacity="0.1" />
            <ellipse cx="32" cy="22" rx="11" ry="11" fill="currentColor" fillOpacity="0.15" />
            <circle cx="28" cy="20" r="1.5" fill="currentColor" />
            <circle cx="36" cy="20" r="1.5" fill="currentColor" />
            <path d="M24 13 L28 17 M40 13 L36 17" />
            <path d="M20 34 C16 38 18 44 24 46 M44 34 C48 38 46 44 40 46" opacity="0.7" />
          </g>
        ) : (
          /* 3D Geometric Primitive / Grid */
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="32,10 52,22 52,44 32,56 12,44 12,22" fill="currentColor" fillOpacity="0.08" />
            <line x1="32" y1="10" x2="32" y2="34" />
            <line x1="12" y1="22" x2="32" y2="34" />
            <line x1="52" y1="22" x2="32" y2="34" />
            <line x1="32" y1="34" x2="32" y2="56" />
          </g>
        )}
      </svg>

      {/* Format Pill Badge */}
      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 border border-white/10 text-[9px] font-mono text-zinc-400">
        3D
      </span>
    </div>
  );
};

export const ModelLibraryModal: React.FC<ModelLibraryModalProps> = ({
  engine,
  onClose,
  activeModelName,
  onOpenConverter,
}) => {
  const presets = useMemo(() => SampleModelFactory.getPresets(), []);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loadDisplayMode, setLoadDisplayMode] = useState<ModelDisplayMode>('texture');
  const [urlInput, setUrlInput] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const categories = [
    { id: 'All', label: 'All' },
    { id: 'Anime & Manga', label: 'Anime' },
    { id: 'Characters & Figures', label: 'Characters' },
    { id: 'Houses & Architecture', label: 'Houses' },
    { id: 'Vehicles & Tech', label: 'Vehicles' },
    { id: 'Animals & Creatures', label: 'Animals' },
    { id: 'Shapes & Benchmarks', label: 'Shapes' },
  ];

  const filteredPresets = useMemo(() => {
    return presets.filter((p) => {
      const matchesCat =
        selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [presets, selectedCategory, searchQuery]);

  const handleSelectPreset = async (preset: PresetModelDefinition) => {
    if (!engine) return;
    setLoading(true);
    setError(null);
    try {
      await engine.loadPresetModel(preset.id, loadDisplayMode);
      onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to load ${preset.name}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlLoad = async () => {
    if (!engine || !urlInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = urlInput.trim();
      const modelName = url.split('/').pop()?.split('?')[0] || 'Remote Model';
      await engine.loadGLTF(url, modelName);
      engine.setModelDisplayMode(loadDisplayMode);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to download or parse remote 3D model.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!engine) return;
    setLoading(true);
    setError(null);

    try {
      await engine.loadUniversalFiles([file], file.name);
      engine.setModelDisplayMode(loadDisplayMode);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to parse 3D model file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="model-library-modal"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#14151a] border border-[#2b2c32] shadow-2xl overflow-hidden font-sans select-none"
      >
        {/* Clean Header with Big Prominent Exit Button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800/80 bg-[#101114]">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-white font-bold text-lg">3D Models</h2>
            <span className="text-xs font-mono text-zinc-500">({presets.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenConverter && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConverter();
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700 text-xs font-medium border border-zinc-700/60 transition-colors"
              >
                Import / Convert
              </button>
            )}

            {/* Prominent High-Contrast Exit Button */}
            <button
              id="close-model-library-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              title="Close and Return to Canvas (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Surface Mode, Search, Clean Category Pills */}
        <div className="px-4 sm:px-6 py-3 flex flex-col gap-2.5 border-b border-zinc-800/80 bg-[#121318]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models (Pusheen, Pokemon, Akira, Castle, Houses...)"
                className="w-full bg-[#18191f] border border-zinc-700/70 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 font-sans"
              />
            </div>

            {/* Surface Mode Pill */}
            <div className="flex items-center bg-[#18191f] p-0.5 rounded-xl border border-zinc-700/70 shrink-0">
              <button
                type="button"
                onClick={() => setLoadDisplayMode('texture')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  loadDisplayMode === 'texture'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Textured
              </button>
              <button
                type="button"
                onClick={() => setLoadDisplayMode('clay')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  loadDisplayMode === 'clay'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                White Canvas
              </button>
            </div>
          </div>

          {/* Clean Plain-Text Category Pills (No Ugly Icons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-white text-zinc-950 font-bold'
                      : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Models Visual Grid */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="h-60 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-7 h-7 animate-spin text-white" />
              <p className="text-xs font-mono text-zinc-300">Loading 3D mesh & textures...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredPresets.map((preset) => {
                const isCurrent =
                  activeModelName.toLowerCase() === preset.name.toLowerCase() ||
                  activeModelName.toLowerCase().includes(preset.id.replace(/_/g, ' '));
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`group relative p-2 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-white/10 border-white shadow-lg'
                        : 'bg-[#18191f]/90 border-zinc-800/80 hover:bg-[#20222a] hover:border-zinc-600'
                    }`}
                  >
                    {/* Visual 3D Preview Box */}
                    <ModelPreviewThumbnail category={preset.category} name={preset.name} />

                    {/* Model Details */}
                    <div className="mt-2 px-0.5 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-zinc-400 truncate">
                          {preset.category.replace(' & Architecture', '').replace(' & Figures', '').replace(' & Manga', '')}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-emerald-400 text-zinc-950 font-bold">
                            <Check className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                        {preset.name}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {filteredPresets.length === 0 && !loading && (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No models match &ldquo;{searchQuery}&rdquo;. Try another search.
            </div>
          )}

          {/* Upload & Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
              isDragging
                ? 'border-white bg-white/10 text-white'
                : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Upload className="w-5 h-5 text-zinc-400" />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-zinc-300">Drop custom 3D model (.glb, .gltf, .obj)</span>
              <label className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white cursor-pointer transition-colors">
                Browse
                <input
                  type="file"
                  accept=".glb,.gltf,.obj"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Remote URL Ingestion */}
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste direct 3D model URL (.glb / .gltf)..."
              className="flex-1 bg-[#18191f] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
            />
            <button
              type="button"
              onClick={handleUrlLoad}
              disabled={!urlInput.trim() || loading}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 text-xs font-bold transition-colors"
            >
              Load URL
            </button>
          </div>
        </div>

        {/* Modal Bottom Bar with Close Button */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-zinc-800/80 bg-[#101114] flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Click any model to load instantly</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors font-sans"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

