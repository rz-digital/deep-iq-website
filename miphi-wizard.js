export default function mount(scope) {
'use strict';

const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const workloadReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const workloadWizardData = {
  ai: {
    label: 'AI & Machine Learning',
    signals: ['Tensor pipeline', 'NVMe fabric', 'GPU nodes'],
    steps: [
      { insight: 'MiPhi maps training data from the NVMe tier through the storage fabric to every accelerator in the model pipeline.', points: ['Dataset discovery', 'GPU dependency map', 'Queue visibility'], metrics: [['Datasets', '18'], ['GPU nodes', '24'], ['Queue depth', '12']] },
      { insight: 'Parallel reads and intelligent caching keep high-value tensors close to compute as training demand changes.', points: ['Parallel data lanes', 'Hot-data cache', 'Latency control'], metrics: [['Read stream', '48 GB/s'], ['Cache hit', '94%'], ['Latency', '82 us']] },
      { insight: 'Mirrored checkpoints and verified writes preserve model state and create a clear recovery path.', points: ['Checkpoint mirror', 'Integrity scan', 'Rapid recovery'], metrics: [['Replica', '2x'], ['Integrity', 'Verified'], ['Recovery', '21 sec']] },
    ],
  },
  cloud: {
    label: 'Cloud Computing',
    signals: ['Tenants', 'Storage tiers', 'Regions'],
    steps: [
      { insight: 'Block, object and file demand is mapped across tenants, availability zones and shared storage services.', points: ['Tenant discovery', 'Tier mapping', 'Region topology'], metrics: [['Tenants', '36'], ['Volumes', '184'], ['Regions', '03']] },
      { insight: 'Active data is balanced across storage paths while burst traffic is absorbed by the fastest available tier.', points: ['Elastic queueing', 'Path balancing', 'Burst cache'], metrics: [['IOPS', '1.8M'], ['Burst', '6.4 GB/s'], ['P95', '1.2 ms']] },
      { insight: 'Cross-zone replication keeps services available and exposes recovery readiness before an incident occurs.', points: ['Zone replication', 'Consistency check', 'Failover route'], metrics: [['Copies', '03'], ['RPO', '< 1 min'], ['Failover', 'Ready']] },
    ],
  },
  applications: {
    label: 'Enterprise Applications',
    signals: ['Services', 'Transactions', 'Database'],
    steps: [
      { insight: 'Application services, transactional databases and their storage dependencies appear in one live service path.', points: ['Service mapping', 'Database links', 'Transaction flow'], metrics: [['Services', '42'], ['Databases', '08'], ['TPS', '12.6K']] },
      { insight: 'Low-latency storage lanes prioritize transactional reads and writes without starving background workloads.', points: ['Workload priority', 'Read/write balance', 'Queue control'], metrics: [['P99', '3.8 ms'], ['IOPS', '940K'], ['Queue', 'Healthy']] },
      { insight: 'Synchronized replicas and continuous integrity checks protect the data behind critical business services.', points: ['Replica health', 'Write verification', 'Recovery point'], metrics: [['Replica', 'Synced'], ['Errors', '0'], ['RTO', '48 sec']] },
    ],
  },
  datacentre: {
    label: 'Modern Data Centres',
    signals: ['Compute racks', 'Storage fabric', 'SSD arrays'],
    steps: [
      { insight: 'Rack-level compute, switching and storage capacity are assembled into a clear physical and logical map.', points: ['Rack inventory', 'Fabric discovery', 'Capacity map'], metrics: [['Racks', '24'], ['Drives', '384'], ['Capacity', '6.2 PB']] },
      { insight: 'Parallel fabric paths distribute demand across arrays to maintain predictable performance at density.', points: ['Multipath I/O', 'Load distribution', 'Thermal context'], metrics: [['Fabric', '200 Gb'], ['Utilisation', '71%'], ['Latency', '96 us']] },
      { insight: 'Array mirrors, hot spares and health telemetry expose resilience across the full data-centre floor.', points: ['Array mirroring', 'Drive health', 'Spare readiness'], metrics: [['Health', '99.99%'], ['Spares', '12'], ['Risk', 'Low']] },
    ],
  },
  hpc: {
    label: 'High-Performance Computing',
    signals: ['Compute nodes', 'Burst buffer', 'Parallel file'],
    steps: [
      { insight: 'Compute partitions, the burst buffer and the parallel storage tier are mapped as one high-throughput pipeline.', points: ['Node discovery', 'Job data path', 'Tier topology'], metrics: [['Nodes', '128'], ['Jobs', '37'], ['Dataset', '1.4 PB']] },
      { insight: 'Striped reads and writes move across parallel lanes so storage keeps pace with the active compute job.', points: ['Parallel striping', 'Burst absorption', 'Lane balancing'], metrics: [['Throughput', '92 GB/s'], ['Lanes', '16'], ['Wait', '0.4 ms']] },
      { insight: 'Checkpoint data is committed, verified and mirrored without interrupting the compute pipeline.', points: ['Checkpoint commit', 'Parity verify', 'Mirror transfer'], metrics: [['Checkpoint', 'Safe'], ['Parity', 'Clean'], ['Mirror', 'Active']] },
    ],
  },
  infrastructure: {
    label: 'Digital Infrastructure',
    signals: ['Edge layer', 'Core storage', 'Archive'],
    steps: [
      { insight: 'Edge systems, core services and long-term data tiers are joined into one scalable storage foundation.', points: ['Layer discovery', 'Dependency map', 'Capacity profile'], metrics: [['Sites', '18'], ['Pools', '46'], ['Capacity', '3.8 PB']] },
      { insight: 'Policy-driven movement places active data on fast media and ages colder data into efficient capacity tiers.', points: ['Hot-data placement', 'Tier movement', 'Capacity balance'], metrics: [['Active', '31%'], ['Moved', '8.2 TB/h'], ['Efficiency', '88%']] },
      { insight: 'End-to-end replication and integrity checks protect every tier while preserving a simple recovery route.', points: ['Tier replication', 'Integrity chain', 'Recovery plan'], metrics: [['Coverage', '100%'], ['Integrity', 'Clean'], ['Recovery', 'Ready']] },
    ],
  },
};

const workloadWizardSteps = [
  { title: 'Map the workload', description: 'Discover the data path, storage tiers and compute dependencies behind this workload.' },
  { title: 'Accelerate the data', description: 'See how parallel paths, caching and workload-aware placement increase useful throughput.' },
  { title: 'Protect continuity', description: 'Verify replicas, integrity signals and the recovery route that keeps the workload available.' },
];

class WorkloadWizardVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas?.getContext('2d');
    this.scene = 'ai';
    this.step = 0;
    this.frame = 0;
    this.running = false;
    this.width = 0;
    this.height = 0;
    this.draw = this.draw.bind(this);
    this.resize = this.resize.bind(this);
    if (!this.context) return;
    if ('ResizeObserver' in window) {
      this.resizeObserver = scope.observe(ResizeObserver, this.resize);
      this.resizeObserver.observe(canvas);
    } else {
      scope.on(window, 'resize', this.resize);
    }
  }

  open(scene) {
    this.scene = scene;
    this.resize();
    if (workloadReducedMotion) this.drawFrame(0.8);
    else this.start();
  }

  close() {
    this.stop();
    this.context?.clearRect(0, 0, this.width, this.height);
  }

  setStep(step) {
    this.step = step;
    if (workloadReducedMotion) this.drawFrame(0.8);
  }

  start() {
    if (!this.context || this.running) return;
    this.running = true;
    this.frame = scope.requestAnimationFrame(this.draw);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    scope.cancelAnimationFrame(this.frame);
  }

  resize() {
    if (!this.context) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.drawFrame(workloadReducedMotion ? 0.8 : performance.now() * 0.001);
  }

  draw() {
    if (!this.running) return;
    this.drawFrame(performance.now() * 0.001);
    this.frame = scope.requestAnimationFrame(this.draw);
  }

  drawFrame(time) {
    const context = this.context;
    if (!context || !this.width || !this.height) return;
    context.clearRect(0, 0, this.width, this.height);
    this.accent = this.step === 1 ? '#2e9cff' : this.step === 2 ? '#54f0c0' : '#35d8ff';
    this.accentRgb = this.step === 1 ? '46,156,255' : this.step === 2 ? '84,240,192' : '53,216,255';
    this.drawBoundary();
    const drawers = {
      ai: this.drawAi,
      cloud: this.drawCloudWorkload,
      applications: this.drawApplications,
      datacentre: this.drawDataCentre,
      hpc: this.drawHpc,
      infrastructure: this.drawInfrastructure,
    };
    (drawers[this.scene] || drawers.ai).call(this, time);
  }

  drawBoundary() {
    const context = this.context;
    context.save();
    context.strokeStyle = 'rgba(53,216,255,.09)';
    context.lineWidth = 1;
    context.setLineDash([4, 8]);
    context.strokeRect(18.5, 31.5, Math.max(0, this.width - 37), Math.max(0, this.height - 63));
    context.fillStyle = 'rgba(53,216,255,.18)';
    for (let x = 36; x < this.width - 24; x += 84) {
      context.fillRect(x, 43, 1, 3);
      context.fillRect(x, this.height - 46, 1, 3);
    }
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

  drawPolyline(points, alpha = 0.26, dashed = false) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + alpha + ')';
    context.lineWidth = 1;
    if (dashed) context.setLineDash([5, 7]);
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

  drawPacket(points, progress, radius = 2.6) {
    const point = this.pointOnPath(points, ((progress % 1) + 1) % 1);
    const context = this.context;
    context.save();
    context.shadowBlur = 13;
    context.shadowColor = this.accent;
    context.fillStyle = this.accent;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  drawLabel(label, x, y, align = 'center') {
    const context = this.context;
    context.save();
    context.fillStyle = 'rgba(156,188,209,.67)';
    context.font = '500 7px Inter, Arial, sans-serif';
    context.textAlign = align;
    context.fillText(label, x, y);
    context.restore();
  }

  drawNode(x, y, radius, label, activity = 0.5, active = false) {
    const pulse = 0.5 + Math.sin(activity) * 0.5;
    const context = this.context;
    context.save();
    context.fillStyle = active ? 'rgba(' + this.accentRgb + ',.13)' : 'rgba(4,17,29,.95)';
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + (active ? .78 : .4 + pulse * .24) + ')';
    context.lineWidth = 1;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = this.accent;
    context.globalAlpha = .52 + pulse * .42;
    context.beginPath();
    context.arc(x, y, Math.max(2, radius * .19), 0, Math.PI * 2);
    context.fill();
    context.restore();
    this.drawLabel(label, x, y + radius + 14);
  }

  drawBox(x, y, width, height, label, active = false, rows = 3) {
    const context = this.context;
    context.save();
    context.fillStyle = active ? 'rgba(' + this.accentRgb + ',.12)' : 'rgba(4,17,29,.93)';
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + (active ? .72 : .3) + ')';
    context.fillRect(x, y, width, height);
    context.strokeRect(x + .5, y + .5, width - 1, height - 1);
    context.fillStyle = 'rgba(' + this.accentRgb + ',.2)';
    context.fillRect(x + 7, y + 7, Math.max(9, width * .3), 2);
    for (let row = 0; row < rows; row += 1) {
      const rowY = y + 17 + row * Math.max(7, (height - 25) / Math.max(1, rows));
      context.fillStyle = 'rgba(' + this.accentRgb + ',' + (.08 + row * .035) + ')';
      context.fillRect(x + 7, rowY, Math.max(8, width - 14), 1);
    }
    context.restore();
    this.drawLabel(label, x + width / 2, y + height + 14);
  }

  drawStorage(x, y, width, height, label, time, active = false) {
    this.drawBox(x, y, width, height, label, active, 0);
    const context = this.context;
    const columns = width > 90 ? 4 : 3;
    const rows = 3;
    const gap = 5;
    const slotWidth = (width - 16 - gap * (columns - 1)) / columns;
    const slotHeight = (height - 22 - gap * (rows - 1)) / rows;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = row * columns + column;
        const slotX = x + 8 + column * (slotWidth + gap);
        const slotY = y + 10 + row * (slotHeight + gap);
        const glow = .1 + (Math.sin(time * 3 + index * .72) + 1) * .1;
        context.fillStyle = 'rgba(' + this.accentRgb + ',' + glow + ')';
        context.strokeStyle = 'rgba(' + this.accentRgb + ',.22)';
        context.fillRect(slotX, slotY, slotWidth, slotHeight);
        context.strokeRect(slotX + .5, slotY + .5, slotWidth - 1, slotHeight - 1);
      }
    }
  }

  drawCylinder(x, y, width, height, label, active = false) {
    const context = this.context;
    const ellipse = Math.min(10, height * .16);
    context.save();
    context.fillStyle = active ? 'rgba(' + this.accentRgb + ',.13)' : 'rgba(4,17,29,.94)';
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + (active ? .72 : .38) + ')';
    context.beginPath();
    context.ellipse(x + width / 2, y + ellipse, width / 2, ellipse, 0, Math.PI, 0);
    context.lineTo(x + width, y + height - ellipse);
    context.ellipse(x + width / 2, y + height - ellipse, width / 2, ellipse, 0, 0, Math.PI);
    context.closePath();
    context.fill();
    context.stroke();
    context.beginPath();
    context.ellipse(x + width / 2, y + ellipse, width / 2, ellipse, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
    this.drawLabel(label, x + width / 2, y + height + 14);
  }

  drawCloud(x, y, width, height, label, active = false) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(x + width * .2, y + height * .78);
    context.bezierCurveTo(x - 2, y + height * .75, x, y + height * .45, x + width * .22, y + height * .42);
    context.bezierCurveTo(x + width * .28, y + 2, x + width * .66, y - 2, x + width * .71, y + height * .35);
    context.bezierCurveTo(x + width, y + height * .34, x + width + 3, y + height * .78, x + width * .78, y + height * .8);
    context.closePath();
    context.fillStyle = active ? 'rgba(' + this.accentRgb + ',.14)' : 'rgba(4,17,29,.94)';
    context.strokeStyle = 'rgba(' + this.accentRgb + ',' + (active ? .72 : .42) + ')';
    context.fill();
    context.stroke();
    context.restore();
    this.drawLabel(label, x + width / 2, y + height + 12);
  }

  drawFocus(x, y, time, radius = 24) {
    if (this.step === 0) return;
    const context = this.context;
    const pulseRadius = radius + (Math.sin(time * 2.2) + 1) * 5;
    context.save();
    context.strokeStyle = 'rgba(' + this.accentRgb + ',.38)';
    context.setLineDash([4, 6]);
    context.beginPath();
    context.arc(x, y, pulseRadius, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  drawGauge(x, y, width, value, label) {
    const context = this.context;
    context.save();
    context.fillStyle = 'rgba(53,216,255,.1)';
    context.fillRect(x, y, width, 3);
    context.fillStyle = this.accent;
    context.shadowBlur = 8;
    context.shadowColor = this.accent;
    context.fillRect(x, y, width * value, 3);
    context.restore();
    this.drawLabel(label, x, y - 7, 'left');
  }


  drawAi(time) {
    const width = this.width;
    const height = this.height;
    const datasetWidth = Math.max(58, Math.min(92, width * .12));
    const arrayWidth = Math.max(68, Math.min(110, width * .15));
    const gpuWidth = Math.max(46, Math.min(72, width * .09));
    const gpuHeight = Math.max(48, Math.min(66, height * .23));
    const source = { x:width * .055, y:height * .39, w:datasetWidth, h:Math.max(54, height * .2) };
    const array = { x:width * .25, y:height * .34, w:arrayWidth, h:Math.max(68, height * .27) };
    const fabric = { x:width * .54, y:height * .49 };
    const gpuX = width * .69;
    const gpuYs = [height * .2, height * .43, height * .66];
    const model = { x:width * .91, y:height * .49 };

    this.drawBox(source.x, source.y, source.w, source.h, 'TRAINING DATA', this.step === 0, 3);
    this.drawStorage(array.x, array.y, array.w, array.h, 'NVME ARRAY', time, this.step > 0);
    const sourcePath = [
      { x:source.x + source.w, y:source.y + source.h / 2 },
      { x:array.x, y:array.y + array.h / 2 },
    ];
    this.drawLine(sourcePath[0], sourcePath[1], .35);
    this.drawPacket(sourcePath, time * .18);

    const arrayExit = { x:array.x + array.w, y:array.y + array.h / 2 };
    this.drawLine(arrayExit, fabric, .42);
    this.drawPacket([arrayExit, fabric], time * .28);
    if (this.step > 0) this.drawPacket([arrayExit, fabric], time * .28 + .45, 2.1);
    this.drawNode(fabric.x, fabric.y, Math.max(13, Math.min(21, width * .025)), 'STORAGE FABRIC', time * 2.1, this.step === 1);

    gpuYs.forEach((y, index) => {
      const gpu = { x:gpuX, y:y, w:gpuWidth, h:gpuHeight };
      const target = { x:gpu.x, y:gpu.y + gpu.h / 2 };
      this.drawLine(fabric, target, this.step === 1 ? .55 : .24, index === 2);
      this.drawPacket([fabric, target], time * (.2 + this.step * .05) + index * .27, 2.2);
      if (this.step === 1) this.drawPacket([fabric, target], time * .25 + index * .27 + .48, 1.8);
      this.drawBox(gpu.x, gpu.y, gpu.w, gpu.h, 'GPU ' + String(index + 1).padStart(2, '0'), index === this.step, 3);
      for (let cell = 0; cell < 4; cell += 1) {
        const cellX = gpu.x + 8 + (cell % 2) * Math.max(11, gpu.w * .35);
        const cellY = gpu.y + 16 + Math.floor(cell / 2) * Math.max(10, gpu.h * .27);
        this.context.fillStyle = 'rgba(' + this.accentRgb + ',' + (.12 + (Math.sin(time * 3 + index + cell) + 1) * .1) + ')';
        this.context.fillRect(cellX, cellY, Math.max(7, gpu.w * .2), Math.max(6, gpu.h * .14));
      }
      const gpuExit = { x:gpu.x + gpu.w, y:gpu.y + gpu.h / 2 };
      this.drawLine(gpuExit, model, .18);
      this.drawPacket([gpuExit, model], time * .15 + index * .31, 1.7);
    });
    this.drawNode(model.x, model.y, Math.max(11, Math.min(17, width * .02)), 'MODEL', time * 2.5, this.step === 2);
    if (this.step === 2) {
      const checkpoint = { x:width * .42, y:height * .76, w:Math.max(62, width * .1), h:Math.max(34, height * .13) };
      this.drawBox(checkpoint.x, checkpoint.y, checkpoint.w, checkpoint.h, 'CHECKPOINT', true, 2);
      this.drawLine(fabric, { x:checkpoint.x + checkpoint.w / 2, y:checkpoint.y }, .56, true);
      this.drawPacket([fabric, { x:checkpoint.x + checkpoint.w / 2, y:checkpoint.y }], time * .24);
    }
    this.drawFocus(fabric.x, fabric.y, time);
    this.drawGauge(width * .055, height * .77, width * .18, .62 + Math.sin(time * 1.7) * .12, 'DATA FEED');
  }

  drawCloudWorkload(time) {
    const width = this.width;
    const height = this.height;
    const onPrem = { x:width * .055, y:height * .42, w:Math.max(60, Math.min(88, width * .11)), h:Math.max(54, height * .2) };
    const gateway = { x:width * .27, y:height * .51 };
    const cloudWidth = Math.max(66, Math.min(104, width * .135));
    const cloudHeight = Math.max(42, height * .18);
    const regionA = { x:width * .42, y:height * .2, w:cloudWidth, h:cloudHeight };
    const regionB = { x:width * .68, y:height * .57, w:cloudWidth, h:cloudHeight };
    const tenant = { x:width * .9, y:height * .31 };

    this.drawStorage(onPrem.x, onPrem.y, onPrem.w, onPrem.h, 'PRIVATE TIER', time, this.step === 0);
    this.drawNode(gateway.x, gateway.y, Math.max(12, Math.min(18, width * .022)), 'DATA GATEWAY', time * 2.1, this.step === 1);
    this.drawCloud(regionA.x, regionA.y, regionA.w, regionA.h, 'REGION A', this.step === 1);
    this.drawCloud(regionB.x, regionB.y, regionB.w, regionB.h, 'REGION B', this.step === 2);
    this.drawNode(tenant.x, tenant.y, Math.max(10, Math.min(15, width * .018)), 'TENANTS', time * 2.4);

    const source = { x:onPrem.x + onPrem.w, y:onPrem.y + onPrem.h / 2 };
    const aCenter = { x:regionA.x + regionA.w / 2, y:regionA.y + regionA.h * .58 };
    const bCenter = { x:regionB.x + regionB.w / 2, y:regionB.y + regionB.h * .58 };
    const paths = [[source,gateway],[gateway,aCenter],[gateway,bCenter],[aCenter,tenant],[bCenter,tenant]];
    paths.forEach((path, index) => {
      this.drawLine(path[0], path[1], index === this.step + 1 ? .62 : .25, index === 2);
      this.drawPacket(path, time * (.18 + this.step * .035) + index * .19, index > 2 ? 1.9 : 2.4);
      if (this.step === 1 && index < 3) this.drawPacket(path, time * .26 + index * .2 + .5, 1.8);
    });
    this.drawLine(aCenter, bCenter, this.step === 2 ? .7 : .16, true);
    if (this.step === 2) {
      this.drawPacket([aCenter,bCenter], time * .22);
      this.drawPacket([bCenter,aCenter], time * .19 + .4, 2);
    }
    this.drawFocus(this.step === 2 ? bCenter.x : gateway.x, this.step === 2 ? bCenter.y : gateway.y, time);
    this.drawGauge(width * .055, height * .77, width * .2, .72 + Math.sin(time * 1.5) * .08, 'ELASTIC CAPACITY');
  }

  drawApplications(time) {
    const width = this.width;
    const height = this.height;
    const user = { x:width * .07, y:height * .5 };
    const gateway = { x:width * .22, y:height * .5 };
    const serviceWidth = Math.max(52, Math.min(76, width * .095));
    const serviceHeight = Math.max(40, height * .16);
    const serviceX = width * .37;
    const serviceYs = [height * .18, height * .43, height * .68];
    const database = { x:width * .65, y:height * .36, w:Math.max(58, Math.min(82, width * .1)), h:Math.max(72, height * .27) };
    const replica = { x:width * .86, y:height * .39, w:Math.max(48, Math.min(70, width * .085)), h:Math.max(62, height * .23) };

    this.drawNode(user.x, user.y, Math.max(10, Math.min(15, width * .018)), 'USERS', time * 2);
    this.drawNode(gateway.x, gateway.y, Math.max(13, Math.min(19, width * .023)), 'API GATEWAY', time * 2.2, this.step === 1);
    this.drawLine(user, gateway, .36);
    this.drawPacket([user,gateway], time * .28);
    serviceYs.forEach((y, index) => {
      const service = { x:serviceX, y:y, w:serviceWidth, h:serviceHeight };
      const serviceCenter = { x:service.x, y:service.y + service.h / 2 };
      this.drawLine(gateway, serviceCenter, this.step === 1 ? .52 : .24);
      this.drawPacket([gateway,serviceCenter], time * (.2 + this.step * .045) + index * .25, 2.1);
      this.drawBox(service.x, service.y, service.w, service.h, 'SERVICE ' + String(index + 1).padStart(2, '0'), index === this.step, 2);
      const exit = { x:service.x + service.w, y:service.y + service.h / 2 };
      const dbEntry = { x:database.x, y:database.y + database.h / 2 };
      this.drawLine(exit, dbEntry, .26);
      this.drawPacket([exit,dbEntry], time * .18 + index * .3, 1.9);
    });
    this.drawCylinder(database.x, database.y, database.w, database.h, 'TRANSACTION DB', this.step > 0);
    const dbExit = { x:database.x + database.w, y:database.y + database.h / 2 };
    const replicaEntry = { x:replica.x, y:replica.y + replica.h / 2 };
    this.drawLine(dbExit, replicaEntry, this.step === 2 ? .68 : .17, true);
    this.drawCylinder(replica.x, replica.y, replica.w, replica.h, 'REPLICA', this.step === 2);
    if (this.step === 2) {
      this.drawPacket([dbExit,replicaEntry], time * .24);
      this.drawPacket([dbExit,replicaEntry], time * .24 + .52, 1.8);
    }
    this.drawFocus(database.x + database.w / 2, database.y + database.h / 2, time, 28);
    this.drawGauge(width * .055, height * .78, width * .18, .58 + Math.sin(time * 2) * .1, 'TRANSACTION LOAD');
  }

  drawDataCentre(time) {
    const width = this.width;
    const height = this.height;
    const rackWidth = Math.max(42, Math.min(60, width * .072));
    const rackHeight = Math.max(92, Math.min(125, height * .43));
    const rackXs = [width * .055, width * .145, width * .235, width * .325];
    const rackY = height * .3;
    const fabricA = { x:width * .51, y:height * .36 };
    const fabricB = { x:width * .51, y:height * .65 };
    const array = { x:width * .67, y:height * .32, w:Math.max(82, Math.min(122, width * .145)), h:Math.max(100, height * .37) };
    const mirror = { x:width * .88, y:height * .38, w:Math.max(50, Math.min(72, width * .085)), h:Math.max(78, height * .29) };

    rackXs.forEach((x, rackIndex) => {
      this.drawBox(x, rackY, rackWidth, rackHeight, 'RACK ' + String(rackIndex + 1).padStart(2, '0'), rackIndex === this.step, 5);
      for (let unit = 0; unit < 5; unit += 1) {
        const ledY = rackY + 18 + unit * ((rackHeight - 27) / 5);
        this.context.fillStyle = 'rgba(' + this.accentRgb + ',' + (.28 + (Math.sin(time * 3 + rackIndex + unit) + 1) * .2) + ')';
        this.context.fillRect(x + 8, ledY, 3, 3);
      }
      const source = { x:x + rackWidth, y:rackY + rackHeight / 2 };
      const target = rackIndex % 2 ? fabricB : fabricA;
      this.drawLine(source, target, this.step === 1 ? .5 : .22);
      this.drawPacket([source,target], time * (.18 + this.step * .04) + rackIndex * .2, 2);
    });
    this.drawNode(fabricA.x, fabricA.y, Math.max(11, Math.min(16, width * .019)), 'FABRIC A', time * 2.2, this.step === 1);
    this.drawNode(fabricB.x, fabricB.y, Math.max(11, Math.min(16, width * .019)), 'FABRIC B', time * 2.2 + 1, this.step === 1);
    const arrayEntryA = { x:array.x, y:array.y + array.h * .35 };
    const arrayEntryB = { x:array.x, y:array.y + array.h * .67 };
    [[fabricA,arrayEntryA],[fabricB,arrayEntryB]].forEach((path, index) => {
      this.drawLine(path[0],path[1],.48);
      this.drawPacket(path,time * .27 + index * .42);
      if (this.step === 1) this.drawPacket(path,time * .27 + index * .42 + .5,1.8);
    });
    this.drawStorage(array.x,array.y,array.w,array.h,'SSD ARRAY',time,this.step > 0);
    const arrayExit = { x:array.x + array.w, y:array.y + array.h / 2 };
    const mirrorEntry = { x:mirror.x, y:mirror.y + mirror.h / 2 };
    this.drawLine(arrayExit,mirrorEntry,this.step === 2 ? .68 : .15,true);
    this.drawStorage(mirror.x,mirror.y,mirror.w,mirror.h,'MIRROR',time + .8,this.step === 2);
    if (this.step === 2) this.drawPacket([arrayExit,mirrorEntry],time * .22);
    this.drawFocus(array.x + array.w / 2,array.y + array.h / 2,time,32);
    this.drawGauge(width * .055,height * .78,width * .23,.69 + Math.sin(time * 1.4) * .08,'FABRIC LOAD');
  }

  drawHpc(time) {
    const width = this.width;
    const height = this.height;
    const nodeOrigin = { x:width * .055, y:height * .22 };
    const nodeWidth = Math.max(30, Math.min(44, width * .052));
    const nodeHeight = Math.max(25, height * .09);
    const burst = { x:width * .42, y:height * .35, w:Math.max(70, Math.min(102, width * .12)), h:Math.max(76, height * .28) };
    const array = { x:width * .75, y:height * .31, w:Math.max(88, Math.min(126, width * .15)), h:Math.max(98, height * .37) };
    const computeCenter = { x:nodeOrigin.x + nodeWidth * 2.5, y:height * .5 };
    const burstEntry = { x:burst.x, y:burst.y + burst.h / 2 };
    const burstExit = { x:burst.x + burst.w, y:burst.y + burst.h / 2 };
    const arrayEntry = { x:array.x, y:array.y + array.h / 2 };

    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        const index = row * 4 + column;
        const x = nodeOrigin.x + column * (nodeWidth + 7);
        const y = nodeOrigin.y + row * (nodeHeight + 8);
        this.drawBox(x,y,nodeWidth,nodeHeight,'',index % 3 === this.step,1);
        this.context.fillStyle = 'rgba(' + this.accentRgb + ',' + (.18 + (Math.sin(time * 3 + index) + 1) * .13) + ')';
        this.context.fillRect(x + 7,y + 8,Math.max(6,nodeWidth - 14),2);
      }
    }
    this.drawLabel('COMPUTE PARTITION',computeCenter.x,nodeOrigin.y - 11);
    this.drawLine(computeCenter,burstEntry,.4);
    this.drawPacket([computeCenter,burstEntry],time * .3);
    this.drawBox(burst.x,burst.y,burst.w,burst.h,'BURST BUFFER',this.step === 1,4);

    const laneCount = 5;
    for (let lane = 0; lane < laneCount; lane += 1) {
      const offset = (lane - 2) * 12;
      const start = { x:burstExit.x, y:burstExit.y + offset };
      const end = { x:arrayEntry.x, y:arrayEntry.y + offset };
      this.drawLine(start,end,this.step === 1 ? .56 : .2,lane % 2 === 1);
      this.drawPacket([start,end],time * (.22 + this.step * .05) + lane * .18,2);
      if (this.step === 1) this.drawPacket([start,end],time * .3 + lane * .18 + .48,1.7);
    }
    this.drawStorage(array.x,array.y,array.w,array.h,'PARALLEL FILE',time,this.step > 0);
    if (this.step === 2) {
      const commit = { x:width * .62, y:height * .77 };
      this.drawLine({ x:array.x + array.w / 2, y:array.y + array.h },commit,.6,true);
      this.drawNode(commit.x,commit.y,12,'CHECKPOINT',time * 2.5,true);
      this.drawPacket([{ x:array.x + array.w / 2, y:array.y + array.h },commit],time * .25);
    }
    this.drawFocus(burst.x + burst.w / 2,burst.y + burst.h / 2,time,30);
    this.drawGauge(width * .055,height * .79,width * .27,.78 + Math.sin(time * 1.8) * .1,'PARALLEL THROUGHPUT');
  }

  drawInfrastructure(time) {
    const width = this.width;
    const height = this.height;
    const layerWidth = Math.max(90, Math.min(145, width * .18));
    const layerHeight = Math.max(42, height * .15);
    const layerX = width * .075;
    const layerYs = [height * .17, height * .41, height * .65];
    const core = { x:width * .46, y:height * .5 };
    const primary = { x:width * .62, y:height * .31, w:Math.max(80, Math.min(116, width * .14)), h:Math.max(92, height * .35) };
    const archive = { x:width * .84, y:height * .39, w:Math.max(58, Math.min(86, width * .1)), h:Math.max(70, height * .27) };
    const labels = ['EDGE LAYER','CORE SERVICES','DATA PLATFORM'];

    layerYs.forEach((y,index) => {
      this.drawBox(layerX,y,layerWidth,layerHeight,labels[index],index === this.step,2);
      const start = { x:layerX + layerWidth, y:y + layerHeight / 2 };
      this.drawLine(start,core,this.step === 1 ? .48 : .23,index === 0);
      this.drawPacket([start,core],time * (.17 + this.step * .035) + index * .31,2.1);
    });
    this.drawNode(core.x,core.y,Math.max(15,Math.min(22,width * .026)),'DATA FABRIC',time * 2.2,this.step === 1);
    const primaryEntry = { x:primary.x, y:primary.y + primary.h / 2 };
    this.drawLine(core,primaryEntry,.52);
    this.drawPacket([core,primaryEntry],time * .27);
    if (this.step === 1) this.drawPacket([core,primaryEntry],time * .27 + .5,1.9);
    this.drawStorage(primary.x,primary.y,primary.w,primary.h,'PRIMARY TIER',time,this.step > 0);
    const primaryExit = { x:primary.x + primary.w, y:primary.y + primary.h / 2 };
    const archiveEntry = { x:archive.x, y:archive.y + archive.h / 2 };
    this.drawLine(primaryExit,archiveEntry,this.step === 2 ? .67 : .18,true);
    this.drawStorage(archive.x,archive.y,archive.w,archive.h,'ARCHIVE',time + .7,this.step === 2);
    if (this.step > 0) this.drawPacket([primaryExit,archiveEntry],time * (this.step === 2 ? .24 : .13));
    if (this.step === 2) this.drawPacket([archiveEntry,primaryExit],time * .18 + .38,1.8);
    this.drawFocus(this.step === 2 ? archive.x + archive.w / 2 : core.x,this.step === 2 ? archive.y + archive.h / 2 : core.y,time,30);
    this.drawGauge(width * .075,height * .87,width * .22,.66 + Math.sin(time * 1.6) * .09,'TIER EFFICIENCY');
  }
}


