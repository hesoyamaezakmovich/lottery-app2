import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserCrystals, updateUserCrystals } from "../../shared-bonus";
import kaboom from "kaboom";
import { createMenuScene } from "./scenes/menu";
import { createGameScene } from "./scenes/game";
import { createResultsScene } from "./scenes/results";

// Импортируйте kaboom и все необходимые функции/сцены
// import kaboom, { ... } from "kaboom";
// import { createMenuScene } from "./scenes/menu";
// ...

export default function TreasureGame() {
  const { user } = useAuth();
  const [crystals, setCrystals] = useState(0);
  const kaboomRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      getUserCrystals(user.id).then(setCrystals);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (!kaboomRef.current) {
      const k = kaboom({
        root: document.getElementById("kaboom-canvas"),
        width: 1280,
        height: 720,
        background: [0, 0, 0],
        debug: true,
        errorHandler: (err) => {
          console.error("Kaboom error:", err);
        },
      });

      // Глобальная функция для начисления бонусов из игрового кода
      window.updateUserCrystalsFromReact = async (amount) => {
        if (user?.id && isMounted) {
          await updateUserCrystals(user.id, amount);
          const updated = await getUserCrystals(user.id);
          setCrystals(updated);
        }
      };

      // Загрузка ассетов и инициализация сцен (асинхронно)
      (async () => {
        await k.loadSpriteAtlas('assets/tileset.png', {
          'platform-left': { x: 82, y: 64, width: 16, height: 8 },
          'platform-middle': { x: 112, y: 64, width: 16, height: 8 },
          'platform-right': { x: 142, y: 64, width: 16, height: 8 },
          'smaller-tree': { x: 0, y: 80, width: 60, height: 65 },
          'bigger-tree': { x: 170, y: 10, width: 115, height: 200 },
          'ground': { x: 80, y: 144, width: 16, height: 16 },
          'ground-deep': { x: 0, y: 144, width: 16, height: 16 }
        });
        await Promise.all([
          k.loadSprite('background-0', 'assets/background_0.png'),
          k.loadSprite('background-1', 'assets/background_1.png'),
          k.loadSprite('background-2', 'assets/background_2.png'),
          k.loadSprite('idle-sprite', 'assets/Idle.png', {
            sliceX: 8,
            sliceY: 1,
            anims: { 'idle-anim': { from: 0, to: 7, loop: true }}
          }),
          k.loadSprite('run-sprite', 'assets/Run.png', {
            sliceX: 8,
            sliceY: 1,
            anims: { 'run-anim': { from: 0, to: 7, loop: true }}
          }),
          k.loadSprite('jump-sprite', 'assets/Jump.png', {
            sliceX: 2,
            sliceY: 1,
            anims: { 'jump-anim': { from: 0, to: 1, loop: true }}
          }),
          k.loadSprite('fall-sprite', 'assets/Fall.png', {
            sliceX: 2,
            sliceY: 1,
            anims: { 'fall-anim': { from: 0, to: 1, loop: true }}
          }),
          k.loadSprite('take-hit-sprite', 'assets/Take Hit.png', {
            sliceX: 4,
            sliceY: 1,
            anims: { 'take-hit': { from: 0, to: 3, loop: false }}
          }),
          k.loadSprite('death-sprite', 'assets/Death.png', {
            sliceX: 6,
            sliceY: 1,
            anims: { 'death': { from: 0, to: 5, loop: false }}
          }),
          k.loadSprite('heart', 'assets/heart.png', { width: 32, height: 32 }),
          k.loadSprite('attack1-sprite', 'assets/Attack1.png', {
            sliceX: 4,
            sliceY: 1,
            anims: { 'attack1-anim': { from: 0, to: 3, loop: false }}
          }),
          k.loadSprite('attack2-sprite', 'assets/Attack2.png', {
            sliceX: 4,
            sliceY: 1,
            anims: { 'attack2-anim': { from: 0, to: 3, loop: false }}
          }),
          k.loadSprite('rpg-chest', 'assets/RPG Chests.png')
        ]);
        k.setGravity(1000);
        createMenuScene();
        createGameScene();
        createResultsScene();
        k.go("menu");
      })();

      kaboomRef.current = true;
    }
    return () => {
      isMounted = false;
      window.updateUserCrystalsFromReact = undefined;
    };
  }, [user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 8 }}>Сокровищница (33GAMEDEV)</h1>
      <p style={{ textAlign: 'center', marginBottom: 16 }}>Ваши кристаллы: {crystals}</p>
      <div id="kaboom-canvas" style={{ width: 1280, height: 720, display: 'block', margin: '0 auto' }} />
    </div>
  );
} 