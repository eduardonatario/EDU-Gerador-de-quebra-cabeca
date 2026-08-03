/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type Difficulty = 'facil' | 'medio';

export interface PuzzlePiece {
  id: string;
  correctRow: number;
  correctCol: number;
  currentCell: string | null; // "board_R_C" or null (in pool)
  style: React.CSSProperties;
}

export interface PresetImage {
  id: string;
  name: string;
  url: string;
  category: string;
  author: string;
}

export interface PuzzleSettings {
  difficulty: Difficulty;
  rows: number;
  cols: number;
  showGridLines: boolean;
  showNumbers: boolean;
  guideOpacity: number; // 0 to 1
}
