import { useState, useCallback } from 'react';

import {
  Field,
  CellState,
  generateFieldWithDefaultState,
  fieldGenerator,
  Coords,
} from '@/core/Field';
import { openCell } from '@/core/openCell';
import { setFlag } from '@/core/setFlag';

import { LevelNames } from '@/modules/GameSettings';

import { useTime } from './useTime';
import { useGameSettings } from './useGameSettings';
import { useGameStatus } from './useGameStatus';

interface ReturnType {
  level: LevelNames;
  time: number;
  isGameOver: boolean;
  isGameStarted: boolean;
  isWin: boolean;
  settings: [number, number];
  playerField: Field;
  gameField: Field;
  flagCounter: number;
  onClick: (coords: Coords) => void;
  onContextMenu: (coords: Coords, flagCounter: number, bombs: number) => void;
  onChangeLevel: (level: LevelNames) => void;
  onReset: () => void;
}

export const useGame = (): ReturnType => {
  const {
    settings: [size, bombs],
    level,
    setLevel,
  } = useGameSettings();

  const [playerField, setPlayerField] = useState<Field>(
    generateFieldWithDefaultState(size, CellState.hidden)
  );

  const [gameField, setGameField] = useState<Field>(
    fieldGenerator(size, bombs / (size * size))
  );

  const [flagCounter, setFlagCounter] = useState(0);

  const {
    isGameStarted,
    isWin,
    isGameOver,
    setNewGame,
    setInProgress,
    setGameWin,
    setGameLoose,
  } = useGameStatus();
  const [time, resetTime] = useTime(isGameStarted, isGameOver);

  const onClick = useCallback(
    (coords: Coords) => {
      !isGameStarted && setInProgress();
      try {
        const [newPlayerField, isSolved] = openCell(
          coords,
          playerField,
          gameField
        );
        if (isSolved) {
          setGameWin();
        }
        setPlayerField([...newPlayerField]);
      } catch (e) {
        setPlayerField([...gameField]);
        setGameLoose();
      }
    },
    [isGameStarted, isGameOver, isWin, level]
  );

  const onContextMenu = useCallback(
    (coords: Coords, flagCounter: number, bombs: number) => {
      !isGameStarted && setInProgress();
      const [newPlayerField, isSolved, newFlagCounter] = setFlag(
        coords,
        playerField,
        gameField,
        flagCounter,
        bombs
      );
      setFlagCounter(newFlagCounter);
      if (isSolved) {
        setGameWin();
      }
      setPlayerField([...newPlayerField]);
    },
    [isGameStarted, isGameOver, isWin, level]
  );

  const resetHandler = useCallback(([size, bombs]: [number, number]) => {
    const newGameField = fieldGenerator(size, bombs / (size * size));
    const newPlayerField = generateFieldWithDefaultState(
      size,
      CellState.hidden
    );

    setGameField([...newGameField]);
    setPlayerField([...newPlayerField]);
    setFlagCounter(0);
    setNewGame();
    resetTime();
  }, []);

  const onChangeLevel = useCallback((level: LevelNames) => {
    const newSettings = setLevel(level);
    resetHandler(newSettings);
  }, []);

  const onReset = useCallback(() => resetHandler([size, bombs]), [size, bombs]);

  return {
    level,
    time,
    isGameOver,
    isGameStarted,
    isWin,
    settings: [size, bombs],
    playerField,
    gameField,
    flagCounter,
    onClick,
    onContextMenu,
    onChangeLevel,
    onReset,
  };
};
