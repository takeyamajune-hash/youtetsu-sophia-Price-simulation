import React, { useState, useMemo } from "react";

const PINK = "#D6486B";
const TEAL = "#3E8FA6";
const NAVY = "#1B4F72";
const RED = "#CC2027";
const GREEN = "#2E8B47";
const ORANGE = "#F5A623";
const CARDBG = "#F7F9FB";

const GRADES = ["小5", "小6", "中1", "中2", "中3"];

const SUBJECTS_BY_GRADE = {
  小5: [
    { name: "中高一貫", price: 9900 },
    { name: "考える算数", price: 9900 },
    { name: "考える国語", price: 9900 },
    { name: "小学生英語", price: 9900 },
  ],
  小6: [
    { name: "中高一貫", price: 22000 },
    { name: "考える算数", price: 9900 },
    { name: "考える国語", price: 9900 },
    { name: "小学生英語", price: 9900 },
  ],
  中1: [
    { name: "英語", price: 10890 },
    { name: "数学", price: 10890 },
    { name: "国語", price: 8800 },
  ],
  中2: [
    { name: "英語", price: 10890 },
    { name: "数学", price: 10890 },
    { name: "国語", price: 8800 },
    { name: "英語基礎", price: 8800 },
    { name: "数学基礎", price: 8800 },
  ],
  中3: [
    { name: "英語", price: 10890 },
    { name: "数学", price: 10890 },
    { name: "国語", price: 8800 },
    { name: "長文演習", price: 10890 },
    { name: "数学演習", price: 10890 },
    { name: "英語基礎", price: 8800 },
    { name: "数学基礎", price: 8800 },
    { name: "社会", price: 8800 },
    { name: "理科", price: 8800 },
  ],
};

const SEASONAL_BY_GRADE = {
  小5: { kind: "checkbox", items: [{ label: "算国練成コース", price: 19800 }] },
  小6: {
    kind: "checkbox",
    items: [
      { label: "算国練成コース", price: 19800 },
      { label: "中高一貫コース", price: 44000 },
    ],
  },
  中1: { kind: "checkbox", items: [{ label: "夏期集中特訓（復習＋予習セット）", price: 35200 }] },
  中2: {
    kind: "checkbox",
    items: [
      { label: "夏期集中特訓（復習＋予習セット）", price: 35200 },
      { label: "ハイレベル国語（オプション）", price: 6050 },
    ],
  },
  中3: {
    kind: "radio",
    items: [
      { label: "60時間コース", price: 95000 },
      { label: "90時間コース", price: 135000 },
      { label: "150時間コース（全講座フル）", price: 178200 },
    ],
  },
};

const FREE_ITEMS_ALL = [
  { label: "全国模試", value: 121000, note: "年間・他塾実例（模試教材費）" },
  { label: "試験補講・単元補講・英検補講", value: 163350, note: "年15回 × 1回4時間の換算" },
];
const FREE_ITEM_C3 = { label: "直前特訓・プレテスト", value: 148000, note: "中3限定・他塾実例" };

function yen(n) {
  return "¥" + Math.round(n).toLocaleString();
}

