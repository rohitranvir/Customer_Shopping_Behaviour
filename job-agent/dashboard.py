"""
dashboard.py — Streamlit dashboard for the Job Application Agent.
Run: streamlit run dashboard.py
"""
import json
import time
from pathlib import Path
from datetime import datetime

import streamlit as st
import pandas as pd
import altair as alt

# ─────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="Job Application Agent",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

.main-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    border-radius: 16px;
    color: white;
    margin-bottom: 1.5rem;
    text-align: center;
}

.kpi-card {
    background: #1e1e2e;
    border: 1px solid #3d3d5c;
    border-radius: 12px;
    padding: 1.2rem;
    text-align: center;
    color: white;
}

.kpi-number { font-size: 2.2rem; font-weight: 700; }
.kpi-label  { font-size: 0.85rem; color: #aaa; margin-top: 4px; }

.status-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;
}

[data-testid="stMetricValue"] { font-size: 2rem !important; }
</style>
""", unsafe_allow_html=True)

BASE_DIR = Path(__file__).parent
CSV_PATH = BASE_DIR / "output" / "applications.csv"
PROFILE_PATH = BASE_DIR / "profile.json"


# ─────────────────────────────────────────────
#  LOAD DATA
# ─────────────────────────────────────────────
@st.cache_data(ttl=30)
def load_data():
    if not CSV_PATH.exists():
        return pd.DataFrame(columns=[
            "date", "company", "role", "platform", "match_score",
            "status", "resume_path", "cover_letter_path", "url", "notes"
        ])
    df = pd.read_csv(CSV_PATH)
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    if "match_score" in df.columns:
        df["match_score"] = pd.to_numeric(df["match_score"], errors="coerce")
    return df


@st.cache_data(ttl=60)
def load_profile():
    if PROFILE_PATH.exists():
        with open(PROFILE_PATH, "r") as f:
            return json.load(f)
    return {}


# ─────────────────────────────────────────────
#  SIDEBAR
# ─────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🤖 Job Agent Control")
    st.divider()

    profile = load_profile()
    if profile:
        st.markdown(f"**👤 {profile.get('name', 'Unknown')}**")
        st.caption(profile.get('email', ''))
        st.caption(profile.get('primary_location', ''))
        st.divider()
        st.markdown("**🎯 Target Roles**")
        for role in profile.get("target_roles", [])[:5]:
            st.markdown(f"• {role}")
        st.divider()
        st.markdown("**⚙️ Agent Settings**")
        st.markdown(f"• Max daily apps: `{profile.get('max_daily_applications', 50)}`")
        st.markdown(f"• Match threshold: `{profile.get('match_score_threshold', 50)}%`")
        st.markdown(f"• Auto-submit: `{'✅ ON' if profile.get('auto_submit') else '❌ OFF'}`")

    st.divider()
    if st.button("🔄 Refresh Data", use_container_width=True):
        st.cache_data.clear()
        st.rerun()

    auto_refresh = st.toggle("Auto-refresh (60s)", value=False)


# ─────────────────────────────────────────────
#  HEADER
# ─────────────────────────────────────────────
st.markdown("""
<div class="main-header">
  <h1 style="margin:0;font-size:2rem;">🤖 Job Application Agent</h1>
  <p style="margin:0.5rem 0 0;opacity:0.85;">Real-time tracking of your automated job applications</p>
