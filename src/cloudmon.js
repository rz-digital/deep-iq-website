export default function mount(scope) {
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = $('[data-header]');
const progress = $('.reading-progress span');

const syncScrollState = () => {
  header?.classList.toggle('scrolled', window.scrollY > 28);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0}%`;
};

syncScrollState();
scope.on(window, 'scroll', syncScrollState, { passive: true });
scope.on(window, 'resize', syncScrollState, { passive: true });

const menuButton = $('.menu-toggle');
const mobileNav = $('.mobile-nav');
const setMenuOpen = (open) => {
  menuButton?.classList.toggle('open', open);
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav?.classList.toggle('open', open);
  mobileNav?.setAttribute('aria-hidden', String(!open));
  if (mobileNav) mobileNav.inert = !open;
  document.body.style.overflow = open ? 'hidden' : '';
};

scope.on(menuButton, 'click', () => setMenuOpen(!mobileNav?.classList.contains('open')));
$$('.mobile-nav a').forEach((link) => scope.on(link, 'click', () => setMenuOpen(false)));
scope.on(window, 'keydown', (event) => {
  if (event.key === 'Escape' && mobileNav?.classList.contains('open')) {
    setMenuOpen(false);
    menuButton?.focus();
  }
});
scope.on(window, 'resize', () => {
  if (window.innerWidth > 1100 && mobileNav?.classList.contains('open')) setMenuOpen(false);
}, { passive: true });

const revealElements = $$('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = scope.observe(IntersectionObserver, (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('in-view'));
}

const cursorAura = $('.cursor-aura');
if (cursorAura && window.matchMedia('(pointer:fine)').matches) {
  scope.on(window, 'pointermove', (event) => {
    cursorAura.style.opacity = '1';
    cursorAura.style.left = `${event.clientX}px`;
    cursorAura.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const heroImage = $('[data-parallax]');
if (heroImage && !reducedMotion) {
  scope.on(window, 'scroll', () => {
    heroImage.style.transform = `scale(1.035) translateY(${Math.min(window.scrollY * 0.07, 65)}px)`;
  }, { passive: true });
}

class TelemetryField {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.context = canvas?.getContext('2d');
    this.options = { density: 26, maxDistance: 145, speed: 0.12, ...options };
    this.points = [];
    this.frame = 0;
    this.running = false;
    this.width = 0;
    this.height = 0;
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    if (!this.context) return;
    this.resize();
    scope.on(window, 'resize', this.resize);
    if (!reducedMotion) this.start();
    else this.draw(true);
  }

  start() {
    if (!this.context || this.running || reducedMotion) return;
    this.running = true;
    this.frame = scope.requestAnimationFrame(this.draw);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    scope.cancelAnimationFrame(this.frame);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(18, Math.min(78, Math.floor(rect.width / this.options.density)));
    this.points = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * this.options.speed,
      vy: (Math.random() - 0.5) * this.options.speed,
      size: index % 9 === 0 ? Math.random() * 1.7 + 1 : Math.random() * 1.1 + 0.35,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  draw(singleFrame = false) {
    if (!singleFrame && !this.running) return;
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);
    const time = performance.now() * 0.001;

    this.points.forEach((point, index) => {
      if (!singleFrame) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < -10 || point.x > this.width + 10) point.vx *= -1;
        if (point.y < -10 || point.y > this.height + 10) point.vy *= -1;
      }

      const glow = 0.52 + Math.sin(time * 1.5 + point.phase) * 0.28;
      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(84, 220, 255, ${Math.max(0.18, glow)})`;
      context.fill();

      for (let otherIndex = index + 1; otherIndex < this.points.length; otherIndex += 1) {
        const other = this.points[otherIndex];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance > this.options.maxDistance) continue;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(31, 174, 255, ${(1 - distance / this.options.maxDistance) * 0.13})`;
        context.lineWidth = 0.65;
        context.stroke();
      }
    });

    if (!singleFrame && this.running) this.frame = scope.requestAnimationFrame(this.draw);
  }
}

const heroField = new TelemetryField($('#telemetry-canvas'), { density: 31, maxDistance: 155, speed: 0.15 });
const ctaField = new TelemetryField($('#cta-canvas'), { density: 24, maxDistance: 135, speed: 0.1 });

scope.on(document, 'visibilitychange', () => {
  [heroField, ctaField].forEach((field) => {
    if (!field?.context || reducedMotion) return;
    if (document.hidden) field.stop();
    else field.start();
  });
});

const coverageWizardData = {
  infrastructure: {
    label: 'Infrastructure',
    signals: ['Compute', 'Storage', 'Endpoints'],
    steps: [
      { insight: 'Cloudmon continuously discovers every active layer and maps how operational signals move between them.', points: ['Asset discovery', 'Dependency mapping', 'Health baselines'], metrics: [['Assets', '128'], ['Availability', '99.98%'], ['Response', '14 ms']] },
      { insight: 'Compute, memory, disk and event telemetry are joined into one timeline so related symptoms become one incident.', points: ['Metric correlation', 'Change context', 'Anomaly grouping'], metrics: [['Signals', '42K/s'], ['Anomalies', '03'], ['Confidence', '96%']] },
      { insight: 'The highest-impact infrastructure issue is surfaced with affected services and a clear remediation path.', points: ['Impact ranking', 'Root-cause path', 'Guided response'], metrics: [['Priority', 'P1'], ['Noise reduced', '31%'], ['Status', 'Ready']] },
    ],
  },
  network: {
    label: 'Network & SD-WAN',
    signals: ['Sites', 'Paths', 'Traffic'],
    steps: [
      { insight: 'Every site, circuit and routed dependency becomes part of a continuously updated topology.', points: ['Path discovery', 'Link health', 'Traffic direction'], metrics: [['Nodes', '86'], ['Links', '142'], ['Latency', '18 ms']] },
      { insight: 'Latency, jitter, loss and configuration events are correlated across the full path instead of viewed in isolation.', points: ['Hop context', 'Flow correlation', 'Change detection'], metrics: [['Flows', '18K/s'], ['Packet loss', '0.2%'], ['Jitter', '4 ms']] },
      { insight: 'Cloudmon identifies the degraded segment and directs response toward the route with the greatest business impact.', points: ['Path isolation', 'SLA impact', 'Route response'], metrics: [['Affected', '01 path'], ['Impact', 'Medium'], ['Reroute', 'Ready']] },
    ],
  },
  cloud: {
    label: 'Hybrid & Multi-Cloud',
    signals: ['On-prem', 'AWS', 'Azure'],
    steps: [
      { insight: 'On-premise and cloud resources are discovered as one connected operating environment.', points: ['Account discovery', 'Region mapping', 'Service inventory'], metrics: [['Resources', '264'], ['Regions', '06'], ['Accounts', '12']] },
      { insight: 'Cross-cloud traces, infrastructure metrics and deployment events are aligned on a shared dependency map.', points: ['Trace linking', 'Cost context', 'Deploy correlation'], metrics: [['Telemetry', '64K/s'], ['Changes', '08'], ['Coverage', '98%']] },
      { insight: 'The affected region and downstream services are isolated before the issue spreads across environments.', points: ['Blast radius', 'Capacity signal', 'Recovery path'], metrics: [['Risk', 'Contained'], ['Services', '03'], ['Recovery', '4 min']] },
    ],
  },
  applications: {
    label: 'Applications & Services',
    signals: ['Users', 'Services', 'Data'],
    steps: [
      { insight: 'User journeys, APIs, services and databases are connected into a live application map.', points: ['Service discovery', 'Request paths', 'Experience signals'], metrics: [['Services', '47'], ['Requests', '8.4K/s'], ['P95', '182 ms']] },
      { insight: 'Traces, errors, logs and release events reveal which dependency caused the slowdown.', points: ['Trace correlation', 'Error grouping', 'Release context'], metrics: [['Traces', '31K/s'], ['Errors', '0.7%'], ['Build', '#2841']] },
      { insight: 'The failing service is prioritized by user impact, with its dependency chain kept visible for response.', points: ['User impact', 'Fault isolation', 'Owner routing'], metrics: [['Affected', '2.1%'], ['Cause', 'API-03'], ['Owner', 'Assigned']] },
    ],
  },
  industrial: {
    label: 'OT & Industrial',
    signals: ['PLCs', 'Sensors', 'Machines'],
    steps: [
      { insight: 'Controllers, production assets and sensor relationships are mapped without losing operational context.', points: ['Asset hierarchy', 'Protocol visibility', 'State monitoring'], metrics: [['Assets', '73'], ['Sensors', '416'], ['Uptime', '99.95%']] },
      { insight: 'Machine state, environmental telemetry and controller events are correlated along the production flow.', points: ['State correlation', 'Threshold context', 'Sequence analysis'], metrics: [['Events', '12K/s'], ['Variance', '1.8%'], ['Alerts', '04']] },
      { insight: 'Cloudmon highlights the asset at risk and shows the upstream and downstream processes that depend on it.', points: ['Failure risk', 'Process impact', 'Maintenance cue'], metrics: [['Risk', 'Motor-04'], ['Lead time', '38 min'], ['Action', 'Inspect']] },
    ],
  },
  iot: {
    label: 'IoT & Edge',
    signals: ['Devices', 'Gateways', 'Events'],
    steps: [
      { insight: 'Distributed devices and gateways are discovered, grouped and connected to their edge relationships.', points: ['Device identity', 'Gateway mapping', 'Fleet status'], metrics: [['Devices', '2,840'], ['Gateways', '18'], ['Online', '99.2%']] },
      { insight: 'Device events, connectivity changes and edge workloads are correlated across the fleet.', points: ['Event streams', 'Signal quality', 'Firmware context'], metrics: [['Events', '91K/s'], ['Offline', '07'], ['Drift', '0.4%']] },
      { insight: 'The affected device group is isolated and response can be targeted without disrupting the wider fleet.', points: ['Fleet segmentation', 'Edge diagnosis', 'Targeted action'], metrics: [['Group', 'Edge-07'], ['Devices', '14'], ['Command', 'Queued']] },
    ],
  },
  ai: {
    label: 'AI & GPU',
    signals: ['GPUs', 'Models', 'Memory'],
    steps: [
      { insight: 'GPU clusters, model services and high-speed storage are mapped as one AI delivery pipeline.', points: ['GPU discovery', 'Model topology', 'Memory paths'], metrics: [['GPUs', '32'], ['Models', '11'], ['Utilisation', '87%']] },
      { insight: 'Thermals, memory pressure, queue depth and inference latency are correlated with workload changes.', points: ['Thermal context', 'Queue analysis', 'Model correlation'], metrics: [['Throughput', '4.2K/s'], ['Memory', '78%'], ['P95', '43 ms']] },
      { insight: 'Cloudmon surfaces the constrained GPU path and shows the safest workload adjustment before performance falls.', points: ['Capacity forecast', 'Bottleneck path', 'Workload action'], metrics: [['Constraint', 'GPU-12'], ['Headroom', '13%'], ['Rebalance', 'Ready']] },
    ],
  },
};

const coverageExpansionData = {
  network: {
    title: 'LIVE NETWORK PATH',
    items: [
      ['SITE EDGE', 'router'],
      ['SD-WAN GATEWAY', 'router'],
      ['WAN CIRCUIT', 'management'],
      ['CORE SWITCH', 'switch'],
      ['CLOUD ENDPOINT', 'server'],
    ],
    metrics: ['LATENCY', 'JITTER', 'PACKET LOSS'],
  },
  cloud: {
    title: 'HYBRID CLOUD DEPENDENCIES',
    items: [
      ['ON-PREMISE AGENT', 'server'],
      ['CLOUD GATEWAY', 'router'],
      ['REGION SERVICE', 'management'],
      ['APPLICATION CLUSTER', 'server'],
      ['DATA STORE', 'storage'],
    ],
    metrics: ['UTILISATION', 'REQUESTS', 'CAPACITY'],
  },
  applications: {
    title: 'APPLICATION REQUEST PATH',
    items: [
      ['USER EDGE', 'management'],
      ['API GATEWAY', 'router'],
      ['APPLICATION SERVICE', 'server'],
      ['WORKER SERVICE', 'server'],
      ['DATABASE', 'storage'],
    ],
    metrics: ['RESPONSE', 'ERROR RATE', 'THROUGHPUT'],
  },
  industrial: {
    title: 'OT PRODUCTION PATH',
    items: [
      ['SENSOR GATEWAY', 'probe'],
      ['PLC CONTROLLER', 'management'],
      ['PRODUCTION CELL', 'server'],
      ['VARIABLE DRIVE', 'management'],
      ['CONTROL ROOM', 'management'],
    ],
    metrics: ['TEMPERATURE', 'VIBRATION', 'CYCLE TIME'],
  },
  iot: {
    title: 'EDGE DEVICE FLEET',
    items: [
      ['EDGE SENSOR', 'probe'],
      ['DEVICE GATEWAY', 'router'],
      ['EDGE PROCESSOR', 'server'],
      ['IOT PLATFORM', 'management'],
      ['TELEMETRY STORE', 'storage'],
    ],
    metrics: ['SIGNAL QUALITY', 'BATTERY', 'EVENT RATE'],
  },
  ai: {
    title: 'AI WORKLOAD PIPELINE',
    items: [
      ['MODEL SERVICE', 'management'],
      ['GPU COMPUTE NODE', 'server'],
      ['HIGH-SPEED FABRIC', 'switch'],
      ['MEMORY POOL', 'storage'],
      ['INFERENCE ENDPOINT', 'server'],
    ],
    metrics: ['GPU UTILISATION', 'MEMORY', 'INFERENCE'],
  },
};

class CoverageWizardVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas?.getContext('2d');
    this.scene = 'infrastructure';
    this.step = 0;
    this.frame = 0;
    this.running = false;
    this.width = 0;
    this.height = 0;
    this.sequenceStart = performance.now() * 0.001;
    this.pausedAt = 0;
    this.flowPhase = 0;
    this.accent = '#35d8ff';
    this.accentRgb = '53,216,255';
    this.detailMode = 'overview';
    this.selectedRack = 0;
    this.selectedDevice = 0;
    this.selectedItem = 0;
    this.hitRegions = [];
    this.hoverTarget = '';
    this.zoomOrigin = null;
    this.transitionStart = 0;
    this.elapsedTime = 0;
    this.draw = this.draw.bind(this);
    this.resize = this.resize.bind(this);
    if (!this.context) return;
    this.resizeObserver = scope.observe(ResizeObserver, this.resize);
    this.resizeObserver.observe(canvas);
  }

  open(scene) {
    this.scene = scene;
    this.resetDetailView();
    this.sequenceStart = performance.now() * 0.001;
    this.pausedAt = 0;
    this.resize();
    if (reducedMotion) this.drawFrame(6.2);
    else this.start();
  }

  close() {
    this.stop();
    this.context?.clearRect(0, 0, this.width, this.height);
  }

  setStep(step) {
    this.step = step;
    if (reducedMotion) this.drawFrame(6.2);
  }

  resetDetailView() {
    this.detailMode = 'overview';
    this.selectedRack = 0;
    this.selectedDevice = 0;
    this.selectedItem = 0;
    this.hitRegions = [];
    this.hoverTarget = '';
    this.zoomOrigin = null;
    this.transitionStart = this.elapsedTime;
  }

  getDetailMode() {
    return this.detailMode;
  }

  backDetail() {
    if (this.scene !== 'infrastructure' && this.detailMode === 'expanded') this.detailMode = 'overview';
    if (this.detailMode === 'device') this.detailMode = 'switch';
    else if (this.detailMode === 'switch') this.detailMode = 'rack';
    else if (this.detailMode === 'rack') this.detailMode = 'overview';
    else if (this.detailMode !== 'overview') return false;
    else if (this.scene === 'infrastructure') return false;
    this.hoverTarget = '';
    this.transitionStart = this.elapsedTime;
    this.drawFrame(this.elapsedTime);
    return true;
  }

  hitTest(x, y) {
    return [...this.hitRegions].reverse().find((region) => x >= region.x && x <= region.x + region.width && y >= region.y && y <= region.y + region.height) || null;
  }

  setHoverTarget(target) {
    const nextTarget = target?.id || '';
    if (nextTarget === this.hoverTarget) return;
    this.hoverTarget = nextTarget;
    if (!this.running) this.drawFrame(this.elapsedTime);
  }

  activateAt(x, y) {
    const target = this.hitTest(x, y);
    if (!target) return false;
    return this.activateTarget(target);
  }

  activateTarget(target) {
    if (target.type === 'rack') {
      this.selectedRack = target.index;
      this.zoomOrigin = { x: target.x, y: target.y, width: target.width, height: target.height };
      this.detailMode = 'rack';
    } else if (target.type === 'switch') {
      this.detailMode = 'switch';
    } else if (target.type === 'device') {
      this.selectedDevice = target.index;
      this.detailMode = 'device';
    } else if (target.type === 'scene-item' && this.scene !== 'infrastructure') {
      this.selectedItem = target.detailIndex ?? target.index;
      this.zoomOrigin = { x: target.x, y: target.y, width: target.width, height: target.height };
      this.detailMode = 'expanded';
    } else {
      return false;
    }
    this.hoverTarget = '';
    this.transitionStart = this.elapsedTime;
    this.drawFrame(this.elapsedTime);
    return true;
  }

  keyboardTarget(direction = 0) {
    if (this.scene !== 'infrastructure') {
      if (this.detailMode !== 'overview') return null;
      const targets = this.hitRegions.filter((region) => region.type === 'scene-item');
      if (!targets.length) return null;
      this.selectedItem = (this.selectedItem + direction + targets.length) % targets.length;
      const target = targets[this.selectedItem];
      this.setHoverTarget(target);
      return target;
    }
    if (this.detailMode === 'overview') {
      this.selectedRack = (this.selectedRack + direction + 3) % 3;
      this.setHoverTarget({ id: 'rack-' + this.selectedRack });
      return this.hitRegions.find((region) => region.type === 'rack' && region.index === this.selectedRack) || null;
    }
    if (this.detailMode === 'rack') return this.hitRegions.find((region) => region.type === 'switch') || null;
    if (this.detailMode === 'switch') {
      this.selectedDevice = (this.selectedDevice + direction + 4) % 4;
      this.setHoverTarget({ id: 'device-' + this.selectedDevice });
      return this.hitRegions.find((region) => region.type === 'device' && region.index === this.selectedDevice) || null;
    }
    return null;
  }

  restart() {
    this.sequenceStart = performance.now() * 0.001;
    this.pausedAt = 0;
    this.drawFrame(0);
  }

  start() {
    if (!this.context || this.running) return;
    const now = performance.now() * 0.001;
    if (this.pausedAt) this.sequenceStart += now - this.pausedAt;
    this.pausedAt = 0;
    this.running = true;
    this.frame = scope.requestAnimationFrame(this.draw);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.pausedAt = performance.now() * 0.001;
    scope.cancelAnimationFrame(this.frame);
  }

  resize() {
    if (!this.context) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
    this.context.setTransform(this.canvas.width / rect.width, 0, 0, this.canvas.height / rect.height, 0, 0);
    this.context.imageSmoothingEnabled = false;
    const clock = this.pausedAt || performance.now() * 0.001;
    this.drawFrame(reducedMotion ? 6.2 : Math.max(0, clock - this.sequenceStart));
  }

  draw() {
    if (!this.running) return;
    this.drawFrame(performance.now() * 0.001 - this.sequenceStart);
    this.frame = scope.requestAnimationFrame(this.draw);
  }

  drawFrame(time) {
    const context = this.context;
    if (!context || !this.width || !this.height) return;
    this.elapsedTime = time;
    this.hitRegions = [];
    const sequence = (time % 16) / 16;
    this.flowPhase = Math.floor(sequence * 4);
    context.clearRect(0, 0, this.width, this.height);
    const accents = [
      ['#35d8ff', '53,216,255'],
      ['#8127ff', '129,39,255'],
      ['#ff9f43', '255,159,67'],
      ['#3dffb3', '61,255,179'],
    ];
    [this.accent, this.accentRgb] = accents[this.flowPhase];
    this.drawBoundary();
    if (this.detailMode !== 'overview') {
      if (this.scene === 'infrastructure') this.drawInfrastructureDetail(time);
      else this.drawExpandedScene(time);
      return;
    }
    const drawers = {
      infrastructure: this.drawInfrastructure,
      network: this.drawNetwork,
      cloud: this.drawCloud,
      applications: this.drawApplications,
      industrial: this.drawIndustrial,
      iot: this.drawIot,
      ai: this.drawAi,
    };
    const fullWidth = this.width;
    const fullHeight = this.height;
    const compact = fullWidth < 700;
    this.width = compact ? fullWidth : fullWidth * 0.39;
    this.height = compact ? fullHeight * 0.32 : fullHeight;
    const currentStep = this.step;
    this.step = 0;
    (drawers[this.scene] || drawers.infrastructure).call(this, time);
    this.step = currentStep;
    this.width = fullWidth;
    this.height = fullHeight;
    this.drawUnifiedFlow(time, sequence, compact);
  }

  drawBoundary() {
    const context = this.context;
    context.save();
    context.strokeStyle = 'rgba(53,216,255,.09)';
    context.lineWidth = 1;
    context.setLineDash([4, 8]);
    context.strokeRect(18.5, 31.5, Math.max(0, this.width - 37), Math.max(0, this.height - 63));
    context.restore();
  }

  drawLine(a, b, alpha = 0.26, dashed = false) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5);
    context.lineTo(Math.round(b.x) + 0.5, Math.round(b.y) + 0.5);
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + alpha + ')';
    context.lineWidth = 1;
    if (dashed) context.setLineDash([5, 7]);
    context.stroke();
    context.restore();
  }

  drawPolyline(points, alpha = 0.26) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(Math.round(points[0].x) + 0.5, Math.round(points[0].y) + 0.5);
    points.slice(1).forEach((point) => context.lineTo(Math.round(point.x) + 0.5, Math.round(point.y) + 0.5));
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + alpha + ')';
    context.lineWidth = 1;
    context.stroke();
    context.restore();
  }

  pointOnPath(points, progress) {
    const lengths = [];
    let total = 0;
    for (let index = 1; index < points.length; index += 1) {
      const length = Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
      lengths.push(length);
      total += length;
    }
    let distance = progress * total;
    for (let index = 0; index < lengths.length; index += 1) {
      if (distance <= lengths[index]) {
        const ratio = distance / lengths[index];
        return {
          x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
          y: points[index].y + (points[index + 1].y - points[index].y) * ratio,
        };
      }
      distance -= lengths[index];
    }
    return points[points.length - 1];
  }

  drawPacket(points, progress, radius = 2.7) {
    const point = this.pointOnPath(points, progress % 1);
    const context = this.context;
    context.save();
    context.shadowBlur = 6;
    context.shadowColor = this.accent;
    context.fillStyle = this.accent;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  drawNode(x, y, radius, label, activity = 0.5) {
    const context = this.context;
    const pulse = 0.5 + Math.sin(activity) * 0.5;
    context.save();
    context.fillStyle = 'rgba(4,17,29,.94)';
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + (0.48 + pulse * 0.28) + ')';
    context.lineWidth = 1;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = this.accent;
    context.globalAlpha = 0.55 + pulse * 0.4;
    context.beginPath();
    context.arc(x, y, Math.max(2, radius * 0.2), 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
    this.drawLabel(label, x, y + radius + 14);
    context.restore();
  }

  drawBox(x, y, width, height, label, active = false) {
    const context = this.context;
    context.save();
    context.fillStyle = active ? 'rgba(' + this.accentRgb + ',.12)' : 'rgba(4,17,29,.92)';
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + (active ? '.7' : '.3') + ')';
    context.lineWidth = 1;
    context.fillRect(x, y, width, height);
    context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    context.fillStyle = 'rgba(' + this.accentRgb + ',.2)';
    context.fillRect(x + 7, y + 7, Math.max(8, width * 0.28), 2);
    this.drawLabel(label, x + width / 2, y + height + 14);
    context.restore();
  }

  drawLabel(label, x, y, align = 'center') {
    const context = this.context;
    context.save();
    context.fillStyle = 'rgba(190,216,232,.9)';
    context.font = '600 8px Inter, Arial, sans-serif';
    context.letterSpacing = '.75px';
    context.textAlign = align;
    context.fillText(label, Math.round(x), Math.round(y));
    context.restore();
  }

  drawStepFocus(x, y, time) {
    if (this.step === 0) return;
    const context = this.context;
    const radius = 24 + (Math.sin(time * 2.2) + 1) * 5;
    context.save();
    context.strokeStyle = 'rgba(' + this.accentRgb + ',.35)';
    context.setLineDash([4, 6]);
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  drawColorLine(a, b, color, alpha = 0.3, width = 1, dashed = false) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5);
    context.lineTo(Math.round(b.x) + 0.5, Math.round(b.y) + 0.5);
    context.strokeStyle = color;
    context.globalAlpha = alpha;
    context.lineWidth = width;
    if (dashed) context.setLineDash([5, 7]);
    context.stroke();
    context.restore();
  }

  drawColorPacket(points, progress, color, radius = 2.7, alpha = 1) {
    const point = this.pointOnPath(points, ((progress % 1) + 1) % 1);
    const context = this.context;
    context.save();
    context.globalAlpha = alpha;
    context.shadowBlur = 7;
    context.shadowColor = color;
    context.fillStyle = color;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  drawHeartbeatTrace(x, y, width, time, color = '#35d8ff', phase = 0, strength = 1) {
    const context = this.context;
    const amplitude = 9 * strength;
    const speed = 0.72;
    const cycles = Math.max(2, Math.min(3.2, width / 55));
    const points = [
      [0, 0],
      [0.12, 0],
      [0.18, -0.13],
      [0.24, 0],
      [0.33, 0],
      [0.37, 0.2],
      [0.4, -1],
      [0.435, 0.46],
      [0.49, 0],
      [0.58, -0.06],
      [0.66, -0.27],
      [0.75, -0.08],
      [0.84, 0],
      [1, 0],
    ];
    const heartbeatAt = (position) => {
      const cycle = ((position * cycles - time * speed - phase) % 1 + 1) % 1;
      for (let index = 1; index < points.length; index += 1) {
        if (cycle > points[index][0]) continue;
        const previous = points[index - 1];
        const next = points[index];
        const progress = (cycle - previous[0]) / (next[0] - previous[0]);
        return previous[1] + (next[1] - previous[1]) * progress;
      }
      return 0;
    };

    context.save();
    context.beginPath();
    context.rect(x - 2, y - amplitude - 3, width + 4, amplitude * 1.7 + 6);
    context.clip();
    context.strokeStyle = 'rgba(81,121,145,.2)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, Math.round(y) + 0.5);
    context.lineTo(x + width, Math.round(y) + 0.5);
    context.stroke();

    context.strokeStyle = color;
    context.globalAlpha = 0.78 + strength * 0.2;
    context.lineWidth = 1.45;
    context.lineJoin = 'round';
    context.shadowBlur = 4;
    context.shadowColor = color;
    context.beginPath();
    const samples = Math.max(32, Math.ceil(width / 1.5));
    for (let index = 0; index <= samples; index += 1) {
      const progress = index / samples;
      const pointX = x + progress * width;
      const pointY = y + heartbeatAt(progress) * amplitude;
      if (index === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    }
    context.stroke();

    const sweepProgress = ((time * speed + phase + 0.4) % cycles + cycles) % cycles / cycles;
    const sweepX = x + sweepProgress * width;
    const sweepY = y + heartbeatAt(sweepProgress) * amplitude;
    context.fillStyle = color;
    context.globalAlpha = 1;
    context.beginPath();
    context.arc(sweepX, sweepY, 1.7, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  bezierPoint(start, controlA, controlB, end, progress) {
    const remaining = 1 - progress;
    return {
      x: remaining ** 3 * start.x + 3 * remaining ** 2 * progress * controlA.x + 3 * remaining * progress ** 2 * controlB.x + progress ** 3 * end.x,
      y: remaining ** 3 * start.y + 3 * remaining ** 2 * progress * controlA.y + 3 * remaining * progress ** 2 * controlB.y + progress ** 3 * end.y,
    };
  }

  drawBezierLine(start, controlA, controlB, end, color, alpha = 0.3, dashed = false) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.bezierCurveTo(controlA.x, controlA.y, controlB.x, controlB.y, end.x, end.y);
    context.strokeStyle = color;
    context.globalAlpha = alpha;
    context.lineWidth = 1.2;
    if (dashed) context.setLineDash([6, 8]);
    context.stroke();
    context.restore();
  }

  drawBezierPacket(start, controlA, controlB, end, progress, color, radius = 3) {
    const point = this.bezierPoint(start, controlA, controlB, end, ((progress % 1) + 1) % 1);
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.shadowBlur = 8;
    context.shadowColor = color;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  drawFlowTag(x, y, number, label, active, align = 'center') {
    const context = this.context;
    context.save();
    context.textAlign = align;
    context.font = '600 8px Inter, Arial, sans-serif';
    context.letterSpacing = '1px';
    context.fillStyle = active ? this.accent : 'rgba(151,181,199,.72)';
    context.shadowBlur = active ? 4 : 0;
    context.shadowColor = this.accent;
    context.fillText(number + '  ' + label, Math.round(x), Math.round(y));
    context.restore();
  }

  drawCorrelationEngine(point, time, activeStrength, compact) {
    const context = this.context;
    const radius = compact ? 31 : 39;
    const orbit = radius + 12;
    context.save();
    context.translate(point.x, point.y);

    const glow = context.createRadialGradient(0, 0, 2, 0, 0, orbit + 12);
    glow.addColorStop(0, 'rgba(129,39,255,.22)');
    glow.addColorStop(1, 'rgba(129,39,255,0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(0, 0, orbit + 12, 0, Math.PI * 2);
    context.fill();

    context.rotate(time * (0.18 + activeStrength * 0.22));
    context.strokeStyle = 'rgba(129,39,255,' + (0.26 + activeStrength * 0.42) + ')';
    context.lineWidth = 1.2;
    context.setLineDash([7, 8]);
    context.beginPath();
    context.arc(0, 0, orbit, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);

    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8 - time * (0.35 + activeStrength * 0.4);
      const dotOrbit = radius - activeStrength * 8 + (index % 2) * 8;
      const x = Math.cos(angle) * dotOrbit;
      const y = Math.sin(angle) * dotOrbit;
      const color = index % 3 === 0 ? '#35d8ff' : index % 3 === 1 ? '#8127ff' : '#0a7cff';
      context.fillStyle = color;
      context.shadowBlur = activeStrength > 0.6 ? 6 : 2;
      context.shadowColor = color;
      context.beginPath();
      context.arc(x, y, index % 3 === 0 ? 2.6 : 1.8, 0, Math.PI * 2);
      context.fill();
    }

    context.rotate(-time * (0.18 + activeStrength * 0.22));
    context.fillStyle = 'rgba(4,13,24,.96)';
    context.strokeStyle = 'rgba(164,104,255,' + (0.42 + activeStrength * 0.45) + ')';
    context.lineWidth = 1.2;
    context.beginPath();
    for (let side = 0; side < 6; side += 1) {
      const angle = -Math.PI / 2 + (side * Math.PI) / 3;
      const x = Math.cos(angle) * radius * 0.58;
      const y = Math.sin(angle) * radius * 0.58;
      if (side === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = '#b785ff';
    context.shadowBlur = 6;
    context.shadowColor = '#8127ff';
    context.beginPath();
    context.arc(0, 0, 4 + activeStrength * 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
    this.drawLabel('CONTEXT ENGINE', point.x, point.y + orbit + 17);
  }

  drawCauseNode(point, time, activeStrength, recovering, compact) {
    const context = this.context;
    const radius = compact ? 23 : 29;
    const color = recovering ? '#3dffb3' : '#ff9f43';
    context.save();
    context.translate(point.x, point.y);
    const pulse = 1 + Math.sin(time * 4) * 0.08 * activeStrength;
    context.scale(pulse, pulse);
    context.rotate(Math.PI / 4);
    context.fillStyle = recovering ? 'rgba(61,255,179,.09)' : 'rgba(255,159,67,.1)';
    context.strokeStyle = color;
    context.globalAlpha = 0.45 + activeStrength * 0.5;
    context.shadowBlur = 8 * activeStrength;
    context.shadowColor = color;
    context.fillRect(-radius * 0.7, -radius * 0.7, radius * 1.4, radius * 1.4);
    context.strokeRect(-radius * 0.7, -radius * 0.7, radius * 1.4, radius * 1.4);
    context.rotate(-Math.PI / 4);
    context.globalAlpha = 1;
    context.fillStyle = color;
    context.font = '600 15px Inter, Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(recovering ? '✓' : '!', 0, 1);
    context.restore();

    if (activeStrength > 0.55) {
      for (let ring = 0; ring < 3; ring += 1) {
        const travel = ((time * 0.55 + ring / 3) % 1) * 25;
        context.save();
        context.strokeStyle = color;
        context.globalAlpha = (1 - travel / 25) * 0.28 * activeStrength;
        context.beginPath();
        context.arc(point.x, point.y, radius + travel, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      }
    }
    this.drawLabel(recovering ? 'CAUSE RECOVERING' : 'LIKELY CAUSE', point.x, point.y + radius + 19);
  }

  drawImpactCard(point, width, height, label, index, time, activeStrength, recovering) {
    const context = this.context;
    const left = point.x - width / 2;
    const top = point.y - height / 2;
    const color = recovering ? '#3dffb3' : index === 1 ? '#ff9f43' : '#35d8ff';
    const highlighted = index === 1 && activeStrength > 0.45;
    context.save();
    context.fillStyle = highlighted ? (recovering ? 'rgba(61,255,179,.1)' : 'rgba(255,159,67,.1)') : 'rgba(4,17,29,.92)';
    context.strokeStyle = color;
    context.globalAlpha = highlighted ? 0.96 : 0.52;
    context.fillRect(left, top, width, height);
    context.strokeRect(left + 0.5, top + 0.5, width - 1, height - 1);
    context.globalAlpha = 1;
    context.fillStyle = 'rgba(198,219,231,.9)';
    context.font = '600 7px Inter, Arial, sans-serif';
    context.letterSpacing = '.7px';
    context.textAlign = 'left';
    context.fillText(label, left + 10, top + 13);

    const barWidth = Math.max(14, width - 20);
    context.fillStyle = 'rgba(93,128,150,.14)';
    context.fillRect(left + 10, top + height - 11, barWidth, 2);
    this.drawHeartbeatTrace(left + 10, top + height - 10, barWidth, time, color, index * 0.23, highlighted ? 1 : 0.72);
    context.restore();
  }

  drawResponseNode(point, time, activeStrength, compact) {
    const context = this.context;
    const radius = compact ? 22 : 27;
    context.save();
    context.translate(point.x, point.y);
    context.strokeStyle = 'rgba(61,255,179,' + (0.3 + activeStrength * 0.65) + ')';
    context.fillStyle = 'rgba(61,255,179,' + (0.035 + activeStrength * 0.08) + ')';
    context.lineWidth = 1.2;
    context.shadowBlur = 8 * activeStrength;
    context.shadowColor = '#3dffb3';
    context.beginPath();
    context.arc(0, 0, radius + Math.sin(time * 3) * 2 * activeStrength, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(-8, 0);
    context.lineTo(-2, 7);
    context.lineTo(10, -8);
    context.strokeStyle = '#3dffb3';
    context.globalAlpha = 0.48 + activeStrength * 0.52;
    context.lineWidth = 2;
    context.stroke();
    context.restore();
    this.drawLabel('GUIDED RESPONSE', point.x, point.y + radius + 17);
  }

  drawUnifiedFlow(time, sequence, compact) {
    const context = this.context;
    const width = this.width;
    const height = this.height;
    const phaseProgress = (sequence * 4) % 1;
    const strength = (phase) => (this.flowPhase === phase ? 0.65 + Math.sin(phaseProgress * Math.PI) * 0.35 : this.flowPhase > phase ? 0.38 : 0.16);
    const sourceStrength = strength(0);
    const contextStrength = strength(1);
    const impactStrength = strength(2);
    const responseStrength = strength(3);
    const recovering = this.flowPhase === 3;
    const colors = ['#35d8ff', '#0a7cff', '#8127ff'];

    const source = compact ? { x: width * 0.5, y: height * 0.3 } : { x: width * 0.37, y: height * 0.5 };
    const engine = compact ? { x: width * 0.5, y: height * 0.45 } : { x: width * 0.52, y: height * 0.5 };
    const cause = compact ? { x: width * 0.5, y: height * 0.6 } : { x: width * 0.675, y: height * 0.5 };
    const response = compact ? { x: width * 0.5, y: height * 0.88 } : { x: width * 0.84, y: height * 0.82 };
    const impactPoints = compact
      ? [
          { x: width * 0.2, y: height * 0.74 },
          { x: width * 0.5, y: height * 0.74 },
          { x: width * 0.8, y: height * 0.74 },
        ]
      : [
          { x: width * 0.84, y: height * 0.33 },
          { x: width * 0.84, y: height * 0.5 },
          { x: width * 0.84, y: height * 0.67 },
        ];

    context.save();
    context.strokeStyle = 'rgba(123,204,255,.055)';
    context.lineWidth = 1;
    if (compact) {
      [0.35, 0.525, 0.665, 0.81].forEach((position) => {
        context.beginPath();
        context.moveTo(22, height * position);
        context.lineTo(width - 22, height * position);
        context.stroke();
      });
    } else {
      [0.405, 0.6, 0.75].forEach((position) => {
        context.beginPath();
        context.moveTo(width * position, 40);
        context.lineTo(width * position, height - 40);
        context.stroke();
      });
    }
    context.restore();

    if (this.flowPhase === 0) {
      const scan = compact ? 45 + phaseProgress * (height * 0.29 - 45) : 32 + phaseProgress * (width * 0.38 - 32);
      const scanGradient = compact
        ? context.createLinearGradient(0, scan - 18, 0, scan + 18)
        : context.createLinearGradient(scan - 18, 0, scan + 18, 0);
      scanGradient.addColorStop(0, 'rgba(53,216,255,0)');
      scanGradient.addColorStop(0.5, 'rgba(53,216,255,.13)');
      scanGradient.addColorStop(1, 'rgba(53,216,255,0)');
      context.fillStyle = scanGradient;
      if (compact) context.fillRect(20, scan - 18, width - 40, 36);
      else context.fillRect(scan - 18, 32, 36, height - 64);
    }

    const sourceOffsets = [-1, 0, 1];
    sourceOffsets.forEach((offset, index) => {
      const start = compact ? { x: source.x + offset * 34, y: source.y } : { x: source.x, y: source.y + offset * 26 };
      const end = compact ? { x: engine.x + offset * 24, y: engine.y } : { x: engine.x, y: engine.y + offset * 21 };
      this.drawColorLine(start, end, colors[index], 0.18 + sourceStrength * 0.32, sourceStrength > 0.6 ? 1.4 : 1);
      for (let packet = 0; packet < 2; packet += 1) {
        this.drawColorPacket([start, end], time * (0.16 + index * 0.018) + index * 0.23 + packet * 0.5, colors[index], 2.2 + sourceStrength, 0.45 + sourceStrength * 0.5);
      }
    });

    this.drawCorrelationEngine(engine, time, contextStrength, compact);

    const correlationOffsets = [-12, 0, 12];
    correlationOffsets.forEach((offset, index) => {
      const start = compact ? { x: engine.x + offset, y: engine.y + (compact ? 43 : 0) } : { x: engine.x + 46, y: engine.y + offset };
      const end = compact ? { x: cause.x + offset * 0.25, y: cause.y - 34 } : { x: cause.x - 39, y: cause.y + offset * 0.25 };
      this.drawColorLine(start, end, colors[index], 0.12 + contextStrength * 0.28, 1, index !== 1);
      this.drawColorPacket([start, end], time * 0.21 + index * 0.31, colors[index], 2.1 + contextStrength * 0.8, 0.35 + contextStrength * 0.55);
    });

    this.drawCauseNode(cause, time, impactStrength, recovering, compact);

    impactPoints.forEach((point, index) => {
      const causeEdge = compact ? { x: cause.x, y: cause.y + 34 } : { x: cause.x + 36, y: cause.y };
      const cardEdge = compact ? { x: point.x, y: point.y - 19 } : { x: point.x - width * 0.07, y: point.y };
      this.drawColorLine(causeEdge, cardEdge, recovering ? '#3dffb3' : '#ff9f43', 0.1 + impactStrength * (index === 1 ? 0.45 : 0.25), index === 1 ? 1.5 : 1);
      this.drawColorPacket([causeEdge, cardEdge], time * 0.17 + index * 0.26, recovering ? '#3dffb3' : '#ff9f43', index === 1 ? 3 : 2, 0.25 + impactStrength * 0.65);
    });

    const cardWidth = compact ? Math.min(94, width * 0.25) : Math.min(132, width * 0.13);
    const cardHeight = compact ? 38 : 40;
    ['SERVICE', 'USERS', 'SLA'].forEach((label, index) => {
      this.drawImpactCard(impactPoints[index], cardWidth, cardHeight, label, index, time, impactStrength, recovering);
    });

    const impactedCenter = impactPoints[1];
    this.drawColorLine(
      compact ? { x: impactedCenter.x, y: impactedCenter.y + cardHeight / 2 } : { x: impactedCenter.x, y: impactedCenter.y + cardHeight / 2 },
      compact ? { x: response.x, y: response.y - 29 } : { x: response.x, y: response.y - 33 },
      '#3dffb3',
      0.12 + responseStrength * 0.42,
      1.2,
      true,
    );
    this.drawResponseNode(response, time, responseStrength, compact);

    const controlA = compact ? { x: width * 0.93, y: height * 0.87 } : { x: width * 0.7, y: height * 0.94 };
    const controlB = compact ? { x: width * 0.93, y: height * 0.36 } : { x: width * 0.46, y: height * 0.94 };
    this.drawBezierLine(response, controlA, controlB, source, '#3dffb3', 0.1 + responseStrength * 0.42, true);
    if (this.flowPhase === 3) {
      for (let packet = 0; packet < 4; packet += 1) {
        this.drawBezierPacket(response, controlA, controlB, source, phaseProgress + packet * 0.24, '#3dffb3', 2.4 + packet * 0.15);
      }
    }

    if (compact) {
      this.drawFlowTag(25, engine.y - 46, '01', 'SIGNALS', this.flowPhase === 0, 'left');
      this.drawFlowTag(25, engine.y - 12, '02', 'CONTEXT', this.flowPhase === 1, 'left');
      this.drawFlowTag(25, cause.y - 12, '03', 'IMPACT', this.flowPhase === 2, 'left');
      this.drawFlowTag(25, response.y, '04', 'RESPONSE', this.flowPhase === 3, 'left');
    } else {
      this.drawFlowTag(width * 0.2, 53, '01', 'SIGNALS', this.flowPhase === 0);
      this.drawFlowTag(engine.x, 53, '02', 'CONTEXT', this.flowPhase === 1);
      this.drawFlowTag(cause.x, 53, '03', 'IMPACT', this.flowPhase === 2);
      this.drawFlowTag(width * 0.84, 53, '04', 'RESPONSE', this.flowPhase === 3);
    }
  }

  transitionProgress(duration = 0.72) {
    const progress = Math.min(1, Math.max(0, (this.elapsedTime - this.transitionStart) / duration));
    return 1 - (1 - progress) ** 3;
  }

  registerSceneRegion(region, time) {
    this.hitRegions.push(region);
    if (this.hoverTarget !== region.id) return;
    const context = this.context;
    const pulse = 0.62 + (Math.sin(time * 4) + 1) * 0.16;
    context.save();
    context.strokeStyle = 'rgba(61,255,179,' + pulse + ')';
    context.fillStyle = 'rgba(61,255,179,.035)';
    context.lineWidth = 1;
    context.setLineDash([4, 5]);
    context.shadowBlur = 8;
    context.shadowColor = '#3dffb3';
    context.fillRect(region.x - 5, region.y - 5, region.width + 10, region.height + 10);
    context.strokeRect(region.x - 4.5, region.y - 4.5, region.width + 9, region.height + 9);
    context.restore();
  }

  drawExpandedMetric(x, y, width, label, time, color, phase) {
    const context = this.context;
    context.save();
    context.fillStyle = 'rgba(3,15,26,.9)';
    context.strokeStyle = 'rgba(99,174,218,.22)';
    context.fillRect(x, y, width, 43);
    context.strokeRect(x + 0.5, y + 0.5, width - 1, 42);
    context.fillStyle = 'rgba(166,194,211,.82)';
    context.font = '600 6px Inter, Arial, sans-serif';
    context.letterSpacing = '.8px';
    context.textAlign = 'left';
    context.fillText(label, x + 9, y + 12);
    this.drawHeartbeatTrace(x + 9, y + 31, width - 18, time, color, phase, 0.72);
    context.restore();
  }

  drawExpandedScene(time) {
    const config = coverageExpansionData[this.scene];
    if (!config) return;
    const context = this.context;
    const width = this.width;
    const height = this.height;
    const compact = width < 700;
    const progress = this.transitionProgress();
    const origin = this.zoomOrigin || { x: width * 0.42, y: height * 0.42, width: 40, height: 40 };
    const target = { x: 18, y: 32, width: width - 36, height: height - 64 };
    const frame = {
      x: origin.x + (target.x - origin.x) * progress,
      y: origin.y + (target.y - origin.y) * progress,
      width: origin.width + (target.width - origin.width) * progress,
      height: origin.height + (target.height - origin.height) * progress,
    };
    const colors = {
      network: '#35d8ff',
      cloud: '#35d8ff',
      applications: '#b785ff',
      industrial: '#ff9f43',
      iot: '#3dffb3',
      ai: '#8127ff',
    };
    const color = colors[this.scene] || '#35d8ff';

    context.save();
    context.fillStyle = 'rgba(3,14,24,' + (0.2 + progress * 0.45) + ')';
    context.strokeStyle = 'rgba(53,216,255,' + (0.16 + progress * 0.25) + ')';
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
    context.strokeRect(frame.x + 0.5, frame.y + 0.5, frame.width - 1, frame.height - 1);
    context.restore();
    if (progress < 0.14) return;

    context.save();
    context.globalAlpha = Math.min(1, (progress - 0.14) / 0.5);
    context.translate(0, (1 - progress) * 26);
    this.drawFlowTag(28, 78, String(this.selectedItem + 1).padStart(2, '0'), config.title, true, 'left');

    const panelWidth = compact ? Math.min(300, width * 0.7) : Math.min(164, Math.max(118, width * 0.145));
    const panelHeight = compact ? 52 : 62;
    const panels = [];
    if (compact) {
      const startY = height * 0.11;
      const available = Math.max(0, height * 0.63 - panelHeight * config.items.length);
      const gap = available / Math.max(1, config.items.length - 1);
      config.items.forEach((item, index) => {
        panels.push({ x: (width - panelWidth) / 2, y: startY + index * (panelHeight + gap), item, index });
      });
    } else {
      const margin = width * 0.055;
      const gap = Math.max(12, (width - margin * 2 - panelWidth * config.items.length) / (config.items.length - 1));
      config.items.forEach((item, index) => {
        panels.push({ x: margin + index * (panelWidth + gap), y: height * 0.29, item, index });
      });
    }

    panels.forEach((panel, index) => {
      if (index > 0) {
        const previous = panels[index - 1];
        const start = compact
          ? { x: previous.x + panelWidth / 2, y: previous.y + panelHeight }
          : { x: previous.x + panelWidth, y: previous.y + panelHeight / 2 };
        const end = compact
          ? { x: panel.x + panelWidth / 2, y: panel.y }
          : { x: panel.x, y: panel.y + panelHeight / 2 };
        this.drawDownFlow(start, end, time + index * 0.24, color, index === this.selectedItem % config.items.length ? 1 : 0.72);
      }
      this.drawDevicePanel(
        panel.x,
        panel.y,
        panelWidth,
        panelHeight,
        panel.item[0],
        panel.item[1],
        time + index * 0.17,
        true,
        index === this.selectedItem % config.items.length,
      );
    });

    const collector = compact ? { x: width * 0.5, y: height - 108 } : { x: width * 0.5, y: height * 0.68 };
    panels.forEach((panel, index) => {
      if (compact && index !== this.selectedItem % panels.length && index !== panels.length - 1) return;
      const start = compact
        ? { x: panel.x + panelWidth / 2, y: panel.y + panelHeight }
        : { x: panel.x + panelWidth / 2, y: panel.y + panelHeight };
      this.drawColorLine(start, collector, '#8127ff', compact ? 0.16 : 0.12, 1, true);
      this.drawColorPacket([start, collector], time * 0.14 + index * 0.18, '#b785ff', 1.8, 0.65);
    });
    this.drawNode(collector.x, collector.y, compact ? 18 : 22, 'CLOUDMON CONTEXT', time * 2.1);

    const metricGap = compact ? 7 : 12;
    const metricWidth = compact ? (width - 36 - metricGap * 2) / 3 : Math.min(180, (width * 0.62 - metricGap * 2) / 3);
    const metricsWidth = metricWidth * 3 + metricGap * 2;
    const metricStart = (width - metricsWidth) / 2;
    const metricY = height - 61;
    config.metrics.forEach((metric, index) => {
      this.drawExpandedMetric(metricStart + index * (metricWidth + metricGap), metricY, metricWidth, metric, time, color, index * 0.21);
    });
    context.restore();
  }

  drawDownFlow(start, end, time, color = '#35d8ff', strength = 1) {
    this.drawColorLine(start, end, color, 0.2 + strength * 0.35, 1.3);
    for (let packet = 0; packet < 3; packet += 1) {
      this.drawColorPacket([start, end], time * 0.22 + packet / 3, color, 2.2 + strength * 0.5, 0.45 + strength * 0.45);
    }
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const context = this.context;
    context.save();
    context.translate(end.x, end.y);
    context.rotate(angle);
    context.fillStyle = color;
    context.globalAlpha = 0.45 + strength * 0.4;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(-8, -4);
    context.lineTo(-8, 4);
    context.closePath();
    context.fill();
    context.restore();
  }

  drawTelemetryPath(start, end, time, offset = 0) {
    this.drawColorLine(start, end, '#8127ff', 0.28, 1, true);
    this.drawColorPacket([start, end], time * 0.16 + offset, '#b785ff', 2.2, 0.78);
  }

  drawDevicePanel(x, y, width, height, label, type, time, active = false, hovered = false) {
    const context = this.context;
    const color = hovered ? '#3dffb3' : active ? '#35d8ff' : '#4f7891';
    const protocols = {
      router: 'SNMP',
      firewall: 'SNMP',
      switch: 'SNMP',
      server: 'AGENT / WMI',
      storage: 'SNMP / API',
      management: 'AGENT',
      probe: 'COLLECTOR',
    };
    context.save();
    context.fillStyle = active || hovered ? 'rgba(7,31,48,.96)' : 'rgba(4,17,29,.94)';
    context.strokeStyle = color;
    context.globalAlpha = hovered ? 1 : active ? 0.9 : 0.62;
    context.shadowBlur = hovered ? 10 : active ? 4 : 0;
    context.shadowColor = color;
    context.fillRect(x, y, width, height);
    context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    context.globalAlpha = 1;
    context.shadowBlur = 0;
    context.fillStyle = active || hovered ? '#edf8ff' : 'rgba(194,215,228,.88)';
    context.font = '600 8px Inter, Arial, sans-serif';
    context.letterSpacing = '.8px';
    context.textAlign = 'left';
    context.fillText(label, x + 11, y + 14);
    context.textAlign = 'right';
    context.fillStyle = hovered ? '#3dffb3' : 'rgba(147,180,199,.88)';
    context.font = '600 6px Inter, Arial, sans-serif';
    context.fillText(protocols[type] || '', x + width - 10, y + 13);

    const iconLeft = x + 12;
    const iconTop = y + 23;
    const contentLeft = x + Math.min(48, width * 0.28);
    const contentWidth = Math.max(24, width - (contentLeft - x) - 12);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = active || hovered ? 0.92 : 0.58;
    context.lineWidth = 1;

    if (type === 'router') {
      const points = [
        { x: iconLeft + 3, y: iconTop + 9 },
        { x: iconLeft + 16, y: iconTop + 2 },
        { x: iconLeft + 16, y: iconTop + 16 },
        { x: iconLeft + 29, y: iconTop + 9 },
      ];
      this.drawColorLine(points[0], points[1], color, 0.55);
      this.drawColorLine(points[0], points[2], color, 0.55);
      this.drawColorLine(points[1], points[3], color, 0.55);
      this.drawColorLine(points[2], points[3], color, 0.55);
      points.forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
        context.fill();
      });
    } else if (type === 'firewall') {
      context.beginPath();
      context.moveTo(iconLeft + 16, iconTop);
      context.lineTo(iconLeft + 29, iconTop + 5);
      context.lineTo(iconLeft + 26, iconTop + 17);
      context.lineTo(iconLeft + 16, iconTop + 23);
      context.lineTo(iconLeft + 6, iconTop + 17);
      context.lineTo(iconLeft + 3, iconTop + 5);
      context.closePath();
      context.stroke();
      context.beginPath();
      context.moveTo(iconLeft + 10, iconTop + 11);
      context.lineTo(iconLeft + 15, iconTop + 16);
      context.lineTo(iconLeft + 23, iconTop + 7);
      context.stroke();
    } else if (type === 'switch') {
      for (let port = 0; port < 12; port += 1) {
        const column = port % 6;
        const row = Math.floor(port / 6);
        const portX = iconLeft + column * 6;
        const portY = iconTop + row * 8;
        context.strokeRect(portX + 0.5, portY + 0.5, 4, 4);
        if ((port + Math.floor(time * 3)) % 5 === 0) context.fillRect(portX + 1, portY + 1, 3, 3);
      }
    } else if (type === 'server') {
      for (let slot = 0; slot < 4; slot += 1) {
        const slotY = iconTop + slot * 6;
        context.strokeRect(iconLeft + 0.5, slotY + 0.5, 31, 4);
        context.fillRect(iconLeft + 3, slotY + 2, 2, 2);
      }
    } else if (type === 'storage') {
      for (let disk = 0; disk < 3; disk += 1) {
        context.beginPath();
        context.arc(iconLeft + 6 + disk * 11, iconTop + 10, 4, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.arc(iconLeft + 6 + disk * 11, iconTop + 10, 1, 0, Math.PI * 2);
        context.fill();
      }
    } else if (type === 'management') {
      context.strokeRect(iconLeft + 0.5, iconTop + 0.5, 32, 21);
      context.moveTo(iconLeft + 5, iconTop + 6);
      context.lineTo(iconLeft + 11, iconTop + 10);
      context.lineTo(iconLeft + 5, iconTop + 14);
      context.stroke();
      context.fillRect(iconLeft + 15, iconTop + 13, 10, 1);
    } else if (type === 'probe') {
      context.beginPath();
      context.arc(iconLeft + 16, iconTop + 11, 3, 0, Math.PI * 2);
      context.fill();
      [8, 14].forEach((radius) => {
        context.beginPath();
        context.arc(iconLeft + 16, iconTop + 11, radius, -Math.PI * 0.72, Math.PI * 0.72);
        context.stroke();
      });
    }

    this.drawHeartbeatTrace(
      contentLeft,
      y + height - 14,
      contentWidth,
      time,
      hovered ? '#3dffb3' : active ? '#35d8ff' : '#527c95',
      x * 0.003 + y * 0.002,
      hovered ? 1 : active ? 0.9 : 0.65,
    );
    context.beginPath();
    context.arc(x + width - 11, y + height - 10, 2.4, 0, Math.PI * 2);
    context.fillStyle = '#3dffb3';
    context.shadowBlur = 4;
    context.shadowColor = '#3dffb3';
    context.fill();
    context.restore();
  }

  drawRackDetail(time) {
    const context = this.context;
    const width = this.width;
    const height = this.height;
    const compact = width < 700;
    const progress = this.transitionProgress();
    const target = { x: width * 0.08, y: height * 0.09, width: width * 0.84, height: height * 0.82 };
    const origin = this.zoomOrigin || target;
    const frame = {
      x: origin.x + (target.x - origin.x) * progress,
      y: origin.y + (target.y - origin.y) * progress,
      width: origin.width + (target.width - origin.width) * progress,
      height: origin.height + (target.height - origin.height) * progress,
    };

    context.save();
    context.strokeStyle = 'rgba(53,216,255,' + (0.18 + progress * 0.22) + ')';
    context.fillStyle = 'rgba(3,14,24,' + (0.28 + progress * 0.42) + ')';
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
    context.strokeRect(frame.x + 0.5, frame.y + 0.5, frame.width - 1, frame.height - 1);
    context.restore();

    if (progress < 0.18) return;
    context.save();
    context.globalAlpha = Math.min(1, (progress - 0.18) / 0.55);
    const centerX = compact ? width * 0.43 : width * 0.42;
    const panelWidth = compact ? width * 0.58 : Math.min(250, width * 0.3);
    const panelHeight = compact ? 54 : 58;
    const routerY = height * 0.2;
    const firewallY = height * 0.39;
    const switchY = height * 0.58;
    const probePoint = { x: width * 0.79, y: height * 0.4 };
    const controllerPoint = { x: width * 0.79, y: height * 0.69 };
    const panelX = centerX - panelWidth / 2;
    const routerCenter = { x: centerX, y: routerY + panelHeight / 2 };
    const firewallCenter = { x: centerX, y: firewallY + panelHeight / 2 };
    const switchCenter = { x: centerX, y: switchY + panelHeight / 2 };

    this.drawFlowTag(target.x + 18, target.y + 38, String(this.selectedRack + 1).padStart(2, '0'), 'RACK NETWORK PATH', true, 'left');
    this.drawLabel('UPLINK', centerX, routerY - 24);
    this.drawDownFlow({ x: centerX, y: routerY - 17 }, { x: centerX, y: routerY - 2 }, time, '#35d8ff', 0.8);
    this.drawDevicePanel(panelX, routerY, panelWidth, panelHeight, 'EDGE ROUTER', 'router', time, true);
    this.drawDownFlow({ x: centerX, y: routerY + panelHeight }, { x: centerX, y: firewallY }, time, '#35d8ff', 0.9);
    this.drawDevicePanel(panelX, firewallY, panelWidth, panelHeight, 'FIREWALL', 'firewall', time, true);
    this.drawDownFlow({ x: centerX, y: firewallY + panelHeight }, { x: centerX, y: switchY }, time, '#35d8ff', 1);

    const switchRegion = {
      id: 'core-switch',
      type: 'switch',
      index: 0,
      x: panelX,
      y: switchY,
      width: panelWidth,
      height: panelHeight,
    };
    const switchHovered = this.hoverTarget === switchRegion.id;
    this.hitRegions.push(switchRegion);
    this.drawDevicePanel(panelX, switchY, panelWidth, panelHeight, 'CORE / TOP-OF-RACK SWITCH', 'switch', time, true, switchHovered);

    this.drawNode(probePoint.x, probePoint.y, compact ? 17 : 21, 'CLOUDMON PROBE', time * 2.1);
    this.drawNode(controllerPoint.x, controllerPoint.y, compact ? 15 : 19, 'CONTROLLER', time * 1.8);
    [routerCenter, firewallCenter, switchCenter].forEach((device, index) => this.drawTelemetryPath(device, probePoint, time, index * 0.28));
    this.drawTelemetryPath(probePoint, controllerPoint, time, 0.15);

    const fanY = height * 0.78;
    this.drawColorLine({ x: switchCenter.x, y: switchY + panelHeight }, { x: switchCenter.x, y: fanY }, '#3dffb3', 0.28, 1, true);
    [-1, 0, 1].forEach((offset) => {
      const endpoint = { x: switchCenter.x + offset * (compact ? 34 : 48), y: fanY + 18 };
      this.drawColorLine({ x: switchCenter.x, y: fanY }, endpoint, '#3dffb3', 0.22, 1, true);
      this.drawColorPacket([{ x: switchCenter.x, y: fanY }, endpoint], time * 0.15 + offset * 0.2, '#3dffb3', 1.8, 0.7);
      context.beginPath();
      context.arc(endpoint.x, endpoint.y, 3, 0, Math.PI * 2);
      context.fillStyle = '#3dffb3';
      context.globalAlpha = 0.7;
      context.fill();
    });
    this.drawLabel(switchHovered ? 'SELECT TO EXPAND' : 'CONNECTED EQUIPMENT', switchCenter.x, fanY + 42);
    context.restore();
  }

  drawSwitchDetail(time) {
    const context = this.context;
    const width = this.width;
    const height = this.height;
    const compact = width < 700;
    const progress = this.transitionProgress();
    context.save();
    context.globalAlpha = 0.24 + progress * 0.76;
    context.translate(0, (1 - progress) * 28);

    const switchWidth = compact ? width * 0.78 : Math.min(410, width * 0.46);
    const switchHeight = compact ? 60 : 68;
    const switchX = width / 2 - switchWidth / 2;
    const switchY = compact ? height * 0.11 : height * 0.13;
    this.drawFlowTag(28, 78, String(this.selectedRack + 1).padStart(2, '0'), 'SWITCH CONNECTIONS', true, 'left');
    this.drawDevicePanel(switchX, switchY, switchWidth, switchHeight, 'CORE / TOP-OF-RACK SWITCH', 'switch', time, true);

    const switchBottom = { x: width / 2, y: switchY + switchHeight };
    const busY = compact ? height * 0.32 : height * 0.35;
    this.drawDownFlow(switchBottom, { x: width / 2, y: busY }, time, '#35d8ff', 1);

    const deviceDefinitions = [
      { label: 'COMPUTE SERVER 01', type: 'server' },
      { label: 'COMPUTE SERVER 02', type: 'server' },
      { label: 'STORAGE ARRAY', type: 'storage' },
      { label: 'MANAGEMENT HOST', type: 'management' },
    ];
    const deviceWidth = compact ? width * 0.39 : Math.min(190, width * 0.2);
    const deviceHeight = compact ? 62 : 68;
    const positions = compact
      ? [
          { x: width * 0.07, y: height * 0.4 },
          { x: width * 0.54, y: height * 0.4 },
          { x: width * 0.07, y: height * 0.62 },
          { x: width * 0.54, y: height * 0.62 },
        ]
      : [
          { x: width * 0.05, y: height * 0.47 },
          { x: width * 0.28, y: height * 0.47 },
          { x: width * 0.51, y: height * 0.47 },
          { x: width * 0.74, y: height * 0.47 },
        ];
    const probePoint = compact ? { x: width * 0.5, y: height * 0.87 } : { x: width * 0.5, y: height * 0.79 };

    positions.forEach((position, index) => {
      const center = { x: position.x + deviceWidth / 2, y: position.y + deviceHeight / 2 };
      const branch = compact
        ? [
            { x: width / 2, y: busY },
            { x: center.x, y: busY },
            { x: center.x, y: position.y },
          ]
        : [
            { x: width / 2, y: busY },
            { x: center.x, y: busY },
            { x: center.x, y: position.y },
          ];
      this.drawPolyline(branch, 0.35);
      this.drawColorPacket(branch, time * 0.18 + index * 0.21, '#35d8ff', 2.5, 0.85);
      const region = {
        id: 'device-' + index,
        type: 'device',
        index,
        x: position.x,
        y: position.y,
        width: deviceWidth,
        height: deviceHeight,
      };
      const hovered = this.hoverTarget === region.id;
      if (progress > 0.55) this.hitRegions.push(region);
      this.drawDevicePanel(position.x, position.y, deviceWidth, deviceHeight, deviceDefinitions[index].label, deviceDefinitions[index].type, time, index < 2, hovered);
      this.drawTelemetryPath(center, probePoint, time, index * 0.21);
    });

    this.drawNode(probePoint.x, probePoint.y, compact ? 19 : 23, 'CLOUDMON PROBE', time * 2.2);
    this.drawLabel('SELECT ANY CONNECTED DEVICE', width / 2, height - 42);
    context.restore();
  }

  drawDeviceDetail(time) {
    const context = this.context;
    const width = this.width;
    const height = this.height;
    const compact = width < 700;
    const progress = this.transitionProgress();
    const definitions = [
      { label: 'COMPUTE SERVER 01', type: 'server', modules: ['CPU', 'MEMORY', 'DISK', 'NETWORK'] },
      { label: 'COMPUTE SERVER 02', type: 'server', modules: ['CPU', 'MEMORY', 'DISK', 'NETWORK'] },
      { label: 'STORAGE ARRAY', type: 'storage', modules: ['CAPACITY', 'IOPS', 'LATENCY', 'PORTS'] },
      { label: 'MANAGEMENT HOST', type: 'management', modules: ['CPU', 'MEMORY', 'VIRTUAL HOSTS', 'SERVICES'] },
    ];
    const device = definitions[this.selectedDevice] || definitions[0];
    context.save();
    context.globalAlpha = 0.2 + progress * 0.8;
    context.translate(0, (1 - progress) * 28);
    this.drawFlowTag(28, 78, String(this.selectedRack + 1).padStart(2, '0'), device.label, true, 'left');

    const chassis = compact
      ? { x: width * 0.08, y: height * 0.14, width: width * 0.84, height: height * 0.36 }
      : { x: width * 0.08, y: height * 0.19, width: width * 0.5, height: height * 0.52 };
    this.drawDevicePanel(chassis.x, chassis.y, chassis.width, chassis.height, device.label, device.type, time, true);

    const columns = compact ? 2 : 2;
    const gap = compact ? 12 : 16;
    const moduleWidth = (chassis.width - 32 - gap) / columns;
    const moduleHeight = compact ? 54 : 64;
    const moduleTop = chassis.y + (compact ? 75 : 88);
    device.modules.forEach((module, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = chassis.x + 16 + column * (moduleWidth + gap);
      const y = moduleTop + row * (moduleHeight + gap);
      context.fillStyle = 'rgba(4,14,24,.88)';
      context.strokeStyle = 'rgba(53,216,255,.2)';
      context.fillRect(x, y, moduleWidth, moduleHeight);
      context.strokeRect(x + 0.5, y + 0.5, moduleWidth - 1, moduleHeight - 1);
      context.fillStyle = 'rgba(194,216,229,.9)';
      context.font = '600 7px Inter, Arial, sans-serif';
      context.letterSpacing = '.75px';
      context.textAlign = 'left';
      context.fillText(module, x + 9, y + 14);
      this.drawHeartbeatTrace(
        x + 9,
        y + moduleHeight - 12,
        moduleWidth - 18,
        time,
        index === 2 ? '#8127ff' : '#35d8ff',
        index * 0.19,
        0.7,
      );
    });

    const agent = compact ? { x: width * 0.29, y: height * 0.64 } : { x: width * 0.7, y: height * 0.36 };
    const probe = compact ? { x: width * 0.71, y: height * 0.64 } : { x: width * 0.86, y: height * 0.52 };
    const controller = compact ? { x: width * 0.5, y: height * 0.84 } : { x: width * 0.7, y: height * 0.75 };
    this.drawNode(agent.x, agent.y, compact ? 19 : 23, this.selectedDevice < 2 || this.selectedDevice === 3 ? 'CLOUDMON AGENT' : 'API / SNMP', time * 2.1);
    this.drawNode(probe.x, probe.y, compact ? 19 : 23, 'CLOUDMON PROBE', time * 2.3);
    this.drawNode(controller.x, controller.y, compact ? 18 : 22, 'CONTROLLER', time * 1.9);
    const chassisOutput = compact ? { x: width * 0.5, y: chassis.y + chassis.height } : { x: chassis.x + chassis.width, y: chassis.y + chassis.height * 0.5 };
    this.drawTelemetryPath(chassisOutput, agent, time, 0.1);
    this.drawTelemetryPath(agent, probe, time, 0.42);
    this.drawTelemetryPath(probe, controller, time, 0.76);
    context.restore();
  }

  drawInfrastructureDetail(time) {
    if (this.detailMode === 'rack') this.drawRackDetail(time);
    else if (this.detailMode === 'switch') this.drawSwitchDetail(time);
    else this.drawDeviceDetail(time);
  }

  drawInfrastructure(time) {
    const width = this.width;
    const height = this.height;
    const rackY = height * 0.3;
    const rackHeight = Math.min(132, height * 0.43);
    const rackWidth = Math.min(72, width * 0.105);
    const rackXs = [width * 0.09, width * 0.25, width * 0.41];
    const core = { x: width * 0.72, y: height * 0.5 };
    rackXs.forEach((x, rackIndex) => {
      const region = { id: 'rack-' + rackIndex, type: 'rack', index: rackIndex, x, y: rackY, width: rackWidth, height: rackHeight };
      const hovered = this.hoverTarget === region.id;
      this.hitRegions.push(region);
      this.context.save();
      if (hovered) {
        this.context.shadowBlur = 9;
        this.context.shadowColor = '#35d8ff';
      }
      this.context.fillStyle = 'rgba(4,17,29,.9)';
      this.context.strokeStyle = hovered ? 'rgba(53,216,255,.86)' : 'rgba(53,216,255,.28)';
      this.context.fillRect(x, rackY, rackWidth, rackHeight);
      this.context.strokeRect(x + 0.5, rackY + 0.5, rackWidth - 1, rackHeight - 1);
      for (let unit = 0; unit < 5; unit += 1) {
        const unitY = rackY + 9 + unit * ((rackHeight - 18) / 5);
        this.context.strokeStyle = 'rgba(53,216,255,.16)';
        this.context.strokeRect(x + 7.5, unitY + 0.5, rackWidth - 15, 13);
        const glow = 0.28 + (Math.sin(time * 3 + rackIndex + unit * 0.8) + 1) * 0.26;
        this.context.fillStyle = 'rgba(' + this.accentRgb + ',' + glow + ')';
        this.context.fillRect(x + 12, unitY + 5, 3, 3);
        this.context.fillStyle = 'rgba(53,216,255,.12)';
        this.context.fillRect(x + rackWidth - 29, unitY + 5, 16, 2);
      }
      this.context.restore();
      const start = { x: x + rackWidth, y: rackY + rackHeight / 2 };
      this.drawLine(start, core, 0.24);
      this.drawPacket([start, core], (time * 0.22 + rackIndex * 0.27) % 1);
      this.drawLabel('RACK ' + String(rackIndex + 1).padStart(2, '0'), x + rackWidth / 2, rackY - 9);
      if (hovered) this.drawLabel('SELECT', x + rackWidth / 2, rackY + rackHeight + 15);
    });
    this.drawNode(core.x, core.y, 22, 'COLLECTOR', time * 2);
    this.drawStepFocus(core.x, core.y, time);
    if (this.step === 2) {
      const action = { x: width * 0.89, y: height * 0.28 };
      this.drawLine(core, action, 0.5, true);
      this.drawNode(action.x, action.y, 13, 'ACTION', time * 2.5);
      this.drawPacket([core, action], (time * 0.34) % 1);
    }
  }

  drawNetwork(time) {
    const width = this.width;
    const height = this.height;
    const nodes = [
      { x: width * 0.1, y: height * 0.27, label: 'SITE 01' },
      { x: width * 0.12, y: height * 0.72, label: 'SITE 02' },
      { x: width * 0.34, y: height * 0.48, label: 'EDGE' },
      { x: width * 0.56, y: height * 0.25, label: 'WAN A' },
      { x: width * 0.56, y: height * 0.72, label: 'WAN B' },
      { x: width * 0.8, y: height * 0.48, label: 'CORE' },
      { x: width * 0.92, y: height * 0.25, label: 'CLOUD' },
    ];
    const edges = [[0,2],[1,2],[2,3],[2,4],[3,5],[4,5],[5,6]];
    edges.forEach((edge, index) => {
      const a = nodes[edge[0]];
      const b = nodes[edge[1]];
      this.drawLine(a, b, index === (this.step + 2) % edges.length ? 0.65 : 0.22);
      this.drawPacket([a, b], (time * 0.2 + index * 0.14) % 1, 2.2);
    });
    nodes.forEach((node, index) => {
      const radius = index === 5 ? 17 : 12;
      this.drawNode(node.x, node.y, radius, node.label, time * 2 + index);
      this.registerSceneRegion(
        {
          id: 'network-' + index,
          type: 'scene-item',
          index,
          detailIndex: [0, 0, 1, 2, 2, 3, 4][index],
          x: node.x - radius,
          y: node.y - radius,
          width: radius * 2,
          height: radius * 2,
        },
        time,
      );
    });
    this.drawStepFocus(nodes[5].x, nodes[5].y, time);
  }

  drawCloudShape(x, y, width, height, label) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(x + width * 0.2, y + height * 0.78);
    context.bezierCurveTo(x - 2, y + height * 0.75, x, y + height * 0.45, x + width * 0.22, y + height * 0.42);
    context.bezierCurveTo(x + width * 0.28, y + 3, x + width * 0.66, y - 2, x + width * 0.71, y + height * 0.35);
    context.bezierCurveTo(x + width, y + height * 0.34, x + width + 3, y + height * 0.78, x + width * 0.78, y + height * 0.8);
    context.closePath();
    context.fillStyle = 'rgba(4,17,29,.93)';
    context.strokeStyle = 'rgba(' + this.accentRgb + ',.48)';
    context.fill();
    context.stroke();
    this.drawLabel(label, x + width / 2, y + height + 12);
    context.restore();
  }

  drawCloud(time) {
    const width = this.width;
    const height = this.height;
    const source = { x: width * 0.14, y: height * 0.5 };
    const cloudA = { x: width * 0.48, y: height * 0.25 };
    const cloudB = { x: width * 0.73, y: height * 0.58 };
    this.drawBox(source.x - 42, source.y - 36, 84, 72, 'ON-PREM', true);
    this.drawCloudShape(cloudA.x - 49, cloudA.y - 28, 98, 56, 'REGION A');
    this.drawCloudShape(cloudB.x - 49, cloudB.y - 28, 98, 56, 'REGION B');
    [
      { x: source.x - 42, y: source.y - 36, width: 84, height: 72 },
      { x: cloudA.x - 49, y: cloudA.y - 28, width: 98, height: 56 },
      { x: cloudB.x - 49, y: cloudB.y - 28, width: 98, height: 56 },
    ].forEach((region, index) =>
      this.registerSceneRegion({ ...region, id: 'cloud-' + index, type: 'scene-item', index, detailIndex: [0, 2, 2][index] }, time),
    );
    const paths = [[source,cloudA],[source,cloudB],[cloudA,cloudB]];
    paths.forEach((path, index) => {
      this.drawLine(path[0], path[1], index === this.step ? 0.62 : 0.25, index === 2);
      this.drawPacket(path, (time * 0.22 + index * 0.31) % 1);
      this.drawPacket([path[1], path[0]], (time * 0.18 + index * 0.21) % 1, 2);
    });
    this.drawStepFocus(cloudB.x, cloudB.y, time);
  }

  drawApplications(time) {
    const width = this.width;
    const height = this.height;
    const items = [
      { x: width * 0.07, y: height * 0.42, w: 76, h: 55, label: 'USERS' },
      { x: width * 0.27, y: height * 0.22, w: 84, h: 55, label: 'GATEWAY' },
      { x: width * 0.27, y: height * 0.63, w: 84, h: 55, label: 'WORKER' },
      { x: width * 0.53, y: height * 0.42, w: 92, h: 62, label: 'SERVICE' },
      { x: width * 0.78, y: height * 0.42, w: 80, h: 62, label: 'DATA' },
    ];
    const centers = items.map((item) => ({ x:item.x + item.w / 2, y:item.y + item.h / 2 }));
    const edges = [[0,1],[0,2],[1,3],[2,3],[3,4]];
    edges.forEach((edge, index) => {
      const path = [centers[edge[0]], centers[edge[1]]];
      this.drawLine(path[0], path[1], index === this.step + 2 ? 0.64 : 0.24);
      this.drawPacket(path, (time * 0.27 + index * 0.19) % 1, 2.2);
    });
    items.forEach((item, index) => {
      this.drawBox(item.x, item.y, item.w, item.h, item.label, index === 3 || (this.step === 2 && index === 4));
      this.registerSceneRegion(
        {
          id: 'applications-' + index,
          type: 'scene-item',
          index,
          detailIndex: [0, 1, 3, 2, 4][index],
          x: item.x,
          y: item.y,
          width: item.w,
          height: item.h,
        },
        time,
      );
    });
    this.drawStepFocus(centers[3].x, centers[3].y, time);
  }

  drawGear(x, y, radius, teeth, angle, label) {
    const context = this.context;
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.strokeStyle = 'rgba(' + this.accentRgb + ',.5)';
    context.lineWidth = 1;
    for (let tooth = 0; tooth < teeth; tooth += 1) {
      const rotation = (Math.PI * 2 * tooth) / teeth;
      context.beginPath();
      context.moveTo(Math.cos(rotation) * (radius - 2), Math.sin(rotation) * (radius - 2));
      context.lineTo(Math.cos(rotation) * (radius + 5), Math.sin(rotation) * (radius + 5));
      context.stroke();
    }
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(0, 0, radius * 0.34, 0, Math.PI * 2);
    context.stroke();
    context.restore();
    this.drawLabel(label, x, y + radius + 18);
  }

  drawIndustrial(time) {
    const width = this.width;
    const height = this.height;
    const plc = { x:width * 0.1, y:height * 0.28, w:92, h:72 };
    const controller = { x:width * 0.72, y:height * 0.28, w:102, h:72 };
    this.drawBox(plc.x, plc.y, plc.w, plc.h, 'PLC');
    this.drawBox(controller.x, controller.y, controller.w, controller.h, 'CONTROLLER', this.step > 0);
    const gearA = { x:width * 0.42, y:height * 0.58 };
    const gearB = { x:width * 0.57, y:height * 0.48 };
    this.drawGear(gearA.x, gearA.y, 34, 12, time * 0.28, 'MACHINE');
    this.drawGear(gearB.x, gearB.y, 23, 10, -time * 0.38, 'DRIVE');
    [
      { x: plc.x, y: plc.y, width: plc.w, height: plc.h },
      { x: gearA.x - 38, y: gearA.y - 38, width: 76, height: 76 },
      { x: gearB.x - 27, y: gearB.y - 27, width: 54, height: 54 },
      { x: controller.x, y: controller.y, width: controller.w, height: controller.h },
    ].forEach((region, index) =>
      this.registerSceneRegion({ ...region, id: 'industrial-' + index, type: 'scene-item', index, detailIndex: [1, 2, 3, 4][index] }, time),
    );
    const plcCenter = { x:plc.x + plc.w, y:plc.y + plc.h / 2 };
    const controlCenter = { x:controller.x, y:controller.y + controller.h / 2 };
    const path = [plcCenter, gearA, gearB, controlCenter];
    this.drawPolyline(path, 0.3);
    this.drawPacket(path, (time * 0.16) % 1);
    this.drawStepFocus(gearB.x, gearB.y, time);
  }

  drawIot(time) {
    const width = this.width;
    const height = this.height;
    const gateway = { x:width * 0.5, y:height * 0.5 };
    const radiusX = Math.min(width * 0.34, 270);
    const radiusY = Math.min(height * 0.3, 110);
    const devices = Array.from({ length: 10 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 10 - Math.PI / 2;
      return {
        x:gateway.x + Math.cos(angle) * radiusX,
        y:gateway.y + Math.sin(angle) * radiusY,
        label:'D' + String(index + 1).padStart(2, '0'),
      };
    });
    devices.forEach((device, index) => {
      this.drawLine(device, gateway, index % 3 === this.step ? 0.48 : 0.17, true);
      this.drawNode(device.x, device.y, 8, device.label, time * 2 + index);
      this.drawPacket([device, gateway], (time * 0.12 + index * 0.1) % 1, 1.9);
      this.registerSceneRegion(
        { id: 'iot-device-' + index, type: 'scene-item', index, detailIndex: 0, x: device.x - 9, y: device.y - 9, width: 18, height: 18 },
        time,
      );
    });
    this.drawNode(gateway.x, gateway.y, 24, 'EDGE GATEWAY', time * 2.4);
    this.registerSceneRegion(
      { id: 'iot-gateway', type: 'scene-item', index: devices.length, detailIndex: 1, x: gateway.x - 24, y: gateway.y - 24, width: 48, height: 48 },
      time,
    );
    this.drawStepFocus(gateway.x, gateway.y, time);
  }

  drawAi(time) {
    const width = this.width;
    const height = this.height;
    const cardWidth = Math.min(120, width * 0.16);
    const cardHeight = Math.min(112, height * 0.38);
    const xs = [width * 0.1, width * 0.31, width * 0.52];
    const y = height * 0.34;
    const memory = { x:width * 0.8, y:height * 0.34, w:96, h:cardHeight };
    xs.forEach((x, cardIndex) => {
      this.drawBox(x, y, cardWidth, cardHeight, 'GPU ' + String(cardIndex + 1).padStart(2, '0'), cardIndex === this.step);
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 3; column += 1) {
          const cellX = x + 13 + column * ((cardWidth - 30) / 3);
          const cellY = y + 19 + row * ((cardHeight - 31) / 3);
          const glow = 0.1 + (Math.sin(time * 3 + cardIndex + row + column) + 1) * 0.12;
          this.context.fillStyle = 'rgba(' + this.accentRgb + ',' + glow + ')';
          this.context.fillRect(cellX, cellY, 12, 10);
        }
      }
      const start = { x:x + cardWidth, y:y + cardHeight / 2 };
      const end = { x:memory.x, y:memory.y + memory.h / 2 };
      this.drawLine(start, end, 0.23);
      this.drawPacket([start,end], (time * 0.2 + cardIndex * 0.26) % 1);
      this.registerSceneRegion(
        { id: 'ai-gpu-' + cardIndex, type: 'scene-item', index: cardIndex, detailIndex: 1, x, y, width: cardWidth, height: cardHeight },
        time,
      );
    });
    this.drawBox(memory.x, memory.y, memory.w, memory.h, 'MEMORY BUS', this.step === 2);
    this.registerSceneRegion(
      { id: 'ai-memory', type: 'scene-item', index: xs.length, detailIndex: 3, x: memory.x, y: memory.y, width: memory.w, height: memory.h },
      time,
    );
    this.drawStepFocus(memory.x + memory.w / 2, memory.y + memory.h / 2, time);
  }
}

const coverageWizard = $('#coverage-wizard');
const coverageWizardCanvas = $('#coverage-wizard-canvas');
const coverageVisualizer = new CoverageWizardVisualizer(coverageWizardCanvas);
const coverageCards = $$('.coverage-card[data-coverage-key]');
const wizardTitle = $('[data-wizard-title]', coverageWizard);
const wizardSummary = $('[data-wizard-summary]', coverageWizard);
const wizardNumber = $('[data-wizard-number]', coverageWizard);
const wizardIcon = $('[data-wizard-icon]', coverageWizard);
const wizardStepLabel = $('[data-wizard-step-label]', coverageWizard);
const wizardStepTitle = $('[data-wizard-step-title]', coverageWizard);
const wizardStepDescription = $('[data-wizard-step-description]', coverageWizard);
const wizardSceneLabel = $('[data-wizard-scene-label]', coverageWizard);
const wizardSignals = $$('[data-wizard-signal]', coverageWizard);
const wizardPrevious = $('[data-wizard-prev]', coverageWizard);
const wizardNext = $('[data-wizard-next]', coverageWizard);
const wizardProgress = $('[data-wizard-progress]', coverageWizard);
const wizardSelectedCard = $('[data-wizard-selected]', coverageWizard);
const wizardSourceStatus = $('.wizard-source-status b', coverageWizard);
const wizardStage = $('[data-wizard-stage]', coverageWizard);
const wizardLive = $('.wizard-live', coverageWizard);
const wizardTopologyBack = document.createElement('button');
wizardTopologyBack.className = 'wizard-topology-back';
wizardTopologyBack.type = 'button';
wizardTopologyBack.hidden = true;
wizardStage?.append(wizardTopologyBack);
coverageWizard?.classList.add('is-flow-visual');
$('.wizard-steps', coverageWizard)?.remove();
$('.wizard-detail-grid', coverageWizard)?.remove();
$('.wizard-selection-note', coverageWizard)?.remove();
wizardStepLabel.textContent = 'CONNECTED OPERATIONS';
wizardStepTitle.textContent = 'One signal. One continuous view.';
wizardStepDescription.textContent = 'Watch the topology trace an issue from live telemetry to response.';
if (wizardLive) {
  const liveDot = $('i', wizardLive);
  wizardLive.replaceChildren(...(liveDot ? [liveDot] : []), 'Live animation');
}
wizardPrevious.removeAttribute('disabled');
wizardPrevious.classList.add('wizard-animation-toggle');
wizardNext.classList.add('wizard-animation-replay');
wizardNext.textContent = 'Replay from start';
wizardProgress.textContent = 'Signals → context → impact → response';
/** @type {HTMLElement | null} */
let activeCoverageCard = null;
let activeCoverageKey = 'infrastructure';
let coverageAnimationPlaying = false;

const syncTopologyDrilldown = () => {
  const mode = coverageVisualizer.getDetailMode();
  const detailActive = mode !== 'overview';
  wizardTopologyBack.hidden = !detailActive;
  wizardTopologyBack.textContent =
    activeCoverageKey === 'infrastructure'
      ? mode === 'rack'
        ? '← Full topology'
        : mode === 'switch'
          ? '← Back to rack'
          : '← Back to switch'
      : '← ' + coverageWizardData[activeCoverageKey].label + ' overview';
  coverageWizardCanvas?.classList.add('is-interactive');
  if (coverageWizardCanvas) {
    coverageWizardCanvas.tabIndex = 0;
    coverageWizardCanvas.setAttribute('aria-hidden', 'false');
    coverageWizardCanvas.setAttribute('role', 'button');
    coverageWizardCanvas.setAttribute(
      'aria-label',
      activeCoverageKey === 'infrastructure'
        ? mode === 'overview'
          ? 'Interactive rack topology. Use the pointer or arrow keys to select a rack, then press Enter to expand it.'
          : mode === 'rack'
            ? 'Expanded rack network path. Select the core switch to reveal connected equipment.'
            : mode === 'switch'
              ? 'Expanded switch connections. Select a server, storage array or management host for monitored detail.'
              : 'Expanded monitored device with its Cloudmon telemetry path.'
        : mode === 'overview'
          ? 'Interactive ' + coverageWizardData[activeCoverageKey].label + ' topology. Select any node to expand its live monitored path.'
          : 'Expanded ' + coverageWizardData[activeCoverageKey].label + ' live monitored path. Press Escape or use the back button to return.',
    );
  }
  wizardStage?.setAttribute('role', 'group');
  if (wizardStage) wizardStage.dataset.topologyMode = mode;
};

const syncCoverageAnimationControls = () => {
  coverageWizard?.classList.toggle('is-playing', coverageAnimationPlaying);
  wizardPrevious.textContent = coverageAnimationPlaying ? 'Pause animation' : 'Resume animation';
  wizardSourceStatus.textContent = coverageAnimationPlaying ? 'Running' : 'Paused';
};

const pauseCoverageAnimation = () => {
  coverageAnimationPlaying = false;
  coverageVisualizer.stop();
  syncCoverageAnimationControls();
};

const resumeCoverageAnimation = () => {
  if (coverageAnimationPlaying) return;
  coverageAnimationPlaying = true;
  if (!reducedMotion) coverageVisualizer.start();
  syncCoverageAnimationControls();
};

const replayCoverageAnimation = () => {
  coverageAnimationPlaying = true;
  coverageVisualizer.restart();
  if (!reducedMotion) coverageVisualizer.start();
  syncCoverageAnimationControls();
};

const openCoverageWizard = (card) => {
  if (!coverageWizard || !coverageWizardData[card.dataset.coverageKey]) return;
  activeCoverageCard = card;
  activeCoverageKey = card.dataset.coverageKey;
  const category = coverageWizardData[activeCoverageKey];
  const sourceRect = card.getBoundingClientRect();
  const cardTitle = $('h3', card)?.innerText.replace(/\n+/g, ' ') || category.label;
  wizardNumber.textContent = $('.coverage-number', card)?.textContent || '';
  wizardIcon.textContent = $('.coverage-icon', card)?.textContent || '';
  wizardTitle.textContent = cardTitle;
  wizardSummary.textContent = $('p', card)?.textContent || '';
  wizardSceneLabel.textContent = category.label;
  wizardSignals.forEach((signal, index) => { signal.textContent = category.signals[index]; });
  wizardStepDescription.textContent = 'Watch the topology trace live telemetry, then select any node to expand its monitored path.';
  wizardStage?.setAttribute('aria-label', cardTitle + ' animated topology showing signals, context, impact and guided response in one continuous diagram');
  card.classList.add('is-wizard-source');
  coverageWizard.showModal();
  document.body.classList.add('wizard-open');
  coverageVisualizer.open(activeCoverageKey);
  replayCoverageAnimation();
  syncTopologyDrilldown();

  scope.requestAnimationFrame(() => scope.requestAnimationFrame(() => {
    const targetRect = wizardSelectedCard.getBoundingClientRect();
    if (!reducedMotion && typeof wizardSelectedCard.animate === 'function' && targetRect.width && targetRect.height) {
      wizardSelectedCard.animate([
        {
          opacity:0.35,
          transform:'translate(' + (sourceRect.left - targetRect.left) + 'px,' + (sourceRect.top - targetRect.top) + 'px) scale(' + (sourceRect.width / targetRect.width) + ',' + (sourceRect.height / targetRect.height) + ')',
        },
        { opacity:1, transform:'none' },
      ], { duration:650, easing:'cubic-bezier(.16,1,.3,1)' });
    }
    wizardTitle.focus({ preventScroll:true });
  }));
};

const closeCoverageWizard = () => {
  if (coverageWizard?.open) coverageWizard.close();
};

coverageCards.forEach((card) => scope.on(card, 'click', () => openCoverageWizard(card)));
scope.on(coverageWizardCanvas, 'pointermove', (event) => {
  const rect = coverageWizardCanvas.getBoundingClientRect();
  const target = coverageVisualizer.hitTest(event.clientX - rect.left, event.clientY - rect.top);
  coverageVisualizer.setHoverTarget(target);
  coverageWizardCanvas.style.cursor = target ? 'pointer' : 'default';
});
scope.on(coverageWizardCanvas, 'pointerleave', () => {
  coverageVisualizer.setHoverTarget(null);
  coverageWizardCanvas.style.cursor = 'default';
});
scope.on(coverageWizardCanvas, 'click', (event) => {
  const rect = coverageWizardCanvas.getBoundingClientRect();
  if (!coverageVisualizer.activateAt(event.clientX - rect.left, event.clientY - rect.top)) return;
  if (!coverageAnimationPlaying) resumeCoverageAnimation();
  syncTopologyDrilldown();
});
scope.on(coverageWizardCanvas, 'keydown', (event) => {
  if (event.key === 'Escape' && coverageVisualizer.getDetailMode() !== 'overview') {
    event.preventDefault();
    coverageVisualizer.backDetail();
    syncTopologyDrilldown();
    return;
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    coverageVisualizer.keyboardTarget(event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1);
    return;
  }
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  const target = coverageVisualizer.keyboardTarget(0);
  if (!target || !coverageVisualizer.activateTarget(target)) return;
  if (!coverageAnimationPlaying) resumeCoverageAnimation();
  syncTopologyDrilldown();
});
scope.on(wizardTopologyBack, 'click', () => {
  if (!coverageVisualizer.backDetail()) return;
  if (!coverageAnimationPlaying) resumeCoverageAnimation();
  syncTopologyDrilldown();
  coverageWizardCanvas?.focus({ preventScroll: true });
});
scope.on(wizardPrevious, 'click', () => {
  if (coverageAnimationPlaying) pauseCoverageAnimation();
  else resumeCoverageAnimation();
});
scope.on(wizardNext, 'click', replayCoverageAnimation);
scope.on($('[data-wizard-close]', coverageWizard), 'click', closeCoverageWizard);
scope.on(coverageWizard, 'click', (event) => {
  if (event.target === coverageWizard) closeCoverageWizard();
});
scope.on(coverageWizard, 'close', () => {
  coverageAnimationPlaying = false;
  syncCoverageAnimationControls();
  document.body.classList.remove('wizard-open');
  coverageVisualizer.close();
  coverageVisualizer.resetDetailView();
  syncTopologyDrilldown();
  activeCoverageCard?.classList.remove('is-wizard-source');
  const returnTarget = activeCoverageCard;
  activeCoverageCard = null;
  returnTarget?.focus({ preventScroll:true });
});
scope.on(coverageWizard, 'cancel', () => {
  document.body.classList.remove('wizard-open');
});

$('#year')?.replaceChildren(String(new Date().getFullYear()));
}
