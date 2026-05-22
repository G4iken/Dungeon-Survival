import { Backpack, Clock, Flame, Gem, Map, Pause, Shield, Skull, Sparkles, Zap } from 'lucide-react';
import { formatTime } from '../utils/helpers.js';

function Bar({ label, value, max, className, icon }) {
  const safeMax = Math.max(1, max || 1);
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  return (
    <div className="hud-bar-wrap">
      <div className="hud-bar-label">
        <span>{icon}{label}</span>
        <span>{Math.ceil(value)} / {Math.ceil(safeMax)}</span>
      </div>
      <div className="hud-bar"><div className={className} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function MiniMap({ rooms = [], currentRoomId }) {
  if (!rooms.length) return null;
  const minX = Math.min(...rooms.map((r) => r.x));
  const minY = Math.min(...rooms.map((r) => r.y));
  const maxX = Math.max(...rooms.map((r) => r.x + r.w));
  const maxY = Math.max(...rooms.map((r) => r.y + r.h));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return (
    <div className="minimap" aria-label="Dungeon minimap">
      {rooms.map((room) => {
        const style = {
          left: `${((room.x - minX) / width) * 100}%`,
          top: `${((room.y - minY) / height) * 100}%`,
          width: `${Math.max(7, (room.w / width) * 100)}%`,
          height: `${Math.max(7, (room.h / height) * 100)}%`,
        };
        const classes = [
          'minimap-room',
          room.visited ? 'visited' : 'hidden-room',
          room.cleared ? 'cleared' : '',
          room.id === currentRoomId ? 'current' : '',
          room.type?.toLowerCase(),
        ].join(' ');
        return <span key={room.id} className={classes} style={style} title={room.type} />;
      })}
    </div>
  );
}

export default function HUD({ snapshot, onPause, onInventory }) {
  if (!snapshot?.player) return null;
  const { player } = snapshot;
  const floorText = `${snapshot.floor}/${snapshot.totalFloors || '?'}`;

  return (
    <div className="hud hud-roguelike">
      <section className="hud-panel hud-left">
        <div className="hud-title-row">
          <span className="class-badge"><Shield size={14} /> Rune Knight</span>
          <span className="level-badge">LVL {player.level}</span>
        </div>
        <Bar icon={<Flame size={13} />} label="Health" value={player.health} max={player.maxHealth} className="fill health" />
        <Bar icon={<Zap size={13} />} label="Stamina" value={player.stamina} max={player.maxStamina} className="fill stamina" />
        <Bar icon={<Sparkles size={13} />} label="XP" value={player.xp} max={player.nextLevelXp} className="fill xp" />
      </section>

      <section className="hud-panel hud-center">
        <div className="floor-medallion">
          <span>Floor</span>
          <strong>{floorText}</strong>
        </div>
        <div className="objective-stack">
          <strong>{snapshot.objective}</strong>
          <span>{snapshot.roomType || 'Unknown'} Room • {snapshot.enemiesRemaining} enemies nearby</span>
        </div>
        <div className="ai-chip"><Sparkles size={14} /> {snapshot.directorEvent || 'watching'} • x{snapshot.difficultyMultiplier || 1}</div>
      </section>

      <section className="hud-panel hud-right">
        <div className="stat-row"><Gem size={15} /> Gold <strong>{player.gold}</strong></div>
        <div className="stat-row"><Skull size={15} /> Kills <strong>{snapshot.enemiesKilled}</strong></div>
        <div className="stat-row"><Clock size={15} /> Time <strong>{formatTime(snapshot.timeSurvived || 0)}</strong></div>
        <div className="hud-buttons">
          <button onClick={onInventory}><Backpack size={15} /> Inventory</button>
          <button onClick={onPause}><Pause size={15} /> Pause</button>
        </div>
      </section>

      <section className="hud-panel hud-map-panel">
        <div className="map-title"><Map size={15} /> Dungeon Map</div>
        <MiniMap rooms={snapshot.rooms} currentRoomId={snapshot.currentRoomId} />
      </section>
    </div>
  );
}
