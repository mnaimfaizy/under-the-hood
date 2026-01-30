<script>
  // Component to show mapping between kid-friendly UI and actual JavaScript terminology
</script>

<div class="mapping-container" role="complementary" aria-label="What everything means">
  <h3 class="mapping-title">🔍 What's Really Happening?</h3>
  <p class="mapping-intro">Here's what each fun part represents in real JavaScript!</p>

  <div class="mapping-list">
    <div class="mapping-item">
      <div class="mapping-visual">
        <div class="visual-icon robot">🤖</div>
        <span class="visual-name">Task Robot</span>
      </div>
      <div class="mapping-arrow">→</div>
      <div class="mapping-real">
        <span class="real-name">Call Stack</span>
        <span class="real-desc">Where JavaScript runs code</span>
      </div>
    </div>

    <div class="mapping-item">
      <div class="mapping-visual">
        <div class="visual-icon cloud">☁️</div>
        <span class="visual-name">Magic Cloud</span>
      </div>
      <div class="mapping-arrow">→</div>
      <div class="mapping-real">
        <span class="real-name">Web APIs</span>
        <span class="real-desc">Browser helpers for timers & fetch</span>
      </div>
    </div>

    <div class="mapping-item">
      <div class="mapping-visual">
        <div class="visual-icon speedy">🏎️</div>
        <span class="visual-name">Speedy Lane</span>
      </div>
      <div class="mapping-arrow">→</div>
      <div class="mapping-real">
        <span class="real-name">Microtask Queue</span>
        <span class="real-desc">Fast promises go here</span>
      </div>
    </div>

    <div class="mapping-item">
      <div class="mapping-visual">
        <div class="visual-icon waiting">👥</div>
        <span class="visual-name">Waiting Line</span>
      </div>
      <div class="mapping-arrow">→</div>
      <div class="mapping-real">
        <span class="real-name">Macrotask Queue</span>
        <span class="real-desc">Timers wait in line here</span>
      </div>
    </div>

    <div class="mapping-item">
      <div class="mapping-visual">
        <div class="visual-icon conveyor">🎢</div>
        <span class="visual-name">Magic Conveyor</span>
      </div>
      <div class="mapping-arrow">→</div>
      <div class="mapping-real">
        <span class="real-name">Event Loop</span>
        <span class="real-desc">Picks what runs next</span>
      </div>
    </div>
  </div>

  <div class="mapping-divider"></div>

  <h4 class="mapping-subtitle">📦 Task Types</h4>
  <div class="task-types">
    <div class="task-type">
      <div class="task-badge quick">⚡ Quick Task</div>
      <div class="task-real">
        <span class="real-name">Promise</span>
        <span class="real-desc">Runs in Speedy Lane</span>
      </div>
    </div>

    <div class="task-type">
      <div class="task-badge waiting">⏱️ Wait Task</div>
      <div class="task-real">
        <span class="real-name">setTimeout</span>
        <span class="real-desc">Waits in line</span>
      </div>
    </div>

    <div class="task-type">
      <div class="task-badge fetch">🌐 Fetch Task</div>
      <div class="task-real">
        <span class="real-name">fetch()</span>
        <span class="real-desc">Gets data from Cloud</span>
      </div>
    </div>
  </div>
</div>

<style>
  .mapping-container {
    background: linear-gradient(135deg, rgb(var(--surface)) 0%, rgb(var(--surface-alt)) 100%);
    border: 2px solid rgb(var(--border));
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    max-height: 55vh;
    overflow-y: auto;
  }

  .mapping-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: rgb(var(--fg));
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .mapping-intro {
    font-size: 0.8rem;
    color: rgb(var(--muted));
    margin-bottom: 1rem;
    line-height: 1.4;
  }

  .mapping-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mapping-item {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgb(var(--bg));
    border: 1px solid rgb(var(--border));
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
  }

  .mapping-item:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: rgb(var(--accent));
  }

  .mapping-visual {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .visual-icon {
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: rgb(var(--surface-alt));
  }

  .visual-name {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgb(var(--fg));
    text-align: center;
  }

  .mapping-arrow {
    font-size: 1.2rem;
    color: rgb(var(--accent));
    font-weight: bold;
  }

  .mapping-real {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .real-name {
    font-size: 0.85rem;
    font-weight: 700;
    color: rgb(var(--accent));
    font-family: "Courier New", Courier, monospace;
  }

  .real-desc {
    font-size: 0.7rem;
    color: rgb(var(--muted));
    line-height: 1.2;
  }

  .mapping-divider {
    margin: 1rem 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgb(var(--border)), transparent);
  }

  .mapping-subtitle {
    font-size: 0.9rem;
    font-weight: 700;
    color: rgb(var(--fg));
    margin-bottom: 0.75rem;
  }

  .task-types {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-type {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    background: rgb(var(--bg));
    border: 1px solid rgb(var(--border));
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
  }

  .task-type:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .task-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.35rem 0.6rem;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .task-badge.quick {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fbbf24;
  }

  .task-badge.waiting {
    background: #fee2e2;
    color: #7f1d1d;
    border: 1px solid #ef4444;
  }

  .task-badge.fetch {
    background: #dbeafe;
    color: #1e3a8a;
    border: 1px solid #3b82f6;
  }

  :global(.dark) .task-badge.quick {
    background: #78350f;
    color: #fef3c7;
  }

  :global(.dark) .task-badge.waiting {
    background: #7f1d1d;
    color: #fee2e2;
  }

  :global(.dark) .task-badge.fetch {
    background: #1e3a8a;
    color: #dbeafe;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .mapping-container {
      max-height: none;
    }

    .mapping-item {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .mapping-arrow {
      transform: rotate(90deg);
    }

    .mapping-real {
      align-items: center;
    }
  }
</style>
