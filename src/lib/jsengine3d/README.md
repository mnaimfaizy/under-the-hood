# New JavaScript Execution Engine (3D)

## Overview

A complete from-scratch reimplementation of the JavaScript execution visualization in full 3D with modern materials, smooth animations, and clear execution flow.

## Key Features

### ✨ **Brand New Design**

- Completely redesigned from the ground up
- Modern 3D aesthetics with physically-based rendering (PBR)
- Cinematic camera positioning and smooth controls
- Professional lighting with ambient, directional, and accent lights

### 🎯 **Core Components**

#### 1. Call Stack (Tower)

- Vertical tower structure on the left side
- Support pillars and base platform
- Frames appear as glowing boxes
- Smooth bounce-in animation when pushing
- Float-up animation when popping
- Gentle floating idle animation

#### 2. Microtask Queue (VIP Lane)

- Purple/violet themed "VIP Lane" platform
- Diamond-shaped (octahedron) task objects
- Continuous rotation for visual interest
- Queue shifts smoothly when dequeuing
- Position: Front-center (z=12)

#### 3. Macrotask Queue (Regular Lane)

- Orange/amber themed regular lane
- Cube-shaped task objects
- Rotating animation
- Queue shifts when tasks are processed
- Position: Back-center (z=-12)

#### 4. Web APIs (Orbital Hub)

- Green-themed central hub with orbital system
- Spherical task objects orbit around the hub
- Particle effects for active APIs
- Different colors for different API types:
  - **Timer**: Orange (#f39c12)
  - **Fetch**: Blue (#3498db)
  - **DOM**: Red (#e74c3c)
  - **I/O**: Purple (#9b59b6)
- Position: Right side (x=12)

#### 5. Event Loop (Central Controller)

- Rotating torus ring at ground level
- Central glowing sphere with energy rings
- Phase indicators around the ring
- Changes color/intensity based on current phase
- Position: Center (0, 0, 0)

#### 6. Execution Flow (Visual Paths)

- Curved animated paths between components
- Particle flow shows task movement
- Cyan/aqua color for visibility
- Appears temporarily during transitions

### 🎨 **Visual Quality**

#### Materials

- **MeshPhysicalMaterial** throughout for premium look
- **Clearcoat** effects for glossy finishes
- **Metalness** and **roughness** properly configured
- **Emissive** properties for glowing effects
- **Transparency** where appropriate

#### Lighting

- **Ambient**: 0.8 intensity, cool tone (0x404060)
- **Directional**: 1.5 intensity from upper-right
- **Fill Light**: 0.4 intensity from opposite side
- **Accent Lights**: Color-coded per component
  - Call Stack: Blue (1.5 intensity)
  - Microtasks: Purple (1.2 intensity)
  - Macrotasks: Orange (1.2 intensity)
  - Web APIs: Green (1.0 intensity)

#### Camera

- **FOV**: 50° (less distortion than standard)
- **Position**: (25, 20, 35) - optimal viewing angle
- **Target**: (0, 5, 0) - slightly above center
- **Orbit Controls**: Enabled with damping
- **Zoom Range**: 15-70 units

### 🎬 **Animations**

#### Entry Animations

- **Bounce-in**: Call stack frames, queue items
- **Back-out easing**: Smooth overshoot effect
- **Fade-in**: Opacity transitions from 0 to 1

#### Exit Animations

- **Float-up**: Call stack frames rise and fade
- **Shrink**: Web API tasks scale down to 0.1
- **Slide**: Queue items shift positions

#### Continuous Animations

- **Rotation**: Tasks, energy rings, event loop
- **Floating**: Subtle up/down bobbing
- **Pulsing**: Scale variations on active elements
- **Flow**: Particle trails along execution paths

### 🎮 **User Interface**

#### Playback Controls

- ▶️ **Play**: Start scenario execution
- ⏸️ **Pause**: Pause execution
- 🔄 **Reset**: Clear and reload scenario
- ⏭️ **Step**: Execute one step at a time

#### Scenario Selection

- Timer vs Promise
- Two Logs
- Fetch Robot
- Microtask Chain
- Nested Timeouts
- Async/Await

#### Speed Control

- Range: 200ms - 2000ms per step
- Real-time slider adjustment
- Affects simulation speed only

#### Visual Feedback

- **Phase Indicator**: Shows current execution phase
- **Narration**: Text description of current action
- **Legend**: Color-coded component reference

## Technical Implementation

### Stack

- **Three.js**: 3D rendering engine
- **GSAP**: Animation library
- **OrbitControls**: Camera interaction
- **Svelte**: Component framework
- **TypeScript**: Type safety

### Architecture

```
NewJSEngine3D.svelte (UI Container)
  └─ JSEngine3D.ts (Main Engine)
       ├─ CallStack
       ├─ MicrotaskQueue
       ├─ MacrotaskQueue
       ├─ WebAPIs
       ├─ EventLoop
       └─ ExecutionFlow
```

### Event Handling

Integrates with existing simulation engine:

- `stack-push/pop`: Call stack operations
- `enqueue-micro/macro`: Queue operations
- `dequeue-micro/macro`: Task dequeuing
- `webapi-add/complete`: Web API lifecycle
- `tick`: Event loop phases
- `scenario-end`: Completion

### Performance

- **60 FPS target**: Smooth animations
- **Shadow mapping**: PCF soft shadows (2048x2048)
- **Tone mapping**: ACES Filmic for cinematic look
- **Fog**: Depth cueing for better perception
- **Pixel ratio**: Capped at 2x for performance

## Usage

### In App

Select "🚀 New 3D Engine" from the View dropdown in the main app.

### Standalone

```svelte
<script>
  import NewJSEngine3D from "./lib/NewJSEngine3D.svelte";
</script>

<NewJSEngine3D />
```

## Design Philosophy

### Goals

1. **Clarity**: Each component is distinct and clearly labeled
2. **Beauty**: Professional materials and lighting
3. **Motion**: Smooth, meaningful animations
4. **Integration**: Works with existing scenarios
5. **Performance**: Maintains 60fps on modern hardware

### Differences from Old Implementation

- ❌ **Removed**: Complex, overlapping components
- ❌ **Removed**: Confusing spatial layout
- ❌ **Removed**: Basic/outdated materials
- ✅ **Added**: Clear separation of concerns
- ✅ **Added**: Modern PBR materials
- ✅ **Added**: Execution flow visualization
- ✅ **Added**: Professional lighting setup

## Future Enhancements

### Potential Additions

1. **Post-processing**: Bloom for glowing effects
2. **Environment map**: Reflections on metallic surfaces
3. **Sound effects**: Audio feedback for events
4. **VR support**: Immersive visualization
5. **Custom camera paths**: Automated cinematics
6. **Detailed tooltips**: Hover information
7. **Performance graphs**: Real-time metrics
8. **Code synchronization**: Highlight executing code

### Known Limitations

- Limited to 10 call stack frames
- Limited to 8 items per queue
- Limited to 6 concurrent Web API tasks
- No mobile optimization yet

## License

Same as parent project.

## Credits

Built entirely from scratch for the "Under the Hood: JavaScript" project.
