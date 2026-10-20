/**
 * LandingPage.jsx — AI Work Flow
 * Minimal redesign: monochrome dark canvas, one orange accent, hairline
 * structure, no gradients or glows. Typography & spacing carry hierarchy.
 * Styles live in ./LandingPage.css (all classes prefixed with `lp-`).
 */
import { useEffect, useRef } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Briefcase,
  Check,
  Database,
  FileOutput,
  Funnel,
  GitBranch,
  KeyRound,
  LayoutTemplate,
  MailOpen,
  MessageSquareText,
  MousePointerClick,
  Plug,
  Rocket,
  Send,
  Sparkles,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import "./LandingPage.css";

/* ─── Raw colour values for SVG (mirror the CSS tokens) ─── */
const C = {
  bg: "#0a0a0b",
  node: "#111113",
  hub: "#141417",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.14)",
  wire: "rgba(255,255,255,0.09)",
  text: "#ededef",
  icon: "#d4d4d8",
  accent: "#f97316",
};

/* ─── Reveal-on-scroll (IntersectionObserver works with any scroll parent) ─── */
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".lp-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

const scrollToId = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

/* ─── Brand mark: two connected nodes ─── */
function LogoMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width="21"
        height="21"
        rx="6"
        fill={C.node}
        stroke={C.lineStrong}
      />
      <path d="M8.5 11h5" stroke={C.text} strokeOpacity="0.45" />
      <circle cx="7" cy="11" r="2.1" fill={C.text} />
      <circle cx="15" cy="11" r="2.1" fill={C.accent} />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FlowDiagram — hero animation
   Inputs → AI hub → outputs. Packets travel in sequence on a 6s loop:
   inputs fire (white), hub processes (accent ring), outputs fire (accent).
   ════════════════════════════════════════════════════════════════════ */
const FLOW_INPUTS = [
  { id: "prompt", label: "Prompt", sub: "input", Icon: MessageSquareText },
  { id: "read", label: "Read Email", sub: "gmail · inbox", Icon: MailOpen },
  { id: "filter", label: "Filter Email", sub: "logic", Icon: Funnel },
  { id: "account", label: "Email Account", sub: "auth", Icon: KeyRound },
];
const FLOW_OUTPUTS = [
  { id: "send", label: "Send Email", sub: "action", Icon: Send },
  {
    id: "template",
    label: "Email Template",
    sub: "template",
    Icon: LayoutTemplate,
  },
  { id: "output", label: "Output", sub: "result", Icon: FileOutput },
  { id: "llama", label: "Llama 3.3", sub: "model", Icon: Sparkles },
];

const LOOP = 6; // seconds per cycle
const TRAVEL = 1.3; // seconds a packet spends on a wire
const kf = (s) => +(s / LOOP).toFixed(4); // seconds → keyTime fraction
const EASE_SPLINES = "0 0 1 1;0.45 0 0.25 1;0 0 1 1";

