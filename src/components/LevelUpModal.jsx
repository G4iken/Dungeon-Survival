import { Activity, Heart, Swords, Wind, Zap } from 'lucide-react';

const upgrades = [
  { id: 'damage', title: 'Sharper Blade', desc: '+6 damage', icon: Swords },
  { id: 'health', title: 'Iron Heart', desc: '+24 max health and heal', icon: Heart },
  { id: 'speed', title: 'Swift Step', desc: '+16 movement speed', icon: Wind },
  { id: 'stamina', title: 'Deep Breath', desc: '+22 max stamina and refill', icon: Zap },
  { id: 'crit', title: 'Lucky Strike', desc: '+6% critical chance', icon: Activity },
];

export default function LevelUpModal({ level, onChoose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal level-modal ornate-modal">
        <div className="level-glow">LEVEL {level}</div>
        <h2>Choose a Rune Upgrade</h2>
        <p>The dungeon pauses for a second. Pick one permanent upgrade for this run.</p>
        <div className="upgrade-grid">
          {upgrades.map((upgrade) => {
            const Icon = upgrade.icon;
            return (
              <button key={upgrade.id} className="upgrade-card" onClick={() => onChoose(upgrade.id)}>
                <Icon size={24} />
                <strong>{upgrade.title}</strong>
                <span>{upgrade.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
