export interface MatchingWeights {
  visualLabels: number; // default 0.35
  category: number; // default 0.20
  color: number; // default 0.15
  location: number; // default 0.15
  temporal: number; // default 0.10
  textSimilarity: number; // default 0.05
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  visualLabels: 0.35,
  category: 0.20,
  color: 0.15,
  location: 0.15,
  temporal: 0.10,
  textSimilarity: 0.05,
};

export interface MatchingThresholds {
  strong: number; // >= 75
  possible: number; // >= 45
  minimumDisplay: number; // >= 25 (candidates below this aren't surfaced)
}

export const DEFAULT_THRESHOLDS: MatchingThresholds = {
  strong: 75,
  possible: 45,
  minimumDisplay: 25,
};