/** A data packet: short trail + dot, both synced to the same timeline. */
function Packet({ d, start, color }) {
  const a = kf(start);
  const b = kf(start + TRAVEL);
  const kt = `0;${a};${b};1`;
  const opKt = `0;${a};${kf(start + 0.06)};${kf(start + TRAVEL - 0.09)};${b};1`;
  const dur = `${LOOP}s`;
  return (
    <g>
      <path
        d={d}
        pathLength="1"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="0.14 2"
        strokeDashoffset="0.14"
        opacity="0"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0.14;0.14;-0.86;-0.86"
          keyTimes={kt}
          calcMode="spline"
          keySplines={EASE_SPLINES}
          dur={dur}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;0;0.5;0.5;0;0"
          keyTimes={opKt}
          dur={dur}
          repeatCount="indefinite"
        />
      </path>
      <circle r="2.75" fill={color} opacity="0">
        <animateMotion
          path={d}
          keyPoints="0;0;1;1"
          keyTimes={kt}
          calcMode="spline"
          keySplines={EASE_SPLINES}
          dur={dur}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;0;1;1;0;0"
          keyTimes={opKt}
          dur={dur}
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

/** Brief highlight (border / port) at a given moment in the loop. */
function Flash({ at, attr = "stroke-opacity", peak = 0.4, hold = 0.9 }) {
  const t = kf(at);
  return (
    <animate
      attributeName={attr}
      values={`0;0;${peak};0;0`}
      keyTimes={`0;${kf(at - 0.12)};${t};${kf(at + hold)};1`}
      dur={`${LOOP}s`}
      repeatCount="indefinite"
    />
  );
}

function FlowNode({ x, y, w, h, node, delay }) {
  const { Icon } = node;
  return (
    <g className="lp-flow-node" style={{ "--d": `${delay}s` }}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="12"
        fill={C.node}
        stroke={C.line}
      />
      <rect
        x={x + 12}
        y={y + 12}
        width="32"
        height="32"
        rx="9"
        fill="rgba(255,255,255,0.03)"
        stroke={C.line}
      />
      <Icon
        x={x + 20}
        y={y + 20}
        size={16}
        strokeWidth={1.6}
        color={C.icon}
        aria-hidden="true"
      />
      <text x={x + 56} y={y + 25} className="lp-svg-label">
        {node.label}
      </text>
      <text x={x + 56} y={y + 41} className="lp-svg-sub">
        {node.sub}
      </text>
    </g>
  );
}

function FlowDiagram() {
  const W = 960;
  const H = 432;
  const NW = 200;
  const NH = 56;
  const LX = 4;
  const RX = W - 4 - NW;
  const rowY = (i) => 36 + i * 108;
  const CX = W / 2;
  const CY = rowY(0) + NH / 2 + (rowY(3) - rowY(0)) / 2;
  const HS = 120;
  const hubL = CX - HS / 2;
  const hubR = CX + HS / 2;
  const hubT = CY - HS / 2;
  const portY = (i) => CY + (i - 1.5) * 16;

  const curve = (x1, y1, x2, y2) => {
    const k = (x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`;
  };
  const inPath = (i) => curve(LX + NW, rowY(i) + NH / 2, hubL, portY(i));
  const outPath = (i) => curve(hubR, portY(i), RX, rowY(i) + NH / 2);
  const inStart = (i) => 0.3 + i * 0.18;
  const outStart = (i) => 2.35 + i * 0.18;
  const pulseAt = 2.15;
  const hp = kf(pulseAt);
  const hp2 = kf(pulseAt + 0.85);
  const grow = 18;

  return (
    <div className="lp-flow">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Workflow diagram: four input nodes flow into the AI Work Flow engine, which drives four output nodes"
      >
        {/* Column labels */}
        <text x={LX} y="14" className="lp-svg-col">
          INPUTS
        </text>
        <text x={CX} y="14" textAnchor="middle" className="lp-svg-col">
          ENGINE
        </text>
        <text x={RX + NW} y="14" textAnchor="end" className="lp-svg-col">
          OUTPUTS
        </text>

        {/* Wires */}
        {FLOW_INPUTS.map((n, i) => (
          <path
            key={`wi-${n.id}`}
            d={inPath(i)}
            fill="none"
            stroke={C.wire}
            strokeWidth="1.25"
          />
        ))}
        {FLOW_OUTPUTS.map((n, i) => (
          <path
            key={`wo-${n.id}`}
            d={outPath(i)}
            fill="none"
            stroke={C.wire}
            strokeWidth="1.25"
          />
        ))}

        {/* Packets */}
        {FLOW_INPUTS.map((n, i) => (
          <Packet
            key={`pi-${n.id}`}
            d={inPath(i)}
            start={inStart(i)}
            color={C.text}
          />
        ))}
        {FLOW_OUTPUTS.map((n, i) => (
          <Packet
            key={`po-${n.id}`}
            d={outPath(i)}
            start={outStart(i)}
            color={C.accent}
          />
        ))}

        {/* Hub body */}
        <g className="lp-flow-node" style={{ "--d": "0.1s" }}>
          <rect
            x={hubL}
            y={hubT}
            width={HS}
            height={HS}
            rx="26"
            fill={C.hub}
            stroke={C.lineStrong}
          />
          {/* Active border while processing */}
          <rect
            x={hubL}
            y={hubT}
            width={HS}
            height={HS}
            rx="26"
            fill="none"
            stroke={C.accent}
            strokeOpacity="0"
          >
            <animate
              attributeName="stroke-opacity"
              values="0;0;0.65;0.65;0;0"
              keyTimes={`0;${kf(1.5)};${kf(1.75)};${kf(2.8)};${kf(3.2)};1`}
              dur={`${LOOP}s`}
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x={hubL + 8}
            y={hubT + 8}
            width={HS - 16}
            height={HS - 16}
            rx="19"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
          />
          <text
            x={CX}
            y={CY + 6}
            textAnchor="middle"
            className="lp-svg-hub"
          >
            AI
          </text>
          <text
            x={CX}
            y={CY + 26}
            textAnchor="middle"
            className="lp-svg-hub-sub"
          >
            WORKFLOW
          </text>
          {/* Status dot */}
          <circle cx={hubR - 18} cy={hubT + 18} r="3" fill={C.accent}>
            <animate
              attributeName="opacity"
              values="1;0.35;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Hub ports */}
          {FLOW_INPUTS.map((n, i) => (
            <circle
              key={`hpi-${n.id}`}
              cx={hubL}
              cy={portY(i)}
              r="2.5"
              fill={C.bg}
              stroke={C.lineStrong}
            />
          ))}
          {FLOW_OUTPUTS.map((n, i) => (
            <circle
              key={`hpo-${n.id}`}
              cx={hubR}
              cy={portY(i)}
              r="2.5"
              fill={C.bg}
              stroke={C.lineStrong}
            />
          ))}
        </g>

        {/* Input nodes */}
        {FLOW_INPUTS.map((n, i) => {
          const y = rowY(i);
          const fire = inStart(i);
          return (
            <g key={`ni-${n.id}`}>
              <FlowNode
                x={LX}
                y={y}
                w={NW}
                h={NH}
                node={n}
                delay={0.15 + i * 0.08}
              />
              <rect
                x={LX}
                y={y}
                width={NW}
                height={NH}
                rx="12"
                fill="none"
                stroke={C.text}
                strokeOpacity="0"
              >
                <Flash at={fire} peak={0.32} />
              </rect>
              <circle
                cx={LX + NW}
                cy={y + NH / 2}
                r="4"
                fill={C.bg}
                stroke="rgba(255,255,255,0.25)"
              />
              <circle cx={LX + NW} cy={y + NH / 2} r="2" fill={C.text} opacity="0">
                <Flash at={fire} attr="opacity" peak={1} />
              </circle>
            </g>
          );
        })}

        {/* Output nodes */}
        {FLOW_OUTPUTS.map((n, i) => {
          const y = rowY(i);
          const land = outStart(i) + TRAVEL;
          return (
            <g key={`no-${n.id}`}>
              <FlowNode
                x={RX}
                y={y}
                w={NW}
                h={NH}
                node={n}
                delay={0.2 + i * 0.08}
              />
              <rect
                x={RX}
                y={y}
                width={NW}
                height={NH}
                rx="12"
                fill="none"
                stroke={C.accent}
                strokeOpacity="0"
              >
                <Flash at={land} peak={0.55} hold={1} />
              </rect>
              <circle
                cx={RX}
                cy={y + NH / 2}
                r="4"
                fill={C.bg}
                stroke="rgba(255,255,255,0.25)"
              />
              <circle cx={RX} cy={y + NH / 2} r="2" fill={C.accent} opacity="0">
                <Flash at={land} attr="opacity" peak={1} hold={1} />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   CanvasMockup — editor preview for the "Visual canvas" section
   ════════════════════════════════════════════════════════════════════ */
const CANVAS_NODES = [
  { id: "trigger", label: "Email Trigger", sub: "every 5 min", Icon: Zap, x: 20, y: 64 },
  { id: "read", label: "Read Email", sub: "gmail", Icon: MailOpen, x: 20, y: 174 },
  { id: "prompt", label: "Prompt", sub: "system", Icon: MessageSquareText, x: 20, y: 284 },
  { id: "ai", label: "Llama 3.3", sub: "70b · groq", Icon: Sparkles, x: 345, y: 119, selected: true },
  { id: "filter", label: "Filter Email", sub: "if / else", Icon: Funnel, x: 345, y: 244 },
  { id: "template", label: "Email Template", sub: "html", Icon: LayoutTemplate, x: 670, y: 64 },
  { id: "send", label: "Send Email", sub: "smtp", Icon: Send, x: 670, y: 174 },
  { id: "output", label: "Output", sub: "json", Icon: FileOutput, x: 670, y: 284 },
];
const CANVAS_EDGES = [
  ["trigger", "ai"],
  ["read", "ai"],
  ["prompt", "filter"],
  ["ai", "template"],
  ["ai", "send"],
  ["filter", "send"],
  ["filter", "output"],
];

function CanvasMockup() {
  const W = 860;
  const H = 380;
  const NW = 170;
  const NH = 52;
  const byId = Object.fromEntries(CANVAS_NODES.map((n) => [n.id, n]));
  const edgePath = (a, b) => {
    const x1 = a.x + NW;
    const y1 = a.y + NH / 2;
    const x2 = b.x;
    const y2 = b.y + NH / 2;
    const k = Math.max(40, (x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`;
  };
  const ai = byId.ai;

  return (
    <div className="lp-canvas">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Workflow canvas preview">
        {/* Edges */}
        {CANVAS_EDGES.map(([from, to]) => {
          const active = from === "ai" || to === "ai";
          return (
            <path
              key={`e-${from}-${to}`}
              d={edgePath(byId[from], byId[to])}
              fill="none"
              stroke={active ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.1)"}
              strokeWidth="1.25"
            />
          );
        })}

        {/* Travelling packets */}
        {CANVAS_EDGES.map(([from, to], i) => (
          <circle key={`p-${from}-${to}`} r="2.25" fill={C.text} opacity="0">
            <animateMotion
              path={edgePath(byId[from], byId[to])}
              dur={`${2.4 + (i % 3) * 0.4}s`}
              begin={`${(i * 0.45) % 2.7}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.9;0.9;0"
              keyTimes="0;0.12;0.88;1"
              dur={`${2.4 + (i % 3) * 0.4}s`}
              begin={`${(i * 0.45) % 2.7}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Run badge above selected node */}
        <g>
          <circle cx={ai.x + 6} cy={ai.y - 14} r="2.5" fill={C.accent}>
            <animate attributeName="opacity" values="1;0.35;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x={ai.x + 16} y={ai.y - 10.5} className="lp-svg-sub">
            running · 1.2s
          </text>
        </g>

        {/* Nodes */}
        {CANVAS_NODES.map((n) => {
          const { Icon } = n;
          return (
            <g key={n.id}>
              <rect
                x={n.x}
                y={n.y}
                width={NW}
                height={NH}
                rx="11"
                fill={C.node}
                stroke={n.selected ? C.accent : C.line}
                strokeOpacity={n.selected ? 0.7 : 1}
              />
              <rect
                x={n.x + 10}
                y={n.y + 10}
                width="32"
                height="32"
                rx="8"
                fill={n.selected ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.03)"}
                stroke={n.selected ? "rgba(249,115,22,0.3)" : C.line}
              />
              <Icon
                x={n.x + 18}
                y={n.y + 18}
                size={16}
                strokeWidth={1.6}
                color={n.selected ? C.accent : C.icon}
                aria-hidden="true"
              />
              <text x={n.x + 54} y={n.y + 23} className="lp-svg-label">
                {n.label}
              </text>
              <text x={n.x + 54} y={n.y + 38} className="lp-svg-sub">
                {n.sub}
              </text>
              {[n.x, n.x + NW].map((cx) => (
                <circle
                  key={cx}
                  cx={cx}
                  cy={n.y + NH / 2}
                  r="3.5"
                  fill={C.bg}
                  stroke="rgba(255,255,255,0.25)"
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Page sections
   ════════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { id: "how-it-works", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "canvas", label: "Canvas" },
  { id: "nodes", label: "Nodes" },
];

function Navbar({ onEnter, onNavigateToDocs }) {
  return (
    <header className="lp-nav">
      <div className="lp-container lp-nav__inner">
        <button
          id="nav-logo"
          type="button"
          className="lp-logo"
          onClick={() => document.getElementById("top")?.scrollIntoView({ behavior: "smooth" })}
          aria-label="AI Work Flow — back to top"
        >
          <LogoMark />
          AI Work Flow
        </button>

        <nav className="lp-nav__links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              id={`nav-link-${l.id}`}
              href={`#${l.id}`}
              className="lp-nav__link"
              onClick={scrollToId(l.id)}
            >
              {l.label}
            </a>
          ))}
          <button
            id="nav-docs"
            type="button"
            className="lp-nav__link"
            onClick={onNavigateToDocs}
          >
            Docs
          </button>
        </nav>

        <div className="lp-nav__actions">
          <button
            id="nav-get-started"
            type="button"
            className="lp-btn lp-btn--primary lp-btn--sm"
            onClick={onEnter}
          >
            Vào Demo Ngay <ArrowRight size={14} style={{ display: "inline-block", marginLeft: 4 }} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onEnter, onNavigateToDocs }) {
  return (
    <section id="top" className="lp-hero">
      <div className="lp-container">
        <div className="lp-enter" style={{ "--d": "0.05s" }}>
          <span className="lp-badge">
            <span className="lp-badge__dot" />
            No-code workflow automation
            <span className="lp-badge__sep" />
            <span style={{ color: "var(--text)" }}>Llama 3.3 ready</span>
          </span>
        </div>

        <h1 className="lp-h1 lp-enter" style={{ "--d": "0.12s" }}>
          Automate office work.
          <br />
          <span className="lp-muted">Without writing code.</span>
        </h1>

        <p className="lp-lead lp-enter" style={{ "--d": "0.2s" }}>
          Connect email, documents and AI models on a visual canvas. Build
          powerful automations in minutes — not sprints.
        </p>

        <div className="lp-hero__ctas lp-enter" style={{ "--d": "0.28s" }}>
          <button
            id="hero-start-building"
            type="button"
            className="lp-btn lp-btn--primary lp-btn--lg"
            onClick={onEnter}
          >
            Vào Trải Nghiệm Demo Ngay <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button
            id="hero-view-docs"
            type="button"
            className="lp-btn lp-btn--ghost lp-btn--lg"
            onClick={onNavigateToDocs}
          >
            Read the docs
          </button>
        </div>
        <p className="lp-hero__meta lp-enter" style={{ "--d": "0.34s" }}>
          Free to start · No credit card required
        </p>

        <div className="lp-hero__visual lp-enter" style={{ "--d": "0.45s" }}>
          <FlowDiagram />
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, muted, aside }) {
  return (
    <div className="lp-section-head lp-reveal">
      <div>
        <span className="lp-eyebrow">{eyebrow}</span>
        <h2 className="lp-h2">
          {title} {muted && <span className="lp-muted">{muted}</span>}
        </h2>
      </div>
      {aside && <p className="lp-section-head__aside">{aside}</p>}
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    Icon: Plug,
    title: "Connect your apps",
    desc: "Link email, spreadsheets and calendars in seconds with pre-built connectors.",
  },
  {
    num: "02",
    Icon: Workflow,
    title: "Build the logic",
    desc: "Drag, drop and wire nodes on a visual canvas. Add AI, conditions and loops.",
  },
  {
    num: "03",
    Icon: Zap,
    title: "Let it run",
    desc: "Activate the workflow and watch tasks complete themselves — monitored in real time.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-section">
      <div className="lp-container">
        <SectionHead
          eyebrow="How it works"
          title="Three steps."
          muted="From idea to automation."
          aside="No scripts, no servers, no setup. If you can sketch a flowchart, you can ship an automation."
        />
        <div className="lp-grid lp-grid--3">
          {STEPS.map(({ num, Icon, title, desc }, i) => (
            <article
              key={num}
              className="lp-cell lp-reveal"
              style={{ "--d": `${i * 0.08}s` }}
            >
              <div className="lp-cell__top">
                <span className="lp-icon">
                  <Icon size={18} strokeWidth={1.6} />
                </span>
                <span className="lp-cell__num">{num}</span>
              </div>
              <h3 className="lp-cell__title">{title}</h3>
              <p className="lp-cell__desc">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    Icon: MousePointerClick,
    title: "Drag & drop canvas",
    desc: "Build complex workflows visually. Connect nodes with a click, rearrange freely and see your logic come alive.",
  },
  {
    Icon: Sparkles,
    title: "AI-powered nodes",
    desc: "Embed GPT, Llama and other models directly in your flows. Summarise, classify and generate — automatically.",
  },
  {
    Icon: Activity,
    title: "Real-time monitoring",
    desc: "Watch every run live. Inspect node outputs, catch errors instantly and replay failed steps.",
  },
  {
    Icon: Rocket,
    title: "One-click deploy",
    desc: "Publish with a single click. Schedule it, trigger it via webhook, or run it on demand.",
  },
];

function Features() {
  return (
    <section id="features" className="lp-section">
      <div className="lp-container">
        <SectionHead
          eyebrow="Features"
          title="Everything you need."
          muted="Nothing you don't."
          aside="Four capabilities form the core of every workflow you'll build on AI Work Flow."
        />
        <div className="lp-grid lp-grid--2">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <article
              key={title}
              className="lp-cell lp-cell--feature lp-reveal"
              style={{ "--d": `${(i % 2) * 0.08}s` }}
            >
              <span className="lp-icon">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <h3 className="lp-cell__title">{title}</h3>
              <p className="lp-cell__desc">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const CANVAS_POINTS = [
  "Infinite, zoomable workspace",
  "Live data flowing between nodes",
  "Group, duplicate and version flows",
];

function CanvasShowcase() {
  return (
    <section id="canvas" className="lp-section">
      <div className="lp-container lp-split">
        <div className="lp-split__text lp-reveal">
          <span className="lp-eyebrow">Visual canvas</span>
          <h2 className="lp-h2">
            Design workflows <span className="lp-muted">like a diagram.</span>
          </h2>
          <p>
            Pan, zoom, group and connect. Every node shows what it receives and
            what it sends — so debugging feels like reading a map.
          </p>
          <ul className="lp-checklist">
            {CANVAS_POINTS.map((p) => (
              <li key={p}>
                <span className="lp-checklist__mark">
                  <Check size={12} strokeWidth={2.2} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="lp-reveal" style={{ "--d": "0.1s" }}>
          <div className="lp-panel">
            <div className="lp-panel__bar">
              <div className="lp-panel__dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="lp-panel__title">ai work flow — workflow canvas</span>
              <span className="lp-panel__status">
                <i aria-hidden="true" />
                running
              </span>
            </div>
            <div className="lp-panel__body lp-panel__body--flush">
              <CanvasMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const CATEGORIES = [
  { Icon: Brain, label: "AI", count: "12+", desc: "GPT, Llama, Claude, embeddings, classifiers" },
  { Icon: Briefcase, label: "Office tools", count: "18+", desc: "Email, Sheets, Docs, Calendar, Drive" },
  { Icon: Database, label: "Data processing", count: "10+", desc: "Transform, filter, aggregate and join data" },
  { Icon: GitBranch, label: "Logic control", count: "08+", desc: "If / else, loops, switches, merge, split" },
  { Icon: Wrench, label: "Utilities", count: "14+", desc: "HTTP, webhooks, delays, variables, code" },
];

function NodeLibrary() {
  return (
    <section id="nodes" className="lp-section">
      <div className="lp-container">
        <SectionHead
          eyebrow="Node library"
          title="60+ nodes."
          muted="Zero limits."
          aside="A growing library of building blocks across five categories — mix them freely."
        />
        <div className="lp-list">
          {CATEGORIES.map(({ Icon, label, count, desc }, i) => (
            <div
              key={label}
              className="lp-row lp-reveal"
              style={{ "--d": `${i * 0.05}s` }}
            >
              <span className="lp-icon lp-icon--sm">
                <Icon size={16} strokeWidth={1.6} />
              </span>
              <div className="lp-row__text--stack">
                <div className="lp-row__label">{label}</div>
                <div className="lp-row__desc">{desc}</div>
              </div>
              <div className="lp-row__desc lp-row__desc--wide">{desc}</div>
              <span className="lp-row__count">{count}</span>
              <ArrowUpRight className="lp-row__arrow" size={18} strokeWidth={1.6} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA({ onEnter, onNavigateToDocs }) {
  return (
    <section className="lp-cta">
      <div className="lp-container">
        <div className="lp-cta__box lp-reveal">
          <LogoMark size={44} />
          <h2 className="lp-cta__title">
            Build your first workflow.
            <br />
            <span className="lp-muted">It takes five minutes.</span>
          </h2>
          <p className="lp-lead">
            Join teams automating their office work with AI Work Flow. No credit card
            required.
          </p>
          <div className="lp-hero__ctas">
            <button
              id="cta-start-building"
              type="button"
              className="lp-btn lp-btn--primary lp-btn--lg"
              onClick={onEnter}
            >
              Vào Trải Nghiệm Demo Ngay <ArrowRight size={16} strokeWidth={2} />
            </button>
            <button
              id="cta-view-docs"
              type="button"
              className="lp-btn lp-btn--ghost lp-btn--lg"
              onClick={onNavigateToDocs}
            >
              Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer__inner">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span className="lp-logo" style={{ cursor: "default" }}>
            <LogoMark />
            AI Work Flow
          </span>
          <nav className="lp-footer__links" aria-label="Footer">
            {["About", "Contact", "Privacy", "Terms"].map((link) => (
              <a key={link} id={`footer-${link.toLowerCase()}`} href="#">
                {link}
              </a>
            ))}
          </nav>
        </div>
        <p className="lp-footer__copy">© {new Date().getFullYear()} AI Work Flow</p>
      </div>
    </footer>
  );
}

/* ─── LandingPage (default export) ─── */
export default function LandingPage({ onEnter, onNavigateToDocs = () => {} }) {
  const rootRef = useRef(null);
  useReveal(rootRef);

  useEffect(() => {
    const prev = document.title;
    document.title = "AI Work Flow — No-code workflow automation";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div ref={rootRef} className="lp">
      <Navbar onEnter={onEnter} onNavigateToDocs={onNavigateToDocs} />
      <main>
        <Hero onEnter={onEnter} onNavigateToDocs={onNavigateToDocs} />
        <HowItWorks />
        <Features />
        <CanvasShowcase />
        <NodeLibrary />
        <BottomCTA onEnter={onEnter} onNavigateToDocs={onNavigateToDocs} />
      </main>
      <Footer />
    </div>
  );
}
