export default function Credits({ onBack }) {
  return (
    <main className="screen simple-screen">
      <section className="panel large-panel">
        <h1>Credits</h1>
        <p>Built with React, Vite, JavaScript, and HTML Canvas.</p>
        <p>All visuals are generated using simple shapes and CSS so the project has no required paid assets.</p>
        <button className="primary" onClick={onBack}>Back</button>
      </section>
    </main>
  );
}
