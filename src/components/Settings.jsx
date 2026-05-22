export default function Settings({ settings, onChange, onBack }) {
  return (
    <main className="screen simple-screen">
      <section className="panel large-panel">
        <h1>Settings</h1>
        <label className="setting-row">
          <span>Sound Effects</span>
          <input type="checkbox" checked={settings.sound} onChange={(e) => onChange({ ...settings, sound: e.target.checked })} />
        </label>
        <label className="setting-row">
          <span>Music Toggle</span>
          <input type="checkbox" checked={settings.music} onChange={(e) => onChange({ ...settings, music: e.target.checked })} />
        </label>
        <label className="setting-row">
          <span>Difficulty</span>
          <select value={settings.difficulty} onChange={(e) => onChange({ ...settings, difficulty: e.target.value })}>
            <option>Easy</option>
            <option>Normal</option>
            <option>Hard</option>
          </select>
        </label>
        <label className="setting-row">
          <span>Graphics Quality</span>
          <select value={settings.graphics} onChange={(e) => onChange({ ...settings, graphics: e.target.value })}>
            <option>Simple</option>
            <option>High</option>
          </select>
        </label>
        <button className="primary" onClick={onBack}>Back</button>
      </section>
    </main>
  );
}
