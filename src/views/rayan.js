// Content for the shared application router.
export default {
  title: 'Rayan Automation Solutions | DeepIQ',
  description:
    'Rayan Automation Solutions connects intelligent hardware, software and Smart Hub technology for residential, commercial and industrial environments.',
  theme: '#03070d',
  body: `
    <button class="skip-link" type="button" data-skip-content>Skip to content</button>
    <div class="reading-progress" aria-hidden="true"><span></span></div>
    <div class="cursor-aura" aria-hidden="true"></div>

    <header class="rayan-header" data-header>
      <a class="deepiq-brand" href="/" aria-label="DeepIQ home">
        <img src="/deepiq-logo.svg" alt="" />
        <span>DEEP</span><b>IQ</b>
      </a>
      <nav class="desktop-nav" aria-label="Rayan page navigation">
        <a href="/rayan/technology">Technology</a>
        <a href="/rayan/smart-hub">Smart Hub</a>
        <a href="/rayan/environments">Environments</a>
        <a href="/rayan/sustainability">Sustainability</a>
        <a href="/rayan/why">Why Rayan</a>
      </nav>
      <a class="header-cta" href="/contact">Explore with DeepIQ <span aria-hidden="true">&nearr;</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="rayan-mobile-nav" aria-label="Open navigation"><span></span><span></span></button>
    </header>

    <div class="mobile-nav" id="rayan-mobile-nav" aria-hidden="true">
      <nav aria-label="Mobile navigation">
        <a href="/rayan/technology"><span>01</span>Technology</a>
        <a href="/rayan/smart-hub"><span>02</span>Smart Hub</a>
        <a href="/rayan/environments"><span>03</span>Environments</a>
        <a href="/rayan/sustainability"><span>04</span>Sustainability</a>
        <a href="/rayan/why"><span>05</span>Why Rayan</a>
        <a href="https://rayan-iot.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit the official Rayan website (opens in a new tab)"><span>06</span>Official Rayan website</a>
        <a href="/contact"><span>07</span>Talk to DeepIQ</a>
      </nav>
      <a class="mobile-back" href="/">&larr; Back to DeepIQ</a>
    </div>

    <main id="main-content">
      <section class="rayan-hero" id="top" aria-labelledby="rayan-title">
        <div class="hero-grid" aria-hidden="true"></div>
        <div class="hero-orbit orbit-one" aria-hidden="true"></div>
        <div class="hero-orbit orbit-two" aria-hidden="true"></div>
        <div class="hero-vignette" aria-hidden="true"></div>

        <div class="hero-content">
          <div class="hero-eyebrow"><span>DEEPIQ &times; RAYAN</span><i></i><span>CONNECTED AUTOMATION</span></div>
          <h1 id="rayan-title"><span>Rayan</span><em>Automation Solutions</em></h1>
          <p class="hero-manifesto">Smarter automation.<br />Connected living.<br /><strong>Sustainable future.</strong></p>
          <p class="hero-lead">Intelligent hardware, connected software and practical automation working together to make every environment more efficient, secure and responsive.</p>
          <div class="hero-actions">
            <a class="primary-button" href="/contact">Explore with DeepIQ <span aria-hidden="true">&nearr;</span></a>
            <a class="ghost-button" href="/rayan/smart-hub">Discover Rayan <span aria-hidden="true">&darr;</span></a>
          </div>
        </div>

        <div class="rayan-hero-visual" role="img" aria-label="Animated Rayan Smart Hub connects lighting, home controls, security, energy monitoring and climate control. Signals travel from devices to the hub and commands return to the connected environment.">
          <svg viewBox="0 0 620 620" aria-hidden="true" focusable="false">
            <defs>
              <radialGradient id="rayan-hero-glow"><stop stop-color="var(--blue)" stop-opacity=".42"/><stop offset="1" stop-color="var(--blue)" stop-opacity="0"/></radialGradient>
              <linearGradient id="rayan-hero-hub-top" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#147ac3"/><stop offset="1" stop-color="#082d52"/></linearGradient>
              <linearGradient id="rayan-hero-hub-left" x1="0" x2="1"><stop stop-color="#04101c"/><stop offset="1" stop-color="#0a3257"/></linearGradient>
              <linearGradient id="rayan-hero-hub-right" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--blue)"/><stop offset="1" stop-color="#071b31"/></linearGradient>
              <linearGradient id="rayan-hero-device-fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0a2135"/><stop offset="1" stop-color="#050d17"/></linearGradient>
            </defs>

            <circle cx="310" cy="310" r="230" fill="url(#rayan-hero-glow)"/>
            <circle class="rayan-hero-orbit" cx="310" cy="310" r="226"/>
            <g class="rayan-hero-links">
              <path id="rayan-hero-home-link" d="M164 192 C226 192 205 284 252 308"/>
              <path id="rayan-hero-light-link" d="M310 126 V248"/>
              <path id="rayan-hero-security-link" d="M454 192 C392 192 415 284 368 308"/>
              <path id="rayan-hero-energy-link" d="M200 480 C246 480 230 392 284 355"/>
              <path id="rayan-hero-climate-link" d="M420 480 C374 480 390 392 336 355"/>
            </g>
            <g class="rayan-hero-packets">
              <circle r="3.5"><animateMotion dur="3.1s" repeatCount="indefinite"><mpath href="#rayan-hero-home-link"/></animateMotion></circle>
              <circle r="3.5"><animateMotion dur="2.6s" begin="-1s" repeatCount="indefinite"><mpath href="#rayan-hero-light-link"/></animateMotion></circle>
              <circle r="3.5"><animateMotion dur="3.4s" begin="-1.6s" repeatCount="indefinite"><mpath href="#rayan-hero-security-link"/></animateMotion></circle>
              <circle r="3.5"><animateMotion dur="3.8s" begin="-.9s" repeatCount="indefinite"><mpath href="#rayan-hero-energy-link"/></animateMotion></circle>
              <circle r="3.5"><animateMotion dur="3.3s" begin="-2s" repeatCount="indefinite"><mpath href="#rayan-hero-climate-link"/></animateMotion></circle>
              <circle class="rayan-hero-command" r="3"><animateMotion dur="3.1s" begin="-1.55s" keyPoints="1;0" keyTimes="0;1" calcMode="linear" repeatCount="indefinite"><mpath href="#rayan-hero-home-link"/></animateMotion></circle>
              <circle class="rayan-hero-command" r="3"><animateMotion dur="3.3s" begin="-.35s" keyPoints="1;0" keyTimes="0;1" calcMode="linear" repeatCount="indefinite"><mpath href="#rayan-hero-climate-link"/></animateMotion></circle>
            </g>

            <g class="rayan-hero-device">
              <rect x="24" y="142" width="140" height="106" rx="6"/>
              <g class="rayan-hero-icon"><path d="M73 192v-22l21-17 21 17v22H73Z M68 174l26-21 26 21 M88 192v-17h12v17"/><path d="M107 163c6-7 16-7 22 0m-17 5c3-3 9-3 12 0"/></g>
              <text x="94" y="226">HOME CONTROL</text>
            </g>
            <g class="rayan-hero-device">
              <rect x="246" y="32" width="128" height="94" rx="6"/>
              <g class="rayan-hero-icon"><path d="M301 92h18m-15 5h12 M301 87v-6c-13-10-9-29 9-29s22 19 9 29v6h-18Z M310 42v-7 M290 50l-5-5m45 5 5-5 M285 67h-7m57 0h7"/></g>
              <text x="310" y="116">LIGHTING</text>
            </g>
            <g class="rayan-hero-device">
              <rect x="454" y="142" width="140" height="106" rx="6"/>
              <g class="rayan-hero-icon"><path d="m524 156 23 9v15c0 15-15 25-23 29-8-4-23-14-23-29v-15l23-9Z M514 181l7 7 15-17"/></g>
              <text x="524" y="226">SECURITY</text>
            </g>
            <g class="rayan-hero-device">
              <rect x="52" y="432" width="148" height="110" rx="6"/>
              <g class="rayan-hero-icon"><path d="M109 486a24 24 0 1 1 34 0 M126 463l12-11 M106 458l-5-3m25-13v-6m20 22 5-3 M127 472l-7 12h9l-6 14"/></g>
              <text x="126" y="522">ENERGY</text>
            </g>
            <g class="rayan-hero-device">
              <rect x="420" y="432" width="148" height="110" rx="6"/>
              <g class="rayan-hero-icon"><path d="M479 448a6 6 0 0 1 12 0v29a12 12 0 1 1-12 0v-29Z M485 458v28"/><circle cx="485" cy="487" r="4"/><path d="M507 452v27m-12-20 24 13m-24 0 24-13m-12-7-4 4m4-4 4 4m-4 23-4-4m4 4 4-4"/></g>
              <text x="494" y="522">CLIMATE</text>
            </g>

            <ellipse class="rayan-hero-hub-shadow" cx="310" cy="389" rx="92" ry="18"/>
            <g class="rayan-hero-hub-rings">
              <ellipse cx="310" cy="364" rx="115" ry="46"/>
              <ellipse cx="310" cy="364" rx="137" ry="57"/>
            </g>
            <g class="rayan-hero-hub">
              <path class="rayan-hero-hub-left" d="m232 288 78 42v48l-78-42v-48Z"/>
              <path class="rayan-hero-hub-right" d="m310 330 78-42v48l-78 42v-48Z"/>
              <path class="rayan-hero-hub-top" d="m232 288 78-42 78 42-78 42-78-42Z"/>
              <path class="rayan-hero-hub-trim" d="m243 288 67-35 67 35-67 35-67-35Z"/>
              <g class="rayan-hero-hub-mark"><path d="M291 281q19-14 38 0m-31 7q12-9 24 0m-17 6q5-4 10 0"/><circle cx="310" cy="300" r="2"/></g>
              <path class="rayan-hero-hub-vents" d="m246 314 17 9m-17-2 17 9m-17-2 17 9"/>
              <circle class="rayan-hero-hub-led" cx="366" cy="325" r="3"/>
            </g>
            <text class="rayan-hero-hub-title" x="310" y="432">RAYAN SMART HUB</text>
            <text class="rayan-hero-visual-caption" x="310" y="574">CONNECTED DEVICES. COORDINATED ACTION.</text>
          </svg>
        </div>

        <div class="hero-system" aria-label="Connected automation system">
          <span class="system-live"><i></i> SYSTEM CONNECTED</span>
          <div class="system-sequence" aria-hidden="true">
            <span>Sense</span><i></i><span>Understand</span><i></i><span>Automate</span>
          </div>
        </div>
        <div class="hero-coordinate" aria-hidden="true">HARDWARE &middot; SOFTWARE &middot; CONNECTIVITY</div>
      </section>

      <section class="technology-section section-space" id="technology" aria-labelledby="technology-heading">
        <div class="section-marker reveal"><span>01</span><i></i><p>TECHNOLOGY BUILT FOR INTELLIGENT AUTOMATION</p></div>
        <div class="technology-intro">
          <div class="reveal">
            <p class="overline">ONE CONNECTED FOUNDATION</p>
            <h2 id="technology-heading">Technology that works<br /><em>quietly in the background.</em></h2>
          </div>
          <div class="technology-copy reveal">
            <p class="lead">Rayan develops and delivers connected hardware and software designed to provide a reliable, scalable foundation for automation projects.</p>
            <p>Its technology connects devices, systems and applications so they can respond as one environment&mdash;improving convenience, optimizing resources, reducing operating costs and creating a simpler experience for the people who use it.</p>
          </div>
        </div>

        <div class="automation-architecture reveal" role="img" aria-label="Rayan architecture connects intelligent hardware through the Smart Hub to software and automated outcomes">
          <article class="architecture-node architecture-hardware">
            <span class="node-number">01</span>
            <div class="architecture-icon hardware-icon" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
            <small>INPUT LAYER</small>
            <h3>Intelligent hardware</h3>
            <p>Sensors, controls and connected devices capture what is happening in the environment.</p>
            <ul><li>Sense</li><li>Measure</li><li>Control</li></ul>
          </article>
          <div class="architecture-flow" aria-hidden="true"><span></span><i></i><i></i><i></i></div>
          <article class="architecture-node architecture-hub">
            <span class="node-number">02</span>
            <div class="architecture-icon hub-icon" aria-hidden="true"><span></span><i></i><i></i><i></i><i></i></div>
            <small>CONNECTION LAYER</small>
            <h3>Rayan Smart Hub</h3>
            <p>The central connection point understands inputs, coordinates systems and runs automation logic.</p>
            <ul><li>Connect</li><li>Coordinate</li><li>Automate</li></ul>
          </article>
          <div class="architecture-flow flow-return" aria-hidden="true"><span></span><i></i><i></i><i></i></div>
          <article class="architecture-node architecture-software">
            <span class="node-number">03</span>
            <div class="architecture-icon software-icon" aria-hidden="true"><b></b><span></span><span></span><span></span></div>
            <small>EXPERIENCE LAYER</small>
            <h3>Connected software</h3>
            <p>Applications turn live information into clear controls, useful insight and intelligent action.</p>
            <ul><li>Monitor</li><li>Decide</li><li>Respond</li></ul>
          </article>
        </div>
      </section>

      <section class="hub-section" id="smart-hub" aria-labelledby="hub-heading">
        <div class="hub-copy section-space">
          <div class="section-marker reveal"><span>02</span><i></i><p>OUR SMART HUB ECOSYSTEM</p></div>
          <p class="overline reveal">THE INTELLIGENT CONNECTION POINT</p>
          <h2 class="reveal" id="hub-heading">One hub.<br /><em>Every environment in sync.</em></h2>
          <p class="lead reveal">At the heart of the Rayan ecosystem, the Smart Hub enables devices, systems and applications to communicate and operate together as one connected environment.</p>
          <p class="reveal">It provides a flexible foundation for a smart home, an automated commercial facility or an industrial operation&mdash;coordinating information and actions without adding complexity for the user.</p>
          <ol class="hub-process reveal" aria-label="How the Rayan Smart Hub works">
            <li><span>01</span><div><strong>Listen</strong><p>Connected devices report conditions and activity.</p></div></li>
            <li><span>02</span><div><strong>Understand</strong><p>Rules and software interpret what the environment needs.</p></div></li>
            <li><span>03</span><div><strong>Coordinate</strong><p>The hub sends the right command to the right system.</p></div></li>
            <li><span>04</span><div><strong>Improve</strong><p>People gain comfort, control, efficiency and clearer insight.</p></div></li>
          </ol>
        </div>

        <div class="hub-visual" role="img" aria-label="Animated Smart Hub connecting a home, commercial building and industrial facility">
          <div class="hub-visual-grid" aria-hidden="true"></div>
          <span class="hub-visual-label label-top">LIVE AUTOMATION MAP</span>
          <span class="hub-visual-label label-status"><i></i> 3 ENVIRONMENTS ONLINE</span>
          <svg class="hub-connections" viewBox="0 0 760 620" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="rayan-line-home" x1="0" x2="1"><stop stop-color="var(--cyan)" stop-opacity=".25"/><stop offset="1" stop-color="var(--cyan)"/></linearGradient>
              <linearGradient id="rayan-line-work" x1="1" x2="0"><stop stop-color="var(--violet)" stop-opacity=".25"/><stop offset="1" stop-color="var(--violet)"/></linearGradient>
              <linearGradient id="rayan-line-industry" x1="1" x2="0"><stop stop-color="var(--blue-bright)" stop-opacity=".25"/><stop offset="1" stop-color="var(--blue-bright)"/></linearGradient>
            </defs>
            <path class="connection-path path-home" d="M380 310 C285 310 250 170 145 155"/>
            <path class="connection-path path-work" d="M380 310 C485 285 510 150 630 142"/>
            <path class="connection-path path-industry" d="M380 310 C485 350 510 487 630 492"/>
            <g class="connection-packets">
              <circle r="4" fill="var(--cyan)"><animateMotion dur="3.6s" repeatCount="indefinite" path="M145 155 C250 170 285 310 380 310"/></circle>
              <circle r="4" fill="var(--violet)"><animateMotion dur="4.2s" begin="-.8s" repeatCount="indefinite" path="M630 142 C510 150 485 285 380 310"/></circle>
              <circle r="4" fill="var(--blue-bright)"><animateMotion dur="3.9s" begin="-1.7s" repeatCount="indefinite" path="M380 310 C485 350 510 487 630 492"/></circle>
            </g>
          </svg>
          <div class="ecosystem-node home-node">
            <div class="ecosystem-symbol home-symbol" aria-hidden="true"><span></span><i></i></div>
            <small>RESIDENTIAL</small><strong>Connected living</strong><span>Comfort &middot; Security &middot; Energy</span>
          </div>
          <div class="ecosystem-node work-node">
            <div class="ecosystem-symbol building-symbol" aria-hidden="true"><span></span><i></i><i></i><i></i></div>
            <small>COMMERCIAL</small><strong>Intelligent operations</strong><span>Control &middot; Monitoring &middot; Insight</span>
          </div>
          <div class="ecosystem-node industry-node">
            <div class="ecosystem-symbol factory-symbol" aria-hidden="true"><span></span><i></i><b></b></div>
            <small>INDUSTRIAL</small><strong>Connected processes</strong><span>Efficiency &middot; Resources &middot; Control</span>
          </div>
          <div class="central-hub" aria-hidden="true">
            <span class="hub-ring ring-a"></span><span class="hub-ring ring-b"></span>
            <div><small>RAYAN</small><strong>SMART<br />HUB</strong><i></i></div>
          </div>
          <div class="hub-legend" aria-hidden="true"><span><i></i>INPUT</span><span><i></i>INTELLIGENCE</span><span><i></i>ACTION</span></div>
        </div>
      </section>

      <section class="environments-section section-space" id="environments" aria-labelledby="environments-heading">
        <div class="section-marker reveal"><span>03</span><i></i><p>SMART SOLUTIONS FOR EVERY ENVIRONMENT</p></div>
        <div class="environments-head">
          <h2 class="reveal" id="environments-heading">Designed around the space.<br /><em>Built around the people in it.</em></h2>
          <p class="lead reveal">Rayan solutions adapt to different operating requirements, from everyday living to complex business and industrial environments.</p>
        </div>
        <div class="environment-grid">
          <article class="environment-card residential-card reveal">
            <span class="card-number">01 / RESIDENTIAL</span>
            <div class="environment-motion motion-home" aria-hidden="true">
              <span class="motion-outline"></span><i class="motion-signal signal-a"></i><i class="motion-signal signal-b"></i><i class="motion-signal signal-c"></i><b></b>
            </div>
            <h3>Residential<br />Automation</h3>
            <p>Transform homes into intelligent, connected living spaces with greater comfort, convenience, security and energy efficiency.</p>
            <ul><li>Lighting and climate</li><li>Safety and security</li><li>Energy awareness</li></ul>
          </article>
          <article class="environment-card commercial-card reveal">
            <span class="card-number">02 / COMMERCIAL</span>
            <div class="environment-motion motion-building" aria-hidden="true">
              <span class="motion-outline"></span><i></i><i></i><i></i><i></i><b></b>
            </div>
            <h3>Commercial<br />Automation</h3>
            <p>Help businesses optimize buildings and operations through intelligent control, monitoring, energy management and automation.</p>
            <ul><li>Building control</li><li>Operational monitoring</li><li>Energy management</li></ul>
          </article>
          <article class="environment-card industrial-card reveal">
            <span class="card-number">03 / INDUSTRIAL</span>
            <div class="environment-motion motion-factory" aria-hidden="true">
              <span class="motion-outline"></span><i></i><i></i><i></i><b></b>
            </div>
            <h3>Industrial<br />Automation</h3>
            <p>Connect industrial environments to improve process control, resource utilization, monitoring and operational efficiency.</p>
            <ul><li>Process visibility</li><li>Connected control</li><li>Resource optimization</li></ul>
          </article>
        </div>
      </section>

      <section class="quality-section" aria-labelledby="quality-heading">
        <div class="quality-track" aria-hidden="true"><span>RELIABILITY</span><i>&bull;</i><span>PERFORMANCE</span><i>&bull;</i><span>DURABILITY</span><i>&bull;</i><span>SIMPLICITY</span><i>&bull;</i><span>RELIABILITY</span><i>&bull;</i><span>PERFORMANCE</span><i>&bull;</i><span>DURABILITY</span><i>&bull;</i><span>SIMPLICITY</span></div>
        <div class="quality-inner section-space">
          <div class="section-marker reveal"><span>04</span><i></i><p>QUALITY YOU CAN RELY ON</p></div>
          <div class="quality-grid">
            <div class="reveal">
              <p class="overline">ENGINEERED FOR THE REAL WORLD</p>
              <h2 id="quality-heading">Build technology that works.<br />Build it to last.<br /><em>Make it deliver real value.</em></h2>
            </div>
            <div class="quality-copy reveal">
              <p class="lead">Quality is at the heart of Rayan&rsquo;s approach. Products are developed for reliability, performance, durability and ease of use across real automation requirements.</p>
              <div class="quality-values">
                <span><b>01</b><strong>Reliable</strong><i></i></span>
                <span><b>02</b><strong>Capable</strong><i></i></span>
                <span><b>03</b><strong>Durable</strong><i></i></span>
                <span><b>04</b><strong>Practical</strong><i></i></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="sustainability-section section-space" id="sustainability" aria-labelledby="sustainability-heading">
        <div class="section-marker reveal"><span>05</span><i></i><p>AUTOMATION WITH SUSTAINABILITY AT ITS CORE</p></div>
        <div class="sustainability-grid">
          <div class="energy-visual reveal" role="img" aria-label="Animated cycle showing how visibility, intelligent control and optimization reduce resource use">
            <div class="energy-grid" aria-hidden="true"></div>
            <span class="energy-ring energy-ring-a" aria-hidden="true"></span><span class="energy-ring energy-ring-b" aria-hidden="true"></span>
            <div class="energy-core"><small>SMARTER USE OF</small><strong>ENERGY</strong><span><i></i>OPTIMIZING</span></div>
            <div class="energy-step step-monitor"><span>01</span><strong>Monitor</strong><small>See consumption clearly</small></div>
            <div class="energy-step step-control"><span>02</span><strong>Control</strong><small>Act only when needed</small></div>
            <div class="energy-step step-improve"><span>03</span><strong>Improve</strong><small>Reduce wasted resources</small></div>
          </div>
          <div class="sustainability-copy reveal">
            <p class="overline">EFFICIENCY WITH A PURPOSE</p>
            <h2 id="sustainability-heading">Smarter decisions.<br /><em>A lighter footprint.</em></h2>
            <p class="lead">The future of automation is about convenience and the responsible use of resources.</p>
            <p>Rayan helps customers monitor and optimize energy consumption, reduce unnecessary resource usage and operate environments more efficiently. Better visibility and intelligent control support lower operating costs and a reduced environmental footprint.</p>
            <div class="sustainability-flow" aria-label="Sustainability outcomes"><span>Visibility</span><i>&rarr;</i><span>Efficiency</span><i>&rarr;</i><span>Lower impact</span></div>
          </div>
        </div>
      </section>

      <section class="why-section section-space" id="why" aria-labelledby="why-heading">
        <div class="section-marker reveal"><span>06</span><i></i><p>WHY RAYAN</p></div>
        <div class="why-head">
          <h2 class="reveal" id="why-heading">Automation made dependable,<br /><em>adaptable and easy to use.</em></h2>
          <p class="lead reveal">Rayan combines control over its own technology with a practical, customer-led approach to each environment.</p>
        </div>
        <div class="principle-list">
          <article class="principle reveal"><span>01</span><div><h3>Own Technology</h3><p>Hardware and software developed around Rayan&rsquo;s own ecosystem provide greater control over quality, functionality and innovation.</p></div><i aria-hidden="true">R</i></article>
          <article class="principle reveal"><span>02</span><div><h3>Reliable Performance</h3><p>Dependable products are designed around the conditions and demands of real-world automation.</p></div><i aria-hidden="true">01</i></article>
          <article class="principle reveal"><span>03</span><div><h3>Scalable Solutions</h3><p>A flexible platform adapts from residential applications to larger commercial and industrial projects.</p></div><i aria-hidden="true">&nearr;</i></article>
          <article class="principle reveal"><span>04</span><div><h3>Customer-Centric Approach</h3><p>Requirements come first, so the resulting technology stays clear, practical and easy to implement.</p></div><i aria-hidden="true">&bull;</i></article>
          <article class="principle reveal"><span>05</span><div><h3>Sustainability Focused</h3><p>Automation helps people and organizations use energy and resources more intelligently.</p></div><i aria-hidden="true">&#9671;</i></article>
        </div>
      </section>

      <section class="future-section" aria-labelledby="future-heading">
        <canvas id="rayan-future-canvas" aria-hidden="true"></canvas>
        <div class="future-grid" aria-hidden="true"></div>
        <div class="future-inner section-space">
          <p class="overline reveal">BUILDING A SMARTER FUTURE</p>
          <h2 class="reveal" id="future-heading">From the home to the workplace<br />and the factory floor, <em>everything connects.</em></h2>
          <p class="lead reveal">Rayan brings together hardware, software, connectivity and automation to create intelligent environments that work better for people and businesses.</p>
          <p class="future-signature reveal">Connecting Technology. <span>Automating Possibilities.</span> Creating a Smarter Future.</p>
          <div class="future-actions reveal">
            <a class="primary-button" href="/contact">Talk to DeepIQ <span aria-hidden="true">&nearr;</span></a>
            <a class="official-link" href="https://rayan-iot.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit the official Rayan website (opens in a new tab)">Visit Rayan <span aria-hidden="true">&nearr;</span></a>
          </div>
        </div>
      </section>
    </main>

    <footer class="rayan-footer">
      <a class="deepiq-brand" href="/" aria-label="DeepIQ home"><img src="/deepiq-logo.svg" alt="" /><span>DEEP</span><b>IQ</b></a>
      <div><strong>RAYAN AUTOMATION SOLUTIONS</strong><span>SMARTER AUTOMATION &middot; CONNECTED LIVING</span></div>
      <nav aria-label="Footer navigation"><a href="/rayan/smart-hub">Smart Hub</a><a href="/rayan/environments">Solutions</a><a href="https://rayan-iot.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit the official Rayan website (opens in a new tab)">Rayan website</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav>
      <small>&copy; <span data-year></span> DeepIQ. All rights reserved.</small>
    </footer>
  `,
};
