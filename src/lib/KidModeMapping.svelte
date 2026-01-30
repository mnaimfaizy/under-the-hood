<script>
  // Component to show mapping between kid-friendly UI and actual JavaScript terminology
</script>

<div class="mapping-container" role="complementary" aria-label="What everything means">
  <div class="mapping-header">
    <span class="header-icon">🔍</span>
    <h3 class="mapping-title">What's Really Happening?</h3>
  </div>
  <p class="mapping-intro">Here's what each fun part represents in real JavaScript!</p>

  <div class="mapping-list">
    <div class="mapping-item" tabindex="0">
      <div class="mapping-visual">
        <div class="visual-icon robot">🤖</div>
        <span class="visual-name">Task Robot</span>
      </div>
      <div class="mapping-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div class="mapping-real">
        <span class="real-name">Call Stack</span>
        <span class="real-desc">Where JavaScript runs code</span>
      </div>
    </div>

    <div class="mapping-item" tabindex="0">
      <div class="mapping-visual">
        <div class="visual-icon cloud">☁️</div>
        <span class="visual-name">Magic Cloud</span>
      </div>
      <div class="mapping-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div class="mapping-real">
        <span class="real-name">Web APIs</span>
        <span class="real-desc">Browser helpers for timers & fetch</span>
      </div>
    </div>

    <div class="mapping-item" tabindex="0">
      <div class="mapping-visual">
        <div class="visual-icon speedy">🏎️</div>
        <span class="visual-name">Speedy Lane</span>
      </div>
      <div class="mapping-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div class="mapping-real">
        <span class="real-name">Microtask Queue</span>
        <span class="real-desc">Fast promises go here</span>
      </div>
    </div>

    <div class="mapping-item" tabindex="0">
      <div class="mapping-visual">
        <div class="visual-icon waiting">👥</div>
        <span class="visual-name">Waiting Line</span>
      </div>
      <div class="mapping-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div class="mapping-real">
        <span class="real-name">Macrotask Queue</span>
        <span class="real-desc">Timers wait in line here</span>
      </div>
    </div>

    <div class="mapping-item" tabindex="0">
      <div class="mapping-visual">
        <div class="visual-icon conveyor">🎢</div>
        <span class="visual-name">Magic Conveyor</span>
      </div>
      <div class="mapping-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div class="mapping-real">
        <span class="real-name">Event Loop</span>
        <span class="real-desc">Picks what runs next</span>
      </div>
    </div>
  </div>

  <div class="mapping-divider"></div>

  <h4 class="mapping-subtitle">
    <span class="subtitle-icon">📦</span>
    Task Types
  </h4>
  <div class="task-types">
    <div class="task-type" tabindex="0">
      <div class="task-badge quick">
        <span class="badge-icon">⚡</span>
        Quick Task
      </div>
      <div class="task-real">
        <span class="real-name">Promise</span>
        <span class="real-desc">Runs in Speedy Lane</span>
      </div>
    </div>

    <div class="task-type" tabindex="0">
      <div class="task-badge waiting">
        <span class="badge-icon">⏱️</span>
        Wait Task
      </div>
      <div class="task-real">
        <span class="real-name">setTimeout</span>
        <span class="real-desc">Waits in line</span>
      </div>
    </div>

    <div class="task-type" tabindex="0">
      <div class="task-badge fetch">
        <span class="badge-icon">🌐</span>
        Fetch Task
      </div>
      <div class="task-real">
        <span class="real-name">fetch()</span>
        <span class="real-desc">Gets data from Cloud</span>
      </div>
    </div>
  </div>
</div>

