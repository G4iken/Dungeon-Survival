import { useEffect, useRef, useState } from 'react';
import GameCanvas from './game/GameCanvas.jsx';
import HUD from './components/HUD.jsx';
import MainMenu from './components/MainMenu.jsx';
import PauseMenu from './components/PauseMenu.jsx';
import Inventory from './components/Inventory.jsx';
import LevelUpModal from './components/LevelUpModal.jsx';
import GameOver from './components/GameOver.jsx';
import Settings from './components/Settings.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import Credits from './components/Credits.jsx';
import { getBestScore, hasSaveGame, saveSettings, loadSettings } from './systems/saveSystem.js';

const defaultSettings = {
  sound: true,
  music: false,
  difficulty: 'Normal',
  graphics: 'High',
};

export default function App() {
  const gameRef = useRef(null);
  const [view, setView] = useState('menu');
  const [overlay, setOverlay] = useState(null);
  const [runId, setRunId] = useState(0);
  const [loadSaved, setLoadSaved] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [inventoryMessage, setInventoryMessage] = useState('');
  const [settings, setSettings] = useState(() => loadSettings() || defaultSettings);
  const [hasSave, setHasSave] = useState(hasSaveGame());
  const [bestScore, setBestScore] = useState(getBestScore());

  useEffect(() => {
    const listener = (event) => setSnapshot(event.detail);
    window.addEventListener('game-snapshot', listener);
    return () => window.removeEventListener('game-snapshot', listener);
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    document.body.classList.toggle('game-active', view === 'game');
    return () => document.body.classList.remove('game-active');
  }, [view]);

  const startGame = (continueSave = false) => {
    setLoadSaved(continueSave);
    setRunId((id) => id + 1);
    setSnapshot(null);
    setOverlay(null);
    setView('game');
  };

  const goMenu = () => {
    gameRef.current?.save?.();
    setHasSave(hasSaveGame());
    setBestScore(getBestScore());
    setOverlay(null);
    setView('menu');
  };

  const restart = () => startGame(false);

  const useItem = (index) => {
    const result = gameRef.current?.useItem(index);
    setInventoryMessage(result?.message || '');
  };

  if (view === 'menu') {
    return <MainMenu onStart={() => startGame(false)} onContinue={() => startGame(true)} onHow={() => setView('how')} onSettings={() => setView('settings')} onCredits={() => setView('credits')} hasSave={hasSave} bestScore={bestScore} />;
  }

  if (view === 'settings') {
    return <Settings settings={settings} onChange={setSettings} onBack={() => setView('menu')} />;
  }

  if (view === 'how') {
    return <HowToPlay onBack={() => setView('menu')} />;
  }

  if (view === 'credits') {
    return <Credits onBack={() => setView('menu')} />;
  }

  return (
    <main className="game-shell">
      <HUD snapshot={snapshot} onPause={() => setOverlay('pause')} onInventory={() => { setInventoryMessage(''); setOverlay('inventory'); }} />
      <GameCanvas
        key={runId}
        ref={gameRef}
        loadSaved={loadSaved}
        settings={settings}
        paused={Boolean(overlay)}
        onPause={() => setOverlay((value) => (value ? null : 'pause'))}
        onInventory={() => { setInventoryMessage(''); setOverlay((value) => (value === 'inventory' ? null : 'inventory')); }}
        onLevelUp={() => setOverlay('levelup')}
        onGameOver={() => { setOverlay('gameover'); setBestScore(getBestScore()); setHasSave(hasSaveGame()); }}
        onVictory={() => { setOverlay('victory'); setBestScore(getBestScore()); setHasSave(hasSaveGame()); }}
      />
      <div className="objective-pill">
        <span className="objective-label">AI Narrator</span>
        <span>{snapshot?.narrator || snapshot?.objective || 'Clear rooms, collect loot, and enter the exit portal.'}</span>
      </div>

      {overlay === 'pause' && (
        <PauseMenu
          onResume={() => setOverlay(null)}
          onSave={() => { gameRef.current?.save?.(); setHasSave(hasSaveGame()); }}
          onRestart={restart}
          onMenu={goMenu}
        />
      )}

      {overlay === 'inventory' && (
        <Inventory player={snapshot?.player} message={inventoryMessage} onUse={useItem} onClose={() => setOverlay(null)} />
      )}

      {overlay === 'levelup' && (
        <LevelUpModal level={snapshot?.player?.level || 1} onChoose={(upgrade) => { gameRef.current?.chooseUpgrade(upgrade); setOverlay(null); }} />
      )}

      {overlay === 'gameover' && <GameOver snapshot={snapshot} onRestart={restart} onMenu={goMenu} />}
      {overlay === 'victory' && <GameOver snapshot={snapshot} victory onRestart={restart} onMenu={goMenu} />}
    </main>
  );
}