export default function FeeSimulator() {
  const [grade, setGrade] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [seasonalChecked, setSeasonalChecked] = useState([]);
  const [seasonalRadio, setSeasonalRadio] = useState(null);
  const [copied, setCopied] = useState(false);

  const subjects = grade ? SUBJECTS_BY_GRADE[grade] : [];
  const seasonal = grade ? SEASONAL_BY_GRADE[grade] : null;

  function toggleGrade(g) {
    setGrade(g);
    setSelectedSubjects([]);
    setSeasonalChecked([]);
    setSeasonalRadio(null);
    setCopied(false);
  }

  function toggleSubject(name) {
    setSelectedSubjects((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  }

  function toggleSeasonalCheckbox(label) {
    setSeasonalChecked((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  }

  const monthly = useMemo(() => {
    return subjects
      .filter((s) => selectedSubjects.includes(s.name))
      .reduce((sum, s) => sum + s.price, 0);
  }, [subjects, selectedSubjects]);

  const seasonalTotal = useMemo(() => {
    if (!seasonal) return 0;
    if (seasonal.kind === "checkbox") {
      return seasonal.items
        .filter((i) => seasonalChecked.includes(i.label))
        .reduce((sum, i) => sum + i.price, 0);
    }
    if (seasonal.kind === "radio") {
      const found = seasonal.items.find((i) => i.label === seasonalRadio);
      return found ? found.price : 0;
    }
    return 0;
  }, [seasonal, seasonalChecked, seasonalRadio]);

  const annualTuition = monthly * 12;
  const grandTotal = annualTuition + seasonalTotal;

  const freeItems = useMemo(() => {
    if (!grade) return [];
    const items = [...FREE_ITEMS_ALL];
    if (grade === "中3") items.push(FREE_ITEM_C3);
    return items;
  }, [grade]);

  const freeTotal = freeItems.reduce((sum, i) => sum + i.value, 0);

  function buildShareText() {
    const lines = [];
    lines.push("【養哲塾 料金シミュレーション結果】");
    lines.push(`学年：${grade || "未選択"}`);
    if (selectedSubjects.length) {
      lines.push(`選択科目：${selectedSubjects.join("、")}`);
    }
    lines.push(`月額：${yen(monthly)}`);
    if (seasonalTotal > 0) lines.push(`季節講習：${yen(seasonalTotal)}`);
    lines.push(`年間総額：${yen(grandTotal)}`);
    if (grade) {
      lines.push("");
      lines.push(`このプランには、他塾なら約${yen(freeTotal)}分の補講・模試が無料で含まれています。`);
    }
    return lines.join("\n");
  }

  async function handleCopy() {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  }

  function handleLineShare() {
    const text = buildShareText();
    const url = "https://line.me/R/msg/text/?" + encodeURIComponent(text);
    window.open(url, "_blank");
  }

  return (
    <div style={{ fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif", maxWidth: 720, margin: "0 auto", background: "#fff", paddingBottom: 32 }}>
      {/* Site header (matches youtetsu-sophia.com) */}
      <div style={{ display: "flex", alignItems: "stretch", background: "#282828", flexWrap: "wrap" }}>
        <div style={{ background: "#B5121B", color: "#fff", fontWeight: 800, fontSize: 22, padding: "18px 22px", letterSpacing: 1, whiteSpace: "nowrap" }}>
          養哲塾
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, padding: "0 18px", minWidth: 160 }}>
          <span style={{ color: "#fff", fontSize: 12, letterSpacing: 1.5, opacity: 0.9 }}>
            PRIVATE ACADEMY OF SOPHIA
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ width: 22, height: 2, background: TEAL, display: "block" }} />
            <span style={{ width: 22, height: 2, background: TEAL, display: "block" }} />
            <span style={{ width: 22, height: 2, background: TEAL, display: "block" }} />
          </div>
        </div>
      </div>

      {/* Page title block, matching under-page-header style */}
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#222", margin: 0 }}>料金シミュレーション</h1>
        <p style={{ fontSize: 12, color: "#777", margin: "6px 0 0" }}>トップページ ＞ 料金シミュレーション</p>
      </div>
      <div style={{ height: 6, background: TEAL, margin: "10px 20px 0" }} />

      {/* Date disclaimer */}
      <div style={{ margin: "14px 20px 0", padding: "10px 14px", background: "#FFF8E1", border: "1px solid #F0D98C", borderRadius: 6, fontSize: 12, color: "#7A6316" }}>
        ※本シミュレーションは2026年8月時点の情報に基づく概算です。実際の料金・講習内容とは異なる場合がありますので、正式な金額は各教室までお問い合わせください。
      </div>

      {/* Header */}
      <div style={{ padding: "20px 20px 20px" }}>
        <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
          学年と科目を選ぶだけで、月額・年間費用がすぐにわかります
        </p>
      </div>

      {/* Grade selector */}
      <div style={{ padding: "20px 20px 8px" }}>
        <div style={{ display: "inline-block", background: NAVY, color: "#fff", fontWeight: 700, fontSize: 14, padding: "4px 14px", borderRadius: 4, marginBottom: 12 }}>
          学年を選ぶ
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {GRADES.map((g) => {
            const active = grade === g;
            return (
              <button
                key={g}
                onClick={() => toggleGrade(g)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: `2px solid ${active ? GREEN : "#ddd"}`,
                  background: active ? GREEN : "#fff",
                  color: active ? "#fff" : "#333",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {grade && (
        <>
          {/* Subject picker */}
          <div style={{ padding: "20px 20px 8px" }}>
            <div style={{ display: "inline-block", background: PINK, color: "#fff", fontWeight: 700, fontSize: 14, padding: "4px 14px", borderRadius: 4, marginBottom: 12 }}>
              科目を選ぶ（タップで追加）
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {subjects.map((s) => {
                const active = selectedSubjects.includes(s.name);
                return (
                  <button
                    key={s.name}
                    onClick={() => toggleSubject(s.name)}
                    style={{
                      border: `2px solid ${active ? ORANGE : TEAL}`,
                      background: active ? "#FFF3E0" : CARDBG,
                      borderRadius: 8,
                      padding: "12px 10px",
                      textAlign: "center",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {active && (
                      <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: ORANGE, color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ✓
                      </div>
                    )}
                    <div style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                    <div style={{ fontSize: 13, color: "#555" }}>{yen(s.price)}<span style={{ fontSize: 11 }}>/月</span></div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>※クラス定員7名・能力別ゼミスタイル</div>
          </div>

          {/* Seasonal course picker */}
          {seasonal && (
            <div style={{ margin: "20px 20px 8px", padding: 16, border: `2px dashed ${ORANGE}`, borderRadius: 10, background: "#FFFBF3" }}>
              <div style={{ display: "inline-block", background: ORANGE, color: "#fff", fontWeight: 700, fontSize: 14, padding: "4px 14px", borderRadius: 4, marginBottom: 10 }}>
                季節講習（有料・任意）— 夏期集中特訓
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {seasonal.items.map((item) => {
                  const isChecked =
                    seasonal.kind === "checkbox"
                      ? seasonalChecked.includes(item.label)
                      : seasonalRadio === item.label;
                  return (
                    <label
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: `1.5px solid ${isChecked ? ORANGE : "#e2ceac"}`,
                        background: isChecked ? "#FFEFD6" : "#fff",
                        borderRadius: 8,
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type={seasonal.kind === "checkbox" ? "checkbox" : "radio"}
                          checked={isChecked}
                          onChange={() =>
                            seasonal.kind === "checkbox"
                              ? toggleSeasonalCheckbox(item.label)
                              : setSeasonalRadio(isChecked ? null : item.label)
                          }
                          style={{ width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 14, color: "#444", fontWeight: 600 }}>{item.label}</span>
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{yen(item.price)}</span>
                    </label>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: "#a67c3d", marginTop: 8 }}>
                ※季節講習は月謝とは別料金です。上の合計とは分けて計算しています。
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{ margin: "24px 20px 0", padding: 18, borderRadius: 12, background: NAVY, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, opacity: 0.85, marginBottom: 4 }}>
              <span>月額（通常授業）</span>
              <span>{yen(monthly)}</span>
            </div>
            {seasonalTotal > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, opacity: 0.85, marginBottom: 4 }}>
                <span>季節講習（夏期集中特訓）</span>
                <span>{yen(seasonalTotal)}</span>
              </div>
            )}
            <div style={{ height: 1, background: "rgba(255,255,255,0.25)", margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>年間総額</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: ORANGE }}>{yen(grandTotal)}</span>
            </div>

            {/* subtle free-value ticker */}
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              このプランには無償の補講・模試が含まれています（詳細は下）
            </div>
          </div>

          {/* Big reveal: free value */}
          <div style={{ margin: "16px 20px 0", padding: 18, borderRadius: 12, border: `3px solid ${RED}`, background: "#FFF6F6" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: RED, marginBottom: 10 }}>
              他塾なら追加料金がかかる項目が、養哲塾ではすべて無料
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {freeItems.map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#444" }}>
                  <span>
                    {item.label}
                    <span style={{ color: "#999", fontSize: 11, marginLeft: 6 }}>{item.note}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: NAVY }}>{yen(item.value)}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: "#f0c9c9", margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: RED }}>無償価値 合計</span>
              <span style={{ fontSize: 26, fontWeight: 800, color: RED }}>{yen(freeTotal)}</span>
            </div>
            <div style={{ fontSize: 11, color: "#a35a5a", marginTop: 6 }}>
              ※他塾実例および相場に基づく概算です。正式な金額は教室にお問い合わせください。
            </div>
          </div>

          {/* Share buttons */}
          <div style={{ margin: "20px 20px 0", display: "flex", gap: 10 }}>
            <button
              onClick={handleLineShare}
              style={{
                flex: 1,
                background: "#06C755",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "14px 0",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              LINEで結果を送る
            </button>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                background: "#fff",
                color: NAVY,
                border: `2px solid ${NAVY}`,
                borderRadius: 8,
                padding: "14px 0",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
          </div>
        </>
      )}

      {!grade && (
        <div style={{ margin: "40px 20px", textAlign: "center", color: "#999", fontSize: 14 }}>
          上の学年ボタンをタップして開始してください
        </div>
      )}
    </div>
  );
}
