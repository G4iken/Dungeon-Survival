import { Clock, Coins, DoorOpen, RotateCcw, Skull, Trophy } from 'lucide-react';
import { formatTime } from '../utils/helpers.js';

export default function GameOver({ snapshot, victory = false, onRestart, onMenu }) {
  return (
    <div className="modal-backdrop">
      <div className={`modal compact result-modal ornate-modal ${victory ? 'victory-modal' : 'death-modal'}`}>
        <div className="result-emblem">{victory ? <Trophy size={42} /> : <Skull size={42} />}</div>
        <h2>{victory ? 'You Escaped the Dungeon' : 'You Died'}</h2>
        <p>{victory ? 'The final portal opens. The dungeon loses its grip on you.' : 'The dungeon consumed your run, but your next descent can go deeper.'}</p>
        <div className="result-grid">
          <div><strong>{snapshot?.score || 0}</strong><span>Score</span></div>
          <div><strong>{snapshot?.enemiesKilled || 0}</strong><span>Enemies Defeated</span></div>
          <div><strong>{snapshot?.roomsCleared || 0}</strong><span>Rooms Cleared</span></div>
          <div><strong><Clock size={16} /> {formatTime(snapshot?.timeSurvived || 0)}</strong><span>Time Survived</span></div>
          <div><strong><Coins size={16} /> {snapshot?.player?.gold || 0}</strong><span>Gold</span></div>
          <div><strong><DoorOpen size={16} /> {snapshot?.floor || 1}/{snapshot?.totalFloors || 5}</strong><span>Floor Reached</span></div>
        </div>
        <div className="modal-actions">
          <button className="primary" onClick={onRestart}><RotateCcw size={16} /> Restart</button>
          <button onClick={onMenu}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}