<style>
  .mapping-container {
    background: linear-gradient(155deg, rgb(var(--surface)) 0%, rgb(var(--surface-alt)) 100%);
    border: 1.5px solid rgb(var(--border) / 0.8);
    border-radius: var(--radius-2xl);
    padding: 1.75rem;
    box-shadow:
      var(--shadow-xl),
      inset 0 1px 0 rgb(255 255 255 / 0.08);
    max-height: 60vh;
    overflow-y: auto;
    position: relative;
  }

  .mapping-container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(145deg, rgb(var(--accent) / 0.06) 0%, transparent 60%);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    pointer-events: none;
  }

  .mapping-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 0.625rem;
    position: relative;
  }

  .header-icon {
    font-size: 1.5rem;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.12));
  }

  .mapping-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: rgb(var(--fg));
    letter-spacing: -0.02em;
  }

  .mapping-intro {
    font-size: 0.8rem;
    color: rgb(var(--muted));
    margin-bottom: 1.5rem;
    line-height: 1.6;
    position: relative;
  }

  .mapping-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mapping-item {
    display: grid;
    grid-template-columns: 1fr 36px 1fr;
    align-items: center;
    gap: 0.625rem;
    padding: 1rem;
    background: linear-gradient(145deg, rgb(var(--bg)) 0%, rgb(var(--surface)) 100%);
    border: 1.5px solid rgb(var(--border) / 0.8);
    border-radius: var(--radius-xl);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .mapping-item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, rgb(var(--accent)) 0%, rgb(var(--accent-secondary)) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .mapping-item:hover {
    transform: translateX(6px);
    box-shadow:
      var(--shadow-lg),
      0 0 0 2px rgb(var(--accent) / 0.1);
    border-color: rgb(var(--accent) / 0.35);
  }

  .mapping-item:hover::before {
    opacity: 1;
  }

  .mapping-item:focus-visible {
    outline: 2px solid rgb(var(--accent));
    outline-offset: 2px;
  }

  .mapping-visual {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
  }

  .visual-icon {
    font-size: 1.875rem;
    width: 3.25rem;
    height: 3.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xl);
    background: linear-gradient(145deg, rgb(var(--surface-alt)) 0%, rgb(var(--surface)) 100%);
    box-shadow:
      inset 0 -2px 0 rgb(0 0 0 / 0.06),
      0 3px 6px rgb(0 0 0 / 0.06);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .mapping-item:hover .visual-icon {
    transform: scale(1.15) rotate(-8deg);
    box-shadow:
      inset 0 -2px 0 rgb(0 0 0 / 0.06),
      0 6px 12px rgb(0 0 0 / 0.1);
  }

  .visual-icon.robot {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  }
  .visual-icon.cloud {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  }
  .visual-icon.speedy {
    background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%);
  }
  .visual-icon.waiting {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  }
  .visual-icon.conveyor {
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  }

  .visual-name {
    font-size: 0.7rem;
    font-weight: 700;
    color: rgb(var(--fg));
    text-align: center;
    letter-spacing: 0.01em;
  }

  .mapping-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(var(--accent));
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  .mapping-arrow svg {
    width: 20px;
    height: 20px;
  }

  .mapping-item:hover .mapping-arrow {
    opacity: 1;
    transform: translateX(2px);
  }

  .mapping-real {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .real-name {
    font-size: 0.875rem;
    font-weight: 700;
    color: rgb(var(--accent));
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    letter-spacing: -0.02em;
  }

  .real-desc {
    font-size: 0.7rem;
    color: rgb(var(--muted));
    line-height: 1.4;
  }

  .mapping-divider {
    margin: 1.25rem 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgb(var(--border)), transparent);
  }

  .mapping-subtitle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 700;
    color: rgb(var(--fg));
    margin-bottom: 0.875rem;
  }

  .subtitle-icon {
    font-size: 1rem;
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
    padding: 0.75rem;
    background: rgb(var(--bg));
    border: 1px solid rgb(var(--border));
    border-radius: var(--radius-lg);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .task-type:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .task-type:focus-visible {
    outline: 2px solid rgb(var(--accent));
    outline-offset: 2px;
  }

  .task-badge {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-lg);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .task-type:hover .task-badge {
    transform: scale(1.04);
  }

  .badge-icon {
    font-size: 1rem;
  }

  .task-badge.quick {
    background: linear-gradient(145deg, #fef9c3 0%, #fde68a 100%);
    color: #92400e;
    border: 1.5px solid #fbbf24;
    box-shadow: 0 3px 8px rgba(251, 191, 36, 0.25);
  }

  .task-badge.waiting {
    background: linear-gradient(145deg, #fce7f3 0%, #fbcfe8 100%);
    color: #9d174d;
    border: 1.5px solid #f472b6;
    box-shadow: 0 3px 8px rgba(244, 114, 182, 0.25);
  }

  .task-badge.fetch {
    background: linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    border: 1.5px solid #60a5fa;
    box-shadow: 0 3px 8px rgba(96, 165, 250, 0.25);
  }

  .task-real {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  :global(.dark) .task-badge.quick {
    background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
    color: #fef3c7;
    border-color: #b45309;
  }

  :global(.dark) .task-badge.waiting {
    background: linear-gradient(135deg, #831843 0%, #9d174d 100%);
    color: #fce7f3;
    border-color: #be185d;
  }

  :global(.dark) .task-badge.fetch {
    background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
    color: #dbeafe;
    border-color: #2563eb;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .mapping-container {
      max-height: none;
      padding: 1.25rem;
    }

    .mapping-item {
      grid-template-columns: 1fr;
      gap: 0.75rem;
      text-align: center;
    }

    .mapping-arrow {
      transform: rotate(90deg);
    }

    .mapping-item:hover .mapping-arrow {
      transform: rotate(90deg) translateX(2px);
    }

    .mapping-real {
      align-items: center;
    }

    .task-type {
      flex-direction: column;
      gap: 0.5rem;
    }

    .task-real {
      align-items: center;
    }
  }

  /* Custom scrollbar for the container */
  .mapping-container::-webkit-scrollbar {
    width: 6px;
  }

  .mapping-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .mapping-container::-webkit-scrollbar-thumb {
    background: rgb(var(--border));
    border-radius: 3px;
  }

  .mapping-container::-webkit-scrollbar-thumb:hover {
    background: rgb(var(--muted));
  }
</style>
