<script>
  export let api = {};
  export let mode = "kid";
  let callStack = [];
  let microQueue = [];
  let macroQueue = [];
  let webAPIs = [];
  let tokens = new Map();

  function pushFrame(frame) {
    callStack = [...callStack, frame];
  }
  function popFrame(frame) {
    // If a specific frame name is supplied, remove all matching; otherwise drop top
    if (frame) {
      callStack = callStack.filter((f) => f !== frame);
    } else if (callStack.length) {
      callStack = callStack.slice(0, callStack.length - 1);
    }
  }
  function enqueueMicro(token) {
    microQueue = [...microQueue, token];
    tokens.set(token.id, token);
  }
  function enqueueMacro(token) {
    macroQueue = [...macroQueue, token];
    tokens.set(token.id, token);
  }
  function dequeueMicro(token) {
    microQueue = microQueue.filter((t) => t.id !== token.id);
  }
  function dequeueMacro(token) {
    macroQueue = macroQueue.filter((t) => t.id !== token.id);
  }

  function handleSimEvent(e) {
    switch (e.type) {
      case "stack-push":
        pushFrame(e.frame);
        break;
      case "stack-pop":
        popFrame(e.frame);
        break;
      case "enqueue-micro":
        enqueueMicro(e.token);
        break;
      case "enqueue-macro":
        enqueueMacro(e.token);
        break;
      case "dequeue-micro":
        dequeueMicro(e.token);
        break;
      case "dequeue-macro":
        dequeueMacro(e.token);
        break;
      case "token-move":
        break;
    }
  }
  function reset() {
    callStack = [];
    microQueue = [];
    macroQueue = [];
    webAPIs = [];
    tokens.clear();
  }
  api = { handleSimEvent, reset };
</script>

<div class="hf-grid" aria-label="JavaScript runtime high fidelity visualization">
  <div class="panel code" aria-label="Source Code">
    <div class="code-window">
      <pre><code
          >console.log('Start!')

setTimeout(() => {console.log("Timeout!")}, 0)

Promise.resolve('Promise!')
  .then(res => console.log(res))

console.log('End!')</code
        ></pre>
    </div>
  </div>
  <div class="panel stack" aria-label="Call Stack">
    <h3>CALL STACK</h3>
    <div class="stack-frames" data-empty={callStack.length === 0}>
      {#each [...callStack].slice().reverse() as frame (frame)}
        <div class="frame">{frame}</div>
      {/each}
    </div>
  </div>
  <div class="panel webapi" aria-label="Web API">
    <h3>WEB API</h3>
    <div class="api-area" data-empty={webAPIs.length === 0}></div>
  </div>
  <div class="panel micro" aria-label="Microtask Queue">
    <h3>MICROTASK QUEUE</h3>
    <div class="queue" data-empty={microQueue.length === 0}>
      {#each microQueue as t (t.id)}<div class="q-item micro">{t.label}</div>{/each}
    </div>
  </div>
  <div class="panel macro" aria-label="Macrotask Queue">
    <h3>MACROTASK QUEUE</h3>
    <div class="queue" data-empty={macroQueue.length === 0}>
      {#each macroQueue as t (t.id)}<div class="q-item macro">{t.label}</div>{/each}
    </div>
  </div>
  <div class="panel loop" aria-label="Event Loop">
    <h3>EVENT LOOP</h3>
    <div class="loop-icon">↻</div>
  </div>
</div>

<style>
  .hf-grid {
    display: grid;
    grid-template-columns: 380px 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 1.5rem;
  }
  .panel {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 0.75rem 1rem 1rem;
    background: #111418;
    box-shadow:
      0 2px 4px -2px rgba(0, 0, 0, 0.5),
      0 4px 16px -4px rgba(0, 0, 0, 0.35);
  }
  h3 {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    font-weight: 600;
    opacity: 0.7;
    margin: 0 0 0.5rem;
  }
  .panel.stack {
    grid-column: 2;
  }
  .panel.webapi {
    grid-column: 3;
  }
  .panel.micro {
    grid-column: 2 / span 1;
  }
  .panel.macro {
    grid-column: 3 / span 1;
  }
  .panel.loop {
    grid-column: 2 / span 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .code-window {
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.72rem;
    line-height: 1.15rem;
    background: #181d23;
    color: #f3f5f7;
  }
  pre {
    margin: 0;
  }
  .stack-frames {
    min-height: 160px;
    display: flex;
    flex-direction: column-reverse;
    gap: 6px;
    justify-content: flex-start;
  }
  .frame {
    background: #182a38;
    border: 1px solid #1f394b;
    padding: 4px 8px;
    font-size: 0.65rem;
    font-family: ui-monospace, monospace;
    border-radius: 6px;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.4);
  }
  .queue {
    min-height: 86px;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 2px;
  }
  .q-item {
    background: #1d2530;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.6rem;
    font-family: ui-monospace, monospace;
    border: 1px solid #293341;
    position: relative;
  }
  .q-item.micro {
    box-shadow: 0 0 0 1px #0ea5e9 inset;
  }
  .q-item.macro {
    box-shadow: 0 0 0 1px #eab308 inset;
  }
  .loop-icon {
    width: 64px;
    height: 64px;
    border: 2px solid #0ea5e9;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    font-size: 1.75rem;
    color: #0ea5e9;
    background: #162027;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
  }
  [data-empty="true"]::after {
    content: "(empty)";
    font-size: 0.6rem;
    opacity: 0.4;
    font-style: italic;
  }
  @media (max-width: 1100px) {
    .hf-grid {
      grid-template-columns: 1fr 1fr;
    }
    .panel.code {
      grid-column: 1 / span 2;
    }
  }
  @media (max-width: 780px) {
    .hf-grid {
      grid-template-columns: 1fr;
    }
    .panel.loop {
      grid-column: 1;
    }
    .panel.stack,
    .panel.webapi,
    .panel.micro,
    .panel.macro {
      grid-column: 1;
    }
  }
</style>
