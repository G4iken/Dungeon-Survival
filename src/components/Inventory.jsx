import { Backpack, Gem, Shield, Swords, X } from 'lucide-react';
import { getRarityColor } from '../systems/lootSystem.js';

export default function Inventory({ player, message, onUse, onClose }) {
  const items = player?.inventory || [];
  return (
    <div className="modal-backdrop">
      <div className="modal inventory-modal ornate-modal">
        <div className="modal-header">
          <div>
            <div className="eyebrow small"><Backpack size={16} /> Adventurer Pack</div>
            <h2>Inventory</h2>
            <p className="inventory-stats"><Gem size={15} /> Gold: {player?.gold || 0} <Swords size={15} /> Damage: {player?.damage || 0} <Shield size={15} /> Defense: {player?.defense || 0}</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /> Close</button>
        </div>
        {message && <div className="notice">{message}</div>}
        <div className="inventory-grid">
          {items.length === 0 && <p className="muted empty-inventory">No items yet. Clear treasure rooms and press E near glowing loot.</p>}
          {items.map((item, index) => (
            <div className={`item-card rarity-card rarity-${item.rarity?.toLowerCase()}`} key={item.id || index} style={{ '--rarity': getRarityColor(item.rarity) }}>
              <div className="item-orb" />
              <strong>{item.name}</strong>
              <span className="rarity-badge">{item.rarity}</span>
              <p>{item.description}</p>
              <button onClick={() => onUse(index)}>Use Item</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
