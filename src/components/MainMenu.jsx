import { BrainCircuit, Gem, Shield, Sparkles, Swords } from 'lucide-react';

export default function MainMenu({ onStart, onContinue, onHow, onSettings, onCredits, hasSave, bestScore }) {
  return (
    <main className="screen hero-screen dungeon-hero">
      <div className="portal-orb" aria-hidden="true" />
      <section className="hero-card title-card">
        <div className="eyebrow"><BrainCircuit size={18} /> AI Director Online</div>
        <h1><span>AI</span> Dungeon Survival</h1>
        <p>
          A dark fantasy roguelike where every floor is generated differently, enemy behavior adapts, and the dungeon director reacts to how well you play.
        </p>
        <div className="menu-actions">
          <button className="primary large-cta" onClick={onStart}><Swords size={18} /> Start New Run</button>
          <button onClick={onContinue} disabled={!hasSave}>Continue Game</button>
          <button onClick={onHow}>How to Play</button>
          <button onClick={onSettings}>Settings</button>
          <button onClick={onCredits}>Credits</button>
        </div>
        <div className="best-score"><Sparkles size={16} /> Best Score: {bestScore}</div>
      </section>

      <aside className="feature-grid rune-board">
        <div><Swords size={22} /><strong>Procedural Floors</strong><span>Each descent creates new rooms, traps, loot, and enemy pressure.</span></div>
        <div><BrainCircuit size={22} /><strong>AI Director</strong><span>Ambushes, treasure, healing, and mini-boss events respond to player performance.</span></div>
        <div><Shield size={22} /><strong>Survival Build</strong><span>Level up, collect rare items, and strengthen your character across five floors.</span></div>
        <div><Gem size={22} /><strong>Portfolio Ready</strong><span>Polished menus, readable HUD, minimap, cooldowns, and save/load support.</span></div>
      </aside>
    </main>
  );
}
