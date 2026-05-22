export default function HowToPlay({ onBack }) {
  return (
    <main className="screen simple-screen">
      <section className="panel large-panel">
        <h1>How to Play</h1>
        <p>Clear rooms, collect loot, level up, and reach the glowing exit portal.</p>
        <div className="controls-grid">
          <div><strong>WASD</strong><span>Move</span></div>
          <div><strong>Space / Mouse</strong><span>Attack</span></div>
          <div><strong>Shift</strong><span>Dash</span></div>
          <div><strong>E</strong><span>Pick up loot</span></div>
          <div><strong>I</strong><span>Inventory</span></div>
          <div><strong>ESC</strong><span>Pause</span></div>
        </div>
        <h3>AI Systems</h3>
        <p>The AI Director watches your health, speed, kills, and room progress to decide whether to send ambushes, healing, treasure, traps, or mini-boss pressure.</p>
        <button className="primary" onClick={onBack}>Back</button>
      </section>
    </main>
  );
}
