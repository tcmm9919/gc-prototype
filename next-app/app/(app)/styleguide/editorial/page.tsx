"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";

/**
 * Editorial Premium — Direction B.
 * Scope: cream paper bg + Fraunces serif display + Inter body + forest green accent.
 * All styling is scoped via the .editorial wrapper to avoid touching global tokens.
 */

const SWATCHES = [
  { name: "paper", color: "#f7f3ea", desc: "Background — warm cream" },
  { name: "ink", color: "#1d1a14", desc: "Foreground — deep ink" },
  { name: "rule", color: "#dcd5c5", desc: "Hairline rules" },
  { name: "muted", color: "#7a7264", desc: "Secondary text" },
  { name: "forest", color: "#1c4d35", desc: "Primary · deep forest" },
  { name: "terracotta", color: "#b8542c", desc: "Risk · high" },
  { name: "ochre", color: "#bd8a2c", desc: "Risk · medium" },
  { name: "ink-pale", color: "#3a352b", desc: "Display sub-tones" },
];

export default function Page() {
  return (
    <div className="editorial">
      <style jsx>{`
        .editorial {
          --paper: #f7f3ea;
          --paper-tint: #efe9d8;
          --ink: #1d1a14;
          --ink-soft: #3a352b;
          --muted: #7a7264;
          --rule: #dcd5c5;
          --forest: #1c4d35;
          --forest-soft: #2d6a4a;
          --terracotta: #b8542c;
          --ochre: #bd8a2c;
          --brick: #8b3329;
          background: var(--paper);
          color: var(--ink);
          font-family: "Inter Variable", system-ui, sans-serif;
          padding: 4rem 3rem 6rem;
          min-height: 100vh;
          margin: -1.5rem;
          padding-left: calc(3rem + 1.5rem);
          padding-right: calc(3rem + 1.5rem);
        }
        .editorial * {
          box-sizing: border-box;
        }
        .editorial .display {
          font-family: "Fraunces Variable", serif;
          font-feature-settings: "ss01", "ss02", "ss03";
          font-variation-settings: "opsz" 144, "SOFT" 50;
        }
        .editorial .display-headline {
          font-family: "Fraunces Variable", serif;
          font-variation-settings: "opsz" 144, "SOFT" 30, "wght" 500;
          letter-spacing: -0.035em;
          line-height: 0.95;
        }
        .editorial .display-num {
          font-family: "Fraunces Variable", serif;
          font-variation-settings: "opsz" 144, "wght" 400;
          font-feature-settings: "tnum", "lnum";
          letter-spacing: -0.04em;
        }
        .editorial .roman {
          font-family: "Fraunces Variable", serif;
          font-variation-settings: "opsz" 14, "wght" 500;
          font-feature-settings: "smcp";
          letter-spacing: 0.08em;
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
        }
        .editorial .back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--muted);
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: "Fraunces Variable", serif;
          font-variation-settings: "wght" 500;
        }
        .editorial .back:hover {
          color: var(--ink);
        }
        .editorial .masthead {
          border-bottom: 1px solid var(--ink);
          padding-bottom: 1.5rem;
          margin-bottom: 3rem;
        }
        .editorial .masthead-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          font-family: "Fraunces Variable", serif;
        }
        .editorial .section-divider {
          border-top: 1px solid var(--rule);
          padding-top: 1.25rem;
          margin-top: 3rem;
        }
        .editorial .rule {
          border-color: var(--rule);
        }
        .editorial .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
        }
        .editorial .kpi-cell {
          padding: 1.5rem 1rem;
          border-right: 1px solid var(--rule);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .editorial .kpi-cell:last-child {
          border-right: none;
        }
        .editorial .row {
          display: grid;
          grid-template-columns: 110px 1fr 130px 90px 90px;
          gap: 1rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid var(--rule);
          align-items: baseline;
        }
        .editorial .row:last-child {
          border-bottom: 1px solid var(--ink);
        }
        .editorial .row-head {
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
          padding: 0.5rem 0;
        }
        .editorial .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--ink);
          color: var(--paper);
          padding: 0.6rem 1.1rem;
          font-family: "Fraunces Variable", serif;
          font-variation-settings: "wght" 500;
          font-size: 13px;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          text-transform: uppercase;
        }
        .editorial .btn-primary:hover {
          background: var(--forest);
        }
        .editorial .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          color: var(--ink);
          padding: 0.6rem 1.1rem;
          font-family: "Fraunces Variable", serif;
          font-variation-settings: "wght" 500;
          font-size: 13px;
          letter-spacing: 0.04em;
          border: 1px solid var(--ink);
          cursor: pointer;
          text-transform: uppercase;
        }
        .editorial .pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.15rem 0.5rem;
          border: 0.5px solid var(--ink);
          font-family: "Fraunces Variable", serif;
          font-variation-settings: "wght" 400;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .editorial .swatch-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        .editorial .swatch-box {
          height: 80px;
          border: 1px solid var(--ink);
        }
      `}</style>

      {/* Masthead */}
      <div className="masthead">
        <div className="masthead-row">
          <Link href="/styleguide" className="back">
            <ArrowLeft size={12} /> Back to lab
          </Link>
          <span>Direction B</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="roman">Pars I · Editorial Premium</p>
            <h1 className="display-headline" style={{ fontSize: "72px", marginTop: "0.5rem" }}>
              The Compliance Ledger
            </h1>
            <p
              className="display"
              style={{
                fontSize: "18px",
                color: "var(--muted)",
                fontStyle: "italic",
                marginTop: "0.75rem",
                fontVariationSettings: '"opsz" 144, "wght" 400, "SOFT" 100',
              }}
            >
              Premium financial periodical, applied to compliance operations.
            </p>
          </div>
          <button className="btn-primary">
            <Sparkles size={12} />
            Apply globally
          </button>
        </div>
      </div>

      {/* I · Typography */}
      <section>
        <p className="roman">I · Typographic palette</p>
        <h2 className="display-headline" style={{ fontSize: "32px", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Шрифты и масштаб
        </h2>
        <div style={{ borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "2rem 0" }}>
          <p className="roman">Display · Fraunces variable serif</p>
          <p
            className="display-headline"
            style={{ fontSize: "84px", marginTop: "0.5rem", marginBottom: "1rem" }}
          >
            Freedom AI Compliance
          </p>
          <p className="display" style={{ fontSize: "40px", fontVariationSettings: '"opsz" 144, "wght" 500, "ital" 1' }}>
            Карточка клиента
          </p>
          <hr className="rule" style={{ margin: "1.5rem 0", border: 0, borderTop: "1px solid var(--rule)" }} />
          <p className="roman">Body · Inter</p>
          <p style={{ fontSize: "17px", lineHeight: 1.6, marginTop: "0.5rem", maxWidth: "60ch" }}>
            Compliance Officer AI получает каждое новое оповещение сразу после обработки транзакции и анализирует
            контекст: правило, транзакцию и клиента. Решение фиксируется в LLM-логе и аудит-журнале.
          </p>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "0.5rem", maxWidth: "60ch" }}>
            Inter для тела — нейтральный sans, который не борется с Fraunces за внимание.
          </p>
        </div>
      </section>

      {/* II · Palette */}
      <section className="section-divider">
        <p className="roman">II · Color palette</p>
        <h2 className="display-headline" style={{ fontSize: "32px", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Тона на бумаге
        </h2>
        <div className="swatch-grid">
          {SWATCHES.map((s) => (
            <div key={s.name}>
              <div className="swatch-box" style={{ background: s.color }} />
              <div style={{ marginTop: "0.5rem" }}>
                <p className="display" style={{ fontSize: "15px", fontVariationSettings: '"wght" 500' }}>
                  {s.name}
                </p>
                <p style={{ fontSize: "12px", color: "var(--muted)" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* III · KPI */}
      <section className="section-divider">
        <p className="roman">III · Key indicators</p>
        <h2 className="display-headline" style={{ fontSize: "32px", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Сводка операций
        </h2>
        <div className="kpi-grid">
          {[
            { num: "87", label: "Customers", delta: "+3" },
            { num: "39", label: "Open alerts", delta: "+12" },
            { num: "2", label: "Active cases", delta: "−1" },
            { num: "$11.80", label: "LLM cost · 30d", delta: "+$2.40" },
          ].map((kpi) => (
            <div key={kpi.label} className="kpi-cell">
              <p className="roman">{kpi.label}</p>
              <p className="display-num" style={{ fontSize: "56px", lineHeight: 1 }}>
                {kpi.num}
              </p>
              <p
                className="display"
                style={{ fontSize: "13px", color: "var(--muted)", fontVariationSettings: '"wght" 400, "ital" 1' }}
              >
                {kpi.delta} за 30 дней
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* IV · Table */}
      <section className="section-divider">
        <p className="roman">IV · Records</p>
        <h2 className="display-headline" style={{ fontSize: "32px", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Последние операции
        </h2>
        <div className="row row-head" style={{ borderBottom: "1px solid var(--ink)" }}>
          <span className="roman">Date</span>
          <span className="roman">Client · ID</span>
          <span className="roman">Amount</span>
          <span className="roman">Risk</span>
          <span className="roman">Status</span>
        </div>
        {[
          {
            date: "06 May",
            id: "701b2188",
            client: "Дягилев Михаил Владимирович",
            amount: "1 500 000 KZT",
            risk: "Med",
            riskColor: "var(--ochre)",
            status: "Completed",
          },
          {
            date: "06 May",
            id: "aa9e679f",
            client: "Дягилев Михаил Владимирович",
            amount: "200 000 KZT",
            risk: "Low",
            riskColor: "var(--forest-soft)",
            status: "Completed",
          },
          {
            date: "11 Apr",
            id: "7694a2d1",
            client: "Третьякова Алена Алексеевна",
            amount: "121 849 KZT",
            risk: "Low",
            riskColor: "var(--forest-soft)",
            status: "Open",
          },
          {
            date: "10 Apr",
            id: "bc92b017",
            client: "Третьякова Алена Алексеевна",
            amount: "3 832 USD",
            risk: "High",
            riskColor: "var(--terracotta)",
            status: "Review",
          },
        ].map((r) => (
          <div key={r.id} className="row">
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>{r.date}</span>
            <div>
              <p className="display" style={{ fontSize: "16px", fontVariationSettings: '"wght" 500' }}>
                {r.client}
              </p>
              <p style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "monospace" }}>{r.id}</p>
            </div>
            <span
              className="display-num"
              style={{ fontSize: "16px", fontVariationSettings: '"wght" 500' }}
            >
              {r.amount}
            </span>
            <span className="pill" style={{ borderColor: r.riskColor, color: r.riskColor }}>
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: r.riskColor,
                }}
              />
              {r.risk}
            </span>
            <span style={{ fontSize: "13px", color: "var(--muted)", fontStyle: "italic" }}>{r.status}</span>
          </div>
        ))}
      </section>

      {/* V · Actions */}
      <section className="section-divider">
        <p className="roman">V · Actions & states</p>
        <h2 className="display-headline" style={{ fontSize: "32px", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Кнопки и сигналы
        </h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          <button className="btn-primary">
            <Sparkles size={12} />
            Запустить расследование
          </button>
          <button className="btn-ghost">Сохранить черновик</button>
          <span className="pill" style={{ borderColor: "var(--forest)", color: "var(--forest)" }}>
            ● Active
          </span>
          <span className="pill" style={{ borderColor: "var(--ochre)", color: "var(--ochre)" }}>
            ● Review
          </span>
          <span className="pill" style={{ borderColor: "var(--brick)", color: "var(--brick)" }}>
            ● Critical
          </span>
        </div>

        <Link
          href="/styleguide"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--forest)",
            textDecoration: "none",
            fontFamily: "Fraunces Variable, serif",
            fontVariationSettings: '"wght" 500',
            fontSize: "13px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Compare other directions <ArrowUpRight size={12} />
        </Link>
      </section>

      {/* Colophon */}
      <footer
        className="section-divider"
        style={{ textAlign: "center", paddingTop: "2rem", color: "var(--muted)" }}
      >
        <p className="roman">Colophon</p>
        <p
          className="display"
          style={{
            fontSize: "14px",
            fontStyle: "italic",
            marginTop: "0.5rem",
            fontVariationSettings: '"wght" 400, "ital" 1',
          }}
        >
          Set in Fraunces (variable serif) and Inter. Printed on warm cream paper, ruled in deep ink.
        </p>
      </footer>
    </div>
  );
}
