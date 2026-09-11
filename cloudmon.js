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
window.addEventListener('scroll', syncScrollState, { passive: true });
window.addEventListener('resize', syncScrollState, { passive: true });

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

menuButton?.addEventListener('click', () => setMenuOpen(!mobileNav?.classList.contains('open')));
$$('.mobile-nav a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileNav?.classList.contains('open')) {
    setMenuOpen(false);
    menuButton?.focus();
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1100 && mobileNav?.classList.contains('open')) setMenuOpen(false);
}, { passive: true });

const revealElements = $$('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
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
  window.addEventListener('pointermove', (event) => {
    cursorAura.style.opacity = '1';
    cursorAura.style.left = `${event.clientX}px`;
    cursorAura.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const heroImage = $('[data-parallax]');
if (heroImage && !reducedMotion) {
  window.addEventListener('scroll', () => {
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
    window.addEventListener('resize', this.resize);
    if (!reducedMotion) this.start();
    else this.draw(true);
  }

  start() {
    if (!this.context || this.running || reducedMotion) return;
    this.running = true;
    this.frame = requestAnimationFrame(this.draw);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.frame);
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

    if (!singleFrame && this.running) this.frame = requestAnimationFrame(this.draw);
  }
}

const heroField = new TelemetryField($('#telemetry-canvas'), { density: 31, maxDistance: 155, speed: 0.15 });
const ctaField = new TelemetryField($('#cta-canvas'), { density: 24, maxDistance: 135, speed: 0.1 });

document.addEventListener('visibilitychange', () => {
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

const coverageWizardSteps = [
  { title: 'Observe the system', description: 'Build a live map of the selected environment and every dependency that matters.' },
  { title: 'Correlate the signals', description: 'Connect metrics, events, traces and changes to expose meaningful operational patterns.' },
  { title: 'Act with confidence', description: 'Prioritize impact, isolate likely root cause and reveal the clearest response path.' },
];

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
    this.draw = this.draw.bind(this);
    this.resize = this.resize.bind(this);
    if (!this.context) return;
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(canvas);
  }

  open(scene) {
    this.scene = scene;
    this.resize();
    if (reducedMotion) this.drawFrame(0.8);
    else this.start();
  }

  close() {
    this.stop();
    this.context?.clearRect(0, 0, this.width, this.height);
  }

  setStep(step) {
    this.step = step;
    if (reducedMotion) this.drawFrame(0.8);
  }

  start() {
    if (!this.context || this.running) return;
    this.running = true;
    this.frame = requestAnimationFrame(this.draw);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  resize() {
    if (!this.context) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * ratio);
    this.canvas.height = Math.floor(rect.height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.drawFrame(reducedMotion ? 0.8 : performance.now() * 0.001);
  }

  draw() {
    if (!this.running) return;
    this.drawFrame(performance.now() * 0.001);
    this.frame = requestAnimationFrame(this.draw);
  }

  drawFrame(time) {
    const context = this.context;
    if (!context || !this.width || !this.height) return;
    context.clearRect(0, 0, this.width, this.height);
    this.accent = this.step === 1 ? '#8127ff' : this.step === 2 ? '#3dffb3' : '#35d8ff';
    this.accentRgb = this.step === 1 ? '129,39,255' : this.step === 2 ? '61,255,179' : '53,216,255';
    this.drawBoundary();
    const drawers = {
      infrastructure: this.drawInfrastructure,
      network: this.drawNetwork,
      cloud: this.drawCloud,
      applications: this.drawApplications,
      industrial: this.drawIndustrial,
      iot: this.drawIot,
      ai: this.drawAi,
    };
    (drawers[this.scene] || drawers.infrastructure).call(this, time);
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
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
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
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
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
    context.shadowBlur = 12;
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
    context.fillStyle = 'rgba(156,188,209,.66)';
    context.font = '500 7px Inter, Arial, sans-serif';
    context.letterSpacing = '1px';
    context.textAlign = align;
    context.fillText(label, x, y);
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

  drawInfrastructure(time) {
    const width = this.width;
    const height = this.height;
    const rackY = height * 0.3;
    const rackHeight = Math.min(132, height * 0.43);
    const rackWidth = Math.min(72, width * 0.105);
    const rackXs = [width * 0.09, width * 0.25, width * 0.41];
    const core = { x: width * 0.72, y: height * 0.5 };
    rackXs.forEach((x, rackIndex) => {
      this.context.fillStyle = 'rgba(4,17,29,.9)';
      this.context.strokeStyle = 'rgba(53,216,255,.28)';
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
      const start = { x: x + rackWidth, y: rackY + rackHeight / 2 };
      this.drawLine(start, core, 0.24);
      this.drawPacket([start, core], (time * 0.22 + rackIndex * 0.27) % 1);
      this.drawLabel('RACK ' + String(rackIndex + 1).padStart(2, '0'), x + rackWidth / 2, rackY - 9);
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
    nodes.forEach((node, index) => this.drawNode(node.x, node.y, index === 5 ? 17 : 12, node.label, time * 2 + index));
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
    items.forEach((item, index) => this.drawBox(item.x, item.y, item.w, item.h, item.label, index === 3 || (this.step === 2 && index === 4)));
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
    });
    this.drawNode(gateway.x, gateway.y, 24, 'EDGE GATEWAY', time * 2.4);
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
    });
    this.drawBox(memory.x, memory.y, memory.w, memory.h, 'MEMORY BUS', this.step === 2);
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
const wizardInsight = $('[data-wizard-insight]', coverageWizard);
const wizardPoints = $('[data-wizard-points]', coverageWizard);
const wizardMetricLabels = $$('[data-wizard-metric-label]', coverageWizard);
const wizardMetricValues = $$('[data-wizard-metric-value]', coverageWizard);
const wizardStepButtons = $$('[data-wizard-step]', coverageWizard);
const wizardPrevious = $('[data-wizard-prev]', coverageWizard);
const wizardNext = $('[data-wizard-next]', coverageWizard);
const wizardProgress = $('[data-wizard-progress]', coverageWizard);
const wizardSelectedCard = $('[data-wizard-selected]', coverageWizard);
let activeCoverageCard = null;
let activeCoverageKey = 'infrastructure';
let activeWizardStep = 0;

const renderCoverageWizardStep = (step) => {
  const category = coverageWizardData[activeCoverageKey];
  const detail = category.steps[step];
  const stepDefinition = coverageWizardSteps[step];
  activeWizardStep = step;
  wizardStepLabel.textContent = 'Step ' + String(step + 1).padStart(2, '0') + ' / 03';
  wizardStepTitle.textContent = stepDefinition.title;
  wizardStepDescription.textContent = stepDefinition.description;
  wizardInsight.textContent = detail.insight;
  wizardProgress.textContent = String(step + 1) + ' of 3';
  wizardPrevious.disabled = step === 0;
  wizardNext.innerHTML = step === 2 ? 'Close explorer <span aria-hidden="true">×</span>' : 'Continue <span aria-hidden="true">→</span>';
  wizardPoints.replaceChildren(...detail.points.map((point) => {
    const item = document.createElement('li');
    item.textContent = point;
    return item;
  }));
  detail.metrics.forEach((metric, index) => {
    wizardMetricLabels[index].textContent = metric[0];
    wizardMetricValues[index].textContent = metric[1];
  });
  wizardStepButtons.forEach((button, index) => {
    const active = index === step;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  coverageVisualizer.setStep(step);
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
  $('[data-wizard-stage]', coverageWizard)?.setAttribute('aria-label', cardTitle + ' animated topology');
  renderCoverageWizardStep(0);
  card.classList.add('is-wizard-source');
  coverageWizard.showModal();
  document.body.classList.add('wizard-open');
  coverageVisualizer.open(activeCoverageKey);

  requestAnimationFrame(() => requestAnimationFrame(() => {
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

coverageCards.forEach((card) => card.addEventListener('click', () => openCoverageWizard(card)));
wizardStepButtons.forEach((button) => {
  button.addEventListener('click', () => renderCoverageWizardStep(Number(button.dataset.wizardStep)));
  button.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextStep = (Number(button.dataset.wizardStep) + direction + wizardStepButtons.length) % wizardStepButtons.length;
    renderCoverageWizardStep(nextStep);
    wizardStepButtons[nextStep].focus();
  });
});
wizardPrevious?.addEventListener('click', () => renderCoverageWizardStep(Math.max(0, activeWizardStep - 1)));
wizardNext?.addEventListener('click', () => {
  if (activeWizardStep === coverageWizardSteps.length - 1) closeCoverageWizard();
  else renderCoverageWizardStep(activeWizardStep + 1);
});
$('[data-wizard-close]', coverageWizard)?.addEventListener('click', closeCoverageWizard);
coverageWizard?.addEventListener('click', (event) => {
  if (event.target === coverageWizard) closeCoverageWizard();
});
coverageWizard?.addEventListener('close', () => {
  document.body.classList.remove('wizard-open');
  coverageVisualizer.close();
  activeCoverageCard?.classList.remove('is-wizard-source');
  const returnTarget = activeCoverageCard;
  activeCoverageCard = null;
  returnTarget?.focus({ preventScroll:true });
});
coverageWizard?.addEventListener('cancel', () => {
  document.body.classList.remove('wizard-open');
});

$('#year')?.replaceChildren(String(new Date().getFullYear()));