const workloadWizard = select('#workload-wizard');
const workloadWizardCanvas = select('#workload-wizard-canvas');
const workloadVisualizer = new WorkloadWizardVisualizer(workloadWizardCanvas);
const workloadCards = selectAll('.workload-card[data-workload-key]');
const workloadWizardTitle = select('[data-workload-wizard-title]', workloadWizard);
const workloadWizardSummary = select('[data-workload-wizard-summary]', workloadWizard);
const workloadWizardNumber = select('[data-workload-wizard-number]', workloadWizard);
const workloadWizardIcon = select('[data-workload-wizard-icon]', workloadWizard);
const workloadWizardStepLabel = select('[data-workload-wizard-step-label]', workloadWizard);
const workloadWizardStepTitle = select('[data-workload-wizard-step-title]', workloadWizard);
const workloadWizardStepDescription = select('[data-workload-wizard-step-description]', workloadWizard);
const workloadWizardSceneLabel = select('[data-workload-wizard-scene-label]', workloadWizard);
const workloadWizardSignals = selectAll('[data-workload-wizard-signal]', workloadWizard);
const workloadWizardInsight = select('[data-workload-wizard-insight]', workloadWizard);
const workloadWizardPoints = select('[data-workload-wizard-points]', workloadWizard);
const workloadWizardMetricLabels = selectAll('[data-workload-wizard-metric-label]', workloadWizard);
const workloadWizardMetricValues = selectAll('[data-workload-wizard-metric-value]', workloadWizard);
const workloadWizardStepButtons = selectAll('[data-workload-wizard-step]', workloadWizard);
const workloadWizardPrevious = select('[data-workload-wizard-prev]', workloadWizard);
const workloadWizardNext = select('[data-workload-wizard-next]', workloadWizard);
const workloadWizardProgress = select('[data-workload-wizard-progress]', workloadWizard);
const workloadWizardSelectedCard = select('[data-workload-wizard-selected]', workloadWizard);
const workloadWizardStage = select('[data-workload-wizard-stage]', workloadWizard);
const workloadWizardDetail = select('.workload-wizard-detail-grid', workloadWizard);
let activeWorkloadCard = null;
let activeWorkloadKey = 'ai';
let activeWorkloadStep = 0;

