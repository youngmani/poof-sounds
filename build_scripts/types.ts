// java edition assets/minecraft/sounds.json
export interface JavaSoundFile_t {
  name: string;
  volume?: number;
  pitch?: number;
  weight?: number;
  stream?: boolean;
  attenuation_distance?: number;
  preload?: boolean;
  type?: 'file' | 'event';
}

export interface JavaSoundEvent_t {
  replace?: boolean;
  sounds: (string | JavaSoundFile_t)[];
  subtitle?: string;
}

export type JavaSounds_t = Record<string, JavaSoundEvent_t>;

// java edition pack.mcmeta
export type PackFormat_t = number | [number] | [number, number];

export interface OverlayEntry_t {
  directory: string;
  min_format: PackFormat_t;
  max_format: PackFormat_t;
  formats?: [number, number];
}

export interface PackMcmeta_t {
  pack: {
    description: string;
    min_format: PackFormat_t;
    max_format: PackFormat_t;
    pack_format?: number;
    supported_formats?: [number, number];
  };
  overlays?: { entries?: OverlayEntry_t[] };
}

// bedrock edition sounds/sound_definitions.json
export interface BedrockSoundFile_t {
  name: string;
  volume?: number;
  pitch?: number;
  weight?: number;
}

export interface BedrockSoundDefinition_t {
  category?: string;
  subtitle?: string;
  sounds: (string | BedrockSoundFile_t)[];
}
