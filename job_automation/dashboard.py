"""
dashboard.py — Streamlit dashboard for the Cold Email Sender.

Shows email send stats, response tracking, and a searchable results table.
Run with:  streamlit run dashboard.py
"""

import os
import sqlite3
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from dotenv import load_dotenv

load_dotenv()
DB_PATH = "data/email_results.db"

# ══════════════════════════════════════════════════════════════════════
#  PAGE CONFIG & STYLING
# ══════════════════════════════════════════════════════════════════════

st.set_page_config(
    page_title="Cold Email Dashboard",
    page_icon="📧",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* Global */
    .stApp {
        font-family: 'Inter', sans-serif;
    }

    /* Header */
    .main-header {
        text-align: center;
        padding: 1.5rem 0 1rem;
    }
    .main-header h1 {
        font-size: 2.4rem;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .main-header p {
        color: #888;
        font-size: 1rem;
    }

    /* Metric cards */
    .metric-card {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .metric-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
    }
    .metric-icon { font-size: 2rem; margin-bottom: 0.4rem; }
    .metric-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #fff;
        line-height: 1.2;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 0.3rem;
    }

    /* Color accents */
    .val-total  { color: #667eea !important; }
    .val-sent   { color: #43e97b !important; }
    .val-failed { color: #f5576c !important; }
    .val-resp   { color: #ffc947 !important; }

    /* Chart container */
    .chart-container {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        padding: 1.2rem;
    }

    /* Section titles */
    .section-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #ccc;
        margin: 2rem 0 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid rgba(102,126,234,0.3);
    }

    /* Hide Streamlit defaults */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    .stDeployButton {display: none;}
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════════════════

@st.cache_data(ttl=30)
def load_data():
    """Load email results from SQLite."""
    if not os.path.isfile(DB_PATH):
        return pd.DataFrame()
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM emails ORDER BY id DESC", conn)
    conn.close()
    return df


def check_responses_from_dashboard():
    """Run the IMAP response checker from main module."""
    try:
        from main import check_responses
        n = check_responses()
        return n
    except Exception as e:
        st.error(f"Response check failed: {e}")
        return 0


# ══════════════════════════════════════════════════════════════════════
#  HEADER
# ══════════════════════════════════════════════════════════════════════

st.markdown("""
<div class="main-header">
    <h1>📧 Cold Email Dashboard</h1>
    <p>Track your job application emails — sent, failed &amp; responses</p>
</div>
""", unsafe_allow_html=True)

# ── Action bar ──────────────────────────────────────────────────────
col_a, col_b, col_c = st.columns([1, 1, 4])
with col_a:
    if st.button("🔄 Refresh Data", use_container_width=True):
        st.cache_data.clear()
        st.rerun()
with col_b:
    if st.button("📩 Check Responses", use_container_width=True):
        with st.spinner("Scanning inbox..."):
            n = check_responses_from_dashboard()
            if n:
                st.toast(f"Found {n} new response(s)!", icon="📩")
            else:
                st.toast("No new responses found.", icon="📭")
            st.cache_data.clear()
            st.rerun()

# ── Load data ───────────────────────────────────────────────────────
df = load_data()

if df.empty:
    st.info("No email data yet. Run `python main.py` first to send emails and populate the dashboard.")
    st.stop()


# ══════════════════════════════════════════════════════════════════════
#  SUMMARY CARDS
# ══════════════════════════════════════════════════════════════════════

total     = len(df)
sent      = len(df[df["status"] == "sent"])
failed    = len(df[df["status"] == "failed"])
skipped   = len(df[df["status"] == "skipped"])
responded = int(df["responded"].sum()) if "responded" in df.columns else 0
resp_rate = round((responded / sent * 100), 1) if sent > 0 else 0.0

c1, c2, c3, c4, c5 = st.columns(5)

cards = [
    (c1, "📊", total,     "Total Emails",     "val-total"),
    (c2, "✅", sent,      "Sent Successfully", "val-sent"),
    (c3, "❌", failed + skipped, "Failed / Skipped", "val-failed"),
    (c4, "📩", responded, "Responses",         "val-resp"),
    (c5, "📈", f"{resp_rate}%", "Response Rate", "val-resp"),
]

for col, icon, val, label, css_cls in cards:
    with col:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-icon">{icon}</div>
            <div class="metric-value {css_cls}">{val}</div>
            <div class="metric-label">{label}</div>
        </div>
        """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════
#  CHARTS
# ══════════════════════════════════════════════════════════════════════

st.markdown('<div class="section-title">📊 Analytics</div>', unsafe_allow_html=True)

chart1, chart2 = st.columns(2)

# ── Pie chart: status breakdown ─────────────────────────────────────
with chart1:
    status_counts = df["status"].value_counts().reset_index()
    status_counts.columns = ["Status", "Count"]

    color_map = {"sent": "#43e97b", "failed": "#f5576c", "skipped": "#ffc947", "pending": "#888"}

    fig_pie = px.pie(
        status_counts, values="Count", names="Status",
        color="Status", color_discrete_map=color_map,
        hole=0.55,
    )
    fig_pie.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#ccc", family="Inter"),
        legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5),
        margin=dict(t=30, b=30, l=20, r=20),
        title=dict(text="Email Status Breakdown", font=dict(size=16, color="#ddd")),
    )
    fig_pie.update_traces(textinfo="label+percent", textfont_size=13)
    st.plotly_chart(fig_pie, use_container_width=True)

# ── Bar chart: sent vs responded ────────────────────────────────────
with chart2:
    fig_bar = go.Figure()
    fig_bar.add_trace(go.Bar(
        x=["Sent", "Responded"], y=[sent, responded],
        marker_color=["#667eea", "#ffc947"],
        text=[sent, responded], textposition="auto",
        textfont=dict(size=18, color="#fff"),
    ))
    fig_bar.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#ccc", family="Inter"),
        yaxis=dict(gridcolor="rgba(255,255,255,0.05)", title=""),
        xaxis=dict(title=""),
        margin=dict(t=40, b=30, l=20, r=20),
        title=dict(text="Sent vs Responses", font=dict(size=16, color="#ddd")),
    )
    st.plotly_chart(fig_bar, use_container_width=True)


# ══════════════════════════════════════════════════════════════════════
#  DETAILED TABLE
# ══════════════════════════════════════════════════════════════════════

st.markdown('<div class="section-title">📋 All Emails</div>', unsafe_allow_html=True)

# Filter controls
f1, f2, f3 = st.columns([2, 2, 2])
with f1:
    search = st.text_input("🔍 Search company or position", "")
with f2:
    status_filter = st.multiselect("Filter by status", options=df["status"].unique().tolist(), default=df["status"].unique().tolist())
with f3:
    response_filter = st.selectbox("Response filter", ["All", "Responded only", "No response yet"])

# Apply filters
filtered = df[df["status"].isin(status_filter)]

if search:
    mask = (
        filtered["company"].str.contains(search, case=False, na=False) |
        filtered["position"].str.contains(search, case=False, na=False)
    )
    filtered = filtered[mask]

if response_filter == "Responded only":
    filtered = filtered[filtered["responded"] == 1]
elif response_filter == "No response yet":
    filtered = filtered[filtered["responded"] == 0]

# Display table
display_cols = ["company", "position", "hr_email", "status", "responded", "sent_at", "responded_at"]
available_cols = [c for c in display_cols if c in filtered.columns]

display_df = filtered[available_cols].copy()
display_df.columns = [c.replace("_", " ").title() for c in available_cols]

# Pretty status icons
if "Status" in display_df.columns:
    display_df["Status"] = display_df["Status"].map(
        {"sent": "✅ Sent", "failed": "❌ Failed", "skipped": "⏭ Skipped", "pending": "⏳ Pending"}
    ).fillna(display_df["Status"] if "Status" in display_df.columns else "")

if "Responded" in display_df.columns:
    display_df["Responded"] = display_df["Responded"].map({1: "📩 Yes", 0: "—"})

st.dataframe(
    display_df,
    use_container_width=True,
    height=min(400, 40 + len(display_df) * 35),
    hide_index=True,
)

st.caption(f"Showing {len(filtered)} of {total} emails")