const animateWorkloadUpdate = () => {
  if (workloadReducedMotion) return;
  [workloadWizardStage, workloadWizardDetail].forEach((element, index) => {
    if (typeof element?.animate !== 'function') return;
    element.animate([
      { opacity:.38, transform:'translateY(' + (index ? 7 : 4) + 'px)' },
      { opacity:1, transform:'none' },
    ], { duration:360 + index * 80, easing:'cubic-bezier(.16,1,.3,1)' });
  });
};

const renderWorkloadWizardStep = (step, animate = true) => {
  const category = workloadWizardData[activeWorkloadKey];
  const detail = category.steps[step];
  const definition = workloadWizardSteps[step];
  activeWorkloadStep = step;
  workloadWizardStepLabel.textContent = 'Step ' + String(step + 1).padStart(2, '0') + ' / 03';
  workloadWizardStepTitle.textContent = definition.title;
  workloadWizardStepDescription.textContent = definition.description;
  workloadWizardInsight.textContent = detail.insight;
  workloadWizardProgress.textContent = String(step + 1) + ' of 3';
  workloadWizardPrevious.disabled = step === 0;
  workloadWizardNext.innerHTML = step === 2 ? 'Close explorer <span aria-hidden="true">&times;</span>' : 'Continue <span aria-hidden="true">&rarr;</span>';
  workloadWizardPoints.replaceChildren(...detail.points.map((point) => {
    const item = document.createElement('li');
    item.textContent = point;
    return item;
  }));
  detail.metrics.forEach((metric, index) => {
    workloadWizardMetricLabels[index].textContent = metric[0];
    workloadWizardMetricValues[index].textContent = metric[1];
  });
  workloadWizardStepButtons.forEach((button, index) => {
    const isActive = index === step;
    button.classList.toggle('is-active', isActive);
    if (isActive) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  workloadVisualizer.setStep(step);
  if (animate) animateWorkloadUpdate();
};

const openWorkloadWizard = (card) => {
  const key = card.dataset.workloadKey;
  if (!workloadWizard || !workloadWizardData[key]) return;
  activeWorkloadCard = card;
  activeWorkloadKey = key;
  const category = workloadWizardData[key];
  const sourceRect = card.getBoundingClientRect();
  const cardTitle = select('h3', card)?.innerText.replace(/\s+/g, ' ').trim() || category.label;
  workloadWizardNumber.textContent = card.firstElementChild?.textContent || '';
  workloadWizardIcon.textContent = select('.workload-icon', card)?.textContent || '';
  workloadWizardTitle.textContent = cardTitle;
  workloadWizardSummary.textContent = select('p', card)?.textContent || '';
  workloadWizardSceneLabel.textContent = category.label;
  workloadWizardSignals.forEach((signal, index) => { signal.textContent = category.signals[index]; });
  workloadWizardStage.setAttribute('aria-label', cardTitle + ' animated storage topology');
  renderWorkloadWizardStep(0, false);
  card.classList.add('is-wizard-source');
  workloadWizard.showModal();
  document.body.classList.add('workload-wizard-open');
  workloadVisualizer.open(key);

  scope.requestAnimationFrame(() => scope.requestAnimationFrame(() => {
    const targetRect = workloadWizardSelectedCard.getBoundingClientRect();
    if (!workloadReducedMotion && typeof workloadWizardSelectedCard.animate === 'function' && targetRect.width && targetRect.height) {
      workloadWizardSelectedCard.animate([
        {
          opacity:.3,
          transform:'translate(' + (sourceRect.left - targetRect.left) + 'px,' + (sourceRect.top - targetRect.top) + 'px) scale(' + (sourceRect.width / targetRect.width) + ',' + (sourceRect.height / targetRect.height) + ')',
        },
        { opacity:1, transform:'none' },
      ], { duration:680, easing:'cubic-bezier(.16,1,.3,1)' });
    }
    workloadWizardTitle.focus({ preventScroll:true });
  }));
};

const closeWorkloadWizard = () => {
  if (workloadWizard?.open) workloadWizard.close();
};

workloadCards.forEach((card) => scope.on(card, 'click', () => openWorkloadWizard(card)));

workloadWizardStepButtons.forEach((button) => {
  scope.on(button, 'click', () => renderWorkloadWizardStep(Number(button.dataset.workloadWizardStep)));
  scope.on(button, 'keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextStep = (Number(button.dataset.workloadWizardStep) + direction + workloadWizardStepButtons.length) % workloadWizardStepButtons.length;
    renderWorkloadWizardStep(nextStep);
    workloadWizardStepButtons[nextStep].focus();
  });
});

scope.on(workloadWizardPrevious, 'click', () => renderWorkloadWizardStep(Math.max(0, activeWorkloadStep - 1)));
scope.on(workloadWizardNext, 'click', () => {
  if (activeWorkloadStep === workloadWizardSteps.length - 1) closeWorkloadWizard();
  else renderWorkloadWizardStep(activeWorkloadStep + 1);
});
scope.on(select('[data-workload-wizard-close]', workloadWizard), 'click', closeWorkloadWizard);
scope.on(workloadWizard, 'click', (event) => {
  if (event.target === workloadWizard) closeWorkloadWizard();
});
scope.on(workloadWizard, 'close', () => {
  document.body.classList.remove('workload-wizard-open');
  workloadVisualizer.close();
  activeWorkloadCard?.classList.remove('is-wizard-source');
  const returnTarget = activeWorkloadCard;
  activeWorkloadCard = null;
  returnTarget?.focus({ preventScroll:true });
});
scope.on(document, 'visibilitychange', () => {
  if (!workloadWizard?.open || workloadReducedMotion) return;
  if (document.hidden) workloadVisualizer.stop();
  else workloadVisualizer.start();
});
}