</div>
""", unsafe_allow_html=True)

df = load_data()

# ─────────────────────────────────────────────
#  KPI CARDS
# ─────────────────────────────────────────────
col1, col2, col3, col4, col5 = st.columns(5)

total = len(df)
applied = len(df[df["status"] == "applied"]) if not df.empty else 0
dry_run_count = len(df[df["status"] == "dry_run"]) if not df.empty else 0
skipped = len(df[df["status"] == "skipped"]) if not df.empty else 0
captcha = len(df[df["status"] == "captcha"]) if not df.empty else 0
errors = len(df[df["status"].isin(["error", "failed"])]) if not df.empty else 0
avg_score = df["match_score"].mean() if not df.empty and "match_score" in df.columns else 0

with col1:
    st.metric("📦 Total Logged", total)
with col2:
    st.metric("✅ Applied", applied + dry_run_count, help="Includes dry run entries")
with col3:
    st.metric("⚠️ Skipped", skipped)
with col4:
    st.metric("🤖 CAPTCHA Hit", captcha)
with col5:
    st.metric("📈 Avg Match", f"{avg_score:.0f}%" if avg_score else "—")

st.divider()

# ─────────────────────────────────────────────
#  CHART ROW
# ─────────────────────────────────────────────
if not df.empty and "date" in df.columns and df["date"].notna().any():
    chart_col, pie_col = st.columns([2, 1])

    with chart_col:
        st.markdown("#### 📅 Applications Over Time")
        daily = (
            df.dropna(subset=["date"])
            .groupby(df["date"].dt.date)
            .size()
            .reset_index(name="count")
        )
        daily.columns = ["date", "count"]
        chart = (
            alt.Chart(daily)
            .mark_area(
                line={"color": "#667eea"},
                color=alt.Gradient(
                    gradient="linear",
                    stops=[
                        alt.GradientStop(color="#667eea", offset=0),
                        alt.GradientStop(color="transparent", offset=1),
                    ],
                    x1=1, x2=1, y1=1, y2=0,
                ),
                point=True
            )
            .encode(
                x=alt.X("date:T", title="Date"),
                y=alt.Y("count:Q", title="Applications"),
                tooltip=["date:T", "count:Q"]
            )
            .properties(height=220)
        )
        st.altair_chart(chart, use_container_width=True)

    with pie_col:
        st.markdown("#### 🔢 By Platform")
        if "platform" in df.columns and df["platform"].notna().any():
            platform_counts = df["platform"].value_counts().reset_index()
            platform_counts.columns = ["Platform", "Count"]
            pie_chart = (
                alt.Chart(platform_counts)
                .mark_arc(innerRadius=50)
                .encode(
                    theta=alt.Theta("Count:Q"),
                    color=alt.Color("Platform:N", scale=alt.Scale(scheme="category10")),
                    tooltip=["Platform:N", "Count:Q"]
                )
                .properties(height=220)
            )
            st.altair_chart(pie_chart, use_container_width=True)
        else:
            st.info("No platform data yet")

else:
    st.info("📭 No application data yet. Run `python agent.py --dry-run` to get started!")

# ─────────────────────────────────────────────
#  MATCH SCORE DISTRIBUTION
# ─────────────────────────────────────────────
if not df.empty and "match_score" in df.columns and df["match_score"].notna().any():
    st.markdown("#### 🎯 Match Score Distribution")
    hist = (
        alt.Chart(df.dropna(subset=["match_score"]))
        .mark_bar(color="#667eea", cornerRadiusTopLeft=4, cornerRadiusTopRight=4)
        .encode(
            x=alt.X("match_score:Q", bin=alt.Bin(step=10), title="Match Score (%)"),
            y=alt.Y("count():Q", title="Number of Jobs"),
            tooltip=[alt.Tooltip("match_score:Q", bin=True), "count()"]
        )
        .properties(height=180)
    )
    st.altair_chart(hist, use_container_width=True)

st.divider()

# ─────────────────────────────────────────────
#  FILTERS + TABLE
# ─────────────────────────────────────────────
st.markdown("#### 📋 All Applications")

filter_col1, filter_col2, filter_col3 = st.columns(3)

filtered_df = df.copy()

with filter_col1:
    if not df.empty and "platform" in df.columns:
        platforms = ["All"] + sorted(df["platform"].dropna().unique().tolist())
        sel_platform = st.selectbox("Platform", platforms)
        if sel_platform != "All":
            filtered_df = filtered_df[filtered_df["platform"] == sel_platform]

with filter_col2:
    if not df.empty and "status" in df.columns:
        statuses = ["All"] + sorted(df["status"].dropna().unique().tolist())
        sel_status = st.selectbox("Status", statuses)
        if sel_status != "All":
            filtered_df = filtered_df[filtered_df["status"] == sel_status]

with filter_col3:
    min_score = st.slider("Min Match Score", 0, 100, 0)
    if not df.empty and "match_score" in df.columns:
        filtered_df = filtered_df[filtered_df["match_score"].fillna(0) >= min_score]

# Display styled table
STATUS_COLORS = {
    "applied":    "🟢",
    "submitted":  "🟢",
    "dry_run":    "🔵",
    "filled":     "🔵",
    "skipped":    "🟡",
    "captcha":    "🟠",
    "error":      "🔴",
    "failed":     "🔴",
}

if not filtered_df.empty:
    display_df = filtered_df.copy()
    if "status" in display_df.columns:
        display_df["status"] = display_df["status"].apply(
            lambda s: f"{STATUS_COLORS.get(str(s), '⚪')} {s}"
        )
    if "match_score" in display_df.columns:
        display_df["match_score"] = display_df["match_score"].apply(
            lambda x: f"{x:.0f}%" if pd.notna(x) else "—"
        )
    if "url" in display_df.columns:
        display_df["url"] = display_df["url"].apply(
            lambda u: f"[Link]({u})" if pd.notna(u) and str(u).startswith("http") else ""
        )

    show_cols = ["date", "company", "role", "platform", "match_score", "status", "url"]
    show_cols = [c for c in show_cols if c in display_df.columns]

    st.dataframe(
        display_df[show_cols].sort_values("date", ascending=False) if "date" in display_df.columns else display_df[show_cols],
        use_container_width=True,
        height=400
    )
    st.caption(f"Showing {len(filtered_df)} of {len(df)} total records")
else:
    st.info("No records match the current filters.")

# ─────────────────────────────────────────────
#  FOOTER
# ─────────────────────────────────────────────
st.divider()
footer_col1, footer_col2 = st.columns(2)
with footer_col1:
    st.caption(f"Last refreshed: {datetime.now().strftime('%H:%M:%S')}")
with footer_col2:
    st.caption("Run `python agent.py --dry-run` to add data | `python agent.py --help` for options")

# Auto-refresh
if auto_refresh:
    time.sleep(60)
    st.cache_data.clear()
    st.rerun()
