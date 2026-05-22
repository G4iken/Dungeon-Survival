export default function PauseMenu({ onResume, onSave, onRestart, onMenu }) {
  return (
    <div className="modal-backdrop">
      <div className="modal compact">
        <h2>Paused</h2>
        <p>Your run is paused. You can save your current progress or restart the dungeon.</p>
        <div className="modal-actions">
          <button className="primary" onClick={onResume}>Resume</button>
          <button onClick={onSave}>Save Game</button>
          <button onClick={onRestart}>Restart</button>
          <button onClick={onMenu}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}
