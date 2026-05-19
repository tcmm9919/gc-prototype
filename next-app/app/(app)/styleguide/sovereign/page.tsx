"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Bell, Sparkles, Users, Wallet } from "lucide-react";

/**
 * Sovereign Banking — Direction C.
 * Scope: warm off-white + Plus Jakarta Sans display + Inter body + green ambient haze.
 * Reference: Mercury, Stripe Atlas, Apple Intelligence.
 */

export default function Page() {
  return (
    <div className="sovereign">
      <style jsx>{`
        .sovereign {
          --bg: #fbfbf8;
          --bg-tint: #f4f5f0;
          --surface: #ffffff;
          --ink: #1c1f23;
          --ink-soft: #50555c;
          --muted: #8b9098;
          --rule: #e8e9e3;
          --rule-soft: #f0f1ec;
          --primary: #2c8a5a;
          --primary-soft: #4ba578;
          --primary-glow: rgba(75, 165, 120, 0.18);
          --sage: #7ba189;
          --butter: #d4ad4e;
          --coral: #d97757;
          --brick: #b94a3a;
          background: var(--bg);
          color: var(--ink);
          font-family: "Inter Variable", system-ui, sans-serif;
          padding: 3rem 3rem 6rem;
          min-height: 100vh;
          margin: -1.5rem;
          padding-left: calc(3rem + 1.5rem);
          padding-right: calc(3rem + 1.5rem);
          position: relative;
          overflow: hidden;
        }
        .sovereign::before {
          content: "";
          position: absolute;
          top: -200px;
          right: -200px;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .sovereign::after {
          content: "";
          position: absolute;
          bottom: -300px;
          left: -150px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212, 173, 78, 0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .sovereign > * {
          position: relative;
          z-index: 1;
        }
        .sovereign .display {
          font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif;
          letter-spacing: -0.025em;
        }
        .sovereign .display-tight {
          font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif;
          letter-spacing: -0.035em;
        }
        .sovereign .display-num {
          font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif;
          font-feature-settings: "tnum";
          letter-spacing: -0.04em;
        }
        .sovereign .label {
          font-size: 11px;
          font-weight: 500;
          color: var(--muted);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .sovereign .back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--ink-soft);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color 150ms;
        }
        .sovereign .back:hover {
          color: var(--ink);
        }
        .sovereign .card {
          background: var(--surface);
          border: 1px solid var(--rule);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 8px 24px -12px rgba(28, 31, 35, 0.06);
        }
        .sovereign .card-glow {
          background: linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--primary) 4%, var(--surface)));
          border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--rule));
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 12px 32px -8px var(--primary-glow);
        }
        .sovereign .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--ink);
          color: var(--bg);
          padding: 0.7rem 1.25rem;
          font-family: "Plus Jakarta Sans Variable", sans-serif;
          font-weight: 600;
          font-size: 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: background 150ms, transform 150ms;
        }
        .sovereign .btn-primary:hover {
          background: var(--primary);
          transform: translateY(-1px);
        }
        .sovereign .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--surface);
          color: var(--ink);
          padding: 0.7rem 1.25rem;
          font-family: "Plus Jakarta Sans Variable", sans-serif;
          font-weight: 500;
          font-size: 14px;
          border-radius: 10px;
          border: 1px solid var(--rule);
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: border-color 150ms;
        }
        .sovereign .btn-ghost:hover {
          border-color: var(--ink-soft);
        }
        .sovereign .pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.005em;
        }
        .sovereign .pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .sovereign hr {
          border: 0;
          border-top: 1px solid var(--rule);
        }
        .sovereign .row {
          display: grid;
          grid-template-columns: 120px 1fr 130px 110px 100px;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--rule-soft);
          align-items: center;
        }
        .sovereign .row:last-child {
          border-bottom: none;
        }
        .sovereign .row-head {
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--rule);
        }
      `}</style>

      {/* Top nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <Link href="/styleguide" className="back">
          <ArrowLeft size={14} /> Back to lab
        </Link>
        <span className="label">Direction C · Sovereign Banking</span>
      </div>

      {/* Hero */}
      <header style={{ marginBottom: "3rem" }}>
        <span className="label" style={{ color: "var(--primary)" }}>
          Premium · Refined · Calm
        </span>
        <h1
          className="display-tight"
          style={{
            fontSize: "64px",
            fontWeight: 600,
            lineHeight: 1.0,
            marginTop: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          Compliance, but{" "}
          <span style={{ color: "var(--primary)", fontWeight: 500, fontStyle: "italic" }}>quiet</span>.
        </h1>
        <p
          style={{
            fontSize: "17px",
            lineHeight: 1.55,
            color: "var(--ink-soft)",
            maxWidth: "44ch",
            marginBottom: "1.5rem",
          }}
        >
          Mercury-style refinement, ambient green glow, generous whitespace, soft motion. Не кричит — работает в фоне.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-primary">
            <Sparkles size={14} />
            Apply globally
          </button>
          <button className="btn-ghost">Open dashboard</button>
        </div>
      </header>

      {/* I · Typography */}
      <section style={{ marginBottom: "3rem" }}>
        <p className="label">Section 01 · Typography</p>
        <h2 className="display-tight" style={{ fontSize: "28px", fontWeight: 600, marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Шрифты
        </h2>
        <div className="card">
          <p className="label">Display · Plus Jakarta Sans</p>
          <p
            className="display-tight"
            style={{ fontSize: "72px", fontWeight: 600, marginTop: "0.5rem", lineHeight: 1, marginBottom: "1rem" }}
          >
            Freedom AI Compliance
          </p>
          <p
            className="display"
            style={{ fontSize: "32px", fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Карточка клиента
          </p>
          <hr style={{ margin: "1.5rem 0" }} />
          <p className="label">Body · Inter</p>
          <p style={{ fontSize: "16px", lineHeight: 1.65, marginTop: "0.5rem", maxWidth: "60ch" }}>
            Compliance Officer AI получает каждое новое оповещение сразу после обработки транзакции и анализирует
            контекст: правило, транзакцию и клиента. Решение фиксируется в LLM-логе и аудит-журнале.
          </p>
        </div>
      </section>

      {/* II · Palette */}
      <section style={{ marginBottom: "3rem" }}>
        <p className="label">Section 02 · Palette</p>
        <h2 className="display-tight" style={{ fontSize: "28px", fontWeight: 600, marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Тёплые нейтрали с зелёным ambient
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {[
            { name: "background", color: "#fbfbf8", desc: "Off-white · warm" },
            { name: "surface", color: "#ffffff", desc: "Card surface" },
            { name: "ink", color: "#1c1f23", desc: "Foreground" },
            { name: "rule", color: "#e8e9e3", desc: "Hairline" },
            { name: "primary", color: "#2c8a5a", desc: "Refined green" },
            { name: "sage", color: "#7ba189", desc: "Risk · low" },
            { name: "butter", color: "#d4ad4e", desc: "Risk · medium" },
            { name: "coral", color: "#d97757", desc: "Risk · high" },
          ].map((s) => (
            <div key={s.name}>
              <div
                style={{
                  height: 80,
                  background: s.color,
                  border: "1px solid var(--rule)",
                  borderRadius: 12,
                }}
              />
              <p
                className="display"
                style={{ fontSize: 14, fontWeight: 600, marginTop: "0.5rem", marginBottom: "0.15rem" }}
              >
                {s.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* III · KPI */}
      <section style={{ marginBottom: "3rem" }}>
        <p className="label">Section 03 · Key indicators</p>
        <h2 className="display-tight" style={{ fontSize: "28px", fontWeight: 600, marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Сводка
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {[
            { num: "87", label: "Customers", delta: "+3", icon: Users, glow: false },
            { num: "39", label: "Open alerts", delta: "+12", icon: Bell, glow: true },
            { num: "2", label: "Active cases", delta: "−1", icon: Wallet, glow: false },
            { num: "$11.80", label: "LLM cost · 30d", delta: "+$2.40", icon: Sparkles, glow: false },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className={kpi.glow ? "card card-glow" : "card"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <Icon
                    size={16}
                    color={kpi.glow ? "var(--primary)" : "var(--muted)"}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: kpi.glow ? "var(--primary)" : "var(--muted)",
                    }}
                  >
                    {kpi.delta}
                  </span>
                </div>
                <p
                  className="display-num"
                  style={{
                    fontSize: 48,
                    fontWeight: 600,
                    lineHeight: 1,
                    color: kpi.glow ? "var(--primary)" : "var(--ink)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {kpi.num}
                </p>
                <p className="label">{kpi.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* IV · Table */}
      <section style={{ marginBottom: "3rem" }}>
        <p className="label">Section 04 · Records</p>
        <h2 className="display-tight" style={{ fontSize: "28px", fontWeight: 600, marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Последние операции
        </h2>
        <div className="card" style={{ padding: 0 }}>
          <div className="row row-head" style={{ padding: "1rem 1.5rem" }}>
            <span className="label">Date</span>
            <span className="label">Client</span>
            <span className="label">Amount</span>
            <span className="label">Risk</span>
            <span className="label">Status</span>
          </div>
          {[
            {
              date: "06 May",
              id: "701b2188",
              client: "Дягилев Михаил В.",
              amount: "1 500 000 ₸",
              risk: "Med",
              riskColor: "var(--butter)",
              status: "Завершена",
              statusColor: "var(--primary)",
            },
            {
              date: "06 May",
              id: "aa9e679f",
              client: "Дягилев Михаил В.",
              amount: "200 000 ₸",
              risk: "Low",
              riskColor: "var(--sage)",
              status: "Завершена",
              statusColor: "var(--primary)",
            },
            {
              date: "11 Apr",
              id: "7694a2d1",
              client: "Третьякова Алена А.",
              amount: "121 849 ₸",
              risk: "Low",
              riskColor: "var(--sage)",
              status: "Открыто",
              statusColor: "var(--ink-soft)",
            },
            {
              date: "10 Apr",
              id: "bc92b017",
              client: "Третьякова Алена А.",
              amount: "$3 832",
              risk: "High",
              riskColor: "var(--coral)",
              status: "Проверка",
              statusColor: "var(--butter)",
            },
          ].map((r) => (
            <div key={r.id} className="row" style={{ padding: "1rem 1.5rem" }}>
              <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>{r.date}</span>
              <div>
                <p className="display" style={{ fontSize: 15, fontWeight: 500 }}>
                  {r.client}
                </p>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>{r.id}</p>
              </div>
              <span
                className="display-num"
                style={{ fontSize: 15, fontWeight: 500 }}
              >
                {r.amount}
              </span>
              <span
                className="pill"
                style={{ background: `color-mix(in srgb, ${r.riskColor} 12%, transparent)`, color: r.riskColor }}
              >
                <span className="pill-dot" style={{ background: r.riskColor }} />
                {r.risk}
              </span>
              <span style={{ fontSize: 13, color: r.statusColor, fontWeight: 500 }}>{r.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* V · States */}
      <section style={{ marginBottom: "3rem" }}>
        <p className="label">Section 05 · States</p>
        <h2 className="display-tight" style={{ fontSize: "28px", fontWeight: 600, marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          Кнопки и сигналы
        </h2>
        <div className="card">
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <button className="btn-primary">
              <Sparkles size={14} />
              Запустить расследование
            </button>
            <button className="btn-ghost">Сохранить черновик</button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              className="pill"
              style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
            >
              <span className="pill-dot" style={{ background: "var(--primary)" }} />
              Active
            </span>
            <span
              className="pill"
              style={{ background: "color-mix(in srgb, var(--butter) 14%, transparent)", color: "var(--butter)" }}
            >
              <span className="pill-dot" style={{ background: "var(--butter)" }} />
              Review
            </span>
            <span
              className="pill"
              style={{ background: "color-mix(in srgb, var(--coral) 12%, transparent)", color: "var(--coral)" }}
            >
              <span className="pill-dot" style={{ background: "var(--coral)" }} />
              High
            </span>
            <span
              className="pill"
              style={{ background: "color-mix(in srgb, var(--brick) 12%, transparent)", color: "var(--brick)" }}
            >
              <span className="pill-dot" style={{ background: "var(--brick)" }} />
              Critical
            </span>
          </div>
        </div>
      </section>

      <Link
        href="/styleguide"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          color: "var(--primary)",
          textDecoration: "none",
          fontFamily: "Plus Jakarta Sans Variable, sans-serif",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        Compare other directions <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
