// Content for the shared application router.
export default {
  title: 'Rayan Automation Solutions | DeepIQ',
  description:
    'Rayan Automation Solutions connects intelligent hardware, software and Smart Hub technology for residential, commercial and industrial environments.',
  theme: '#031019',
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
      <a class="header-cta" href="https://rayan-iot.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit the official Rayan website (opens in a new tab)">Visit Rayan website <span aria-hidden="true">&nearr;</span></a>
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
        <canvas id="rayan-network-canvas" aria-hidden="true"></canvas>
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
            <a class="primary-button" href="/rayan/smart-hub">Explore the ecosystem <span aria-hidden="true">&darr;</span></a>
            <a class="ghost-button" href="/contact">Talk to DeepIQ <span aria-hidden="true">&nearr;</span></a>
          </div>
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
              <linearGradient id="rayan-line-home" x1="0" x2="1"><stop stop-color="#35d8ff" stop-opacity=".25"/><stop offset="1" stop-color="#35d8ff"/></linearGradient>
              <linearGradient id="rayan-line-work" x1="1" x2="0"><stop stop-color="#8a72ff" stop-opacity=".25"/><stop offset="1" stop-color="#8a72ff"/></linearGradient>
              <linearGradient id="rayan-line-industry" x1="1" x2="0"><stop stop-color="#45efad" stop-opacity=".25"/><stop offset="1" stop-color="#45efad"/></linearGradient>
            </defs>
            <path class="connection-path path-home" d="M380 310 C285 310 250 170 145 155"/>
            <path class="connection-path path-work" d="M380 310 C485 285 510 150 630 142"/>
            <path class="connection-path path-industry" d="M380 310 C485 350 510 487 630 492"/>
            <g class="connection-packets">
              <circle r="4" fill="#35d8ff"><animateMotion dur="3.6s" repeatCount="indefinite" path="M145 155 C250 170 285 310 380 310"/></circle>
              <circle r="4" fill="#8a72ff"><animateMotion dur="4.2s" begin="-.8s" repeatCount="indefinite" path="M630 142 C510 150 485 285 380 310"/></circle>
              <circle r="4" fill="#45efad"><animateMotion dur="3.9s" begin="-1.7s" repeatCount="indefinite" path="M380 310 C485 350 510 487 630 492"/></circle>
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
            <a class="primary-button" href="https://rayan-iot.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit the official Rayan website (opens in a new tab)">Visit official website <span aria-hidden="true">&nearr;</span></a>
            <a class="ghost-button" href="/contact">Explore with DeepIQ <span aria-hidden="true">&nearr;</span></a>
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
