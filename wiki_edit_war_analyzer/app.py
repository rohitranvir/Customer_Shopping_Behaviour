"""
app.py
------
Streamlit dashboard for the Wikipedia Edit War Analyzer.
Run with:  streamlit run app.py
"""

import streamlit as st
import pandas as pd

# ── Page config must be the very first Streamlit call ─────────────────────────
st.set_page_config(
    page_title="Wikipedia Edit War Analyzer",
    page_icon="⚔️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Local module imports ───────────────────────────────────────────────────────
from api_fetcher        import fetch_revision_history
from data_processor     import process_revisions, compute_summary
from controversy_score  import compute_controversy_score
from visualizer         import (
    plot_edits_over_time,
    plot_reverts_over_time,
    plot_bot_vs_human,
    plot_top_editors,
    plot_conflict_language,
    plot_controversy_gauge,
)


# ──────────────────────────────────────────────────────────────────────────────
# Custom CSS – dark theme enhancements
# ──────────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* Main background */
    .stApp { background-color: #0e1117; }

    /* Score card styling */
    .score-card {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid #e63946;
        border-radius: 12px;
        padding: 18px 24px;
        text-align: center;
    }
    .score-number {
        font-size: 52px;
        font-weight: 800;
        color: #e63946;
        line-height: 1;
    }
    .score-label {
        font-size: 20px;
        color: #f1faee;
        margin-top: 4px;
    }

    /* Stat card */
    .stat-card {
        background: #1a1a2e;
        border-radius: 10px;
        padding: 14px 18px;
        border-left: 4px solid #4C9BE8;
        margin-bottom: 8px;
    }
    .stat-value { font-size: 28px; font-weight: 700; color: #4C9BE8; }
    .stat-label { font-size: 13px; color: #a8dadc; }

    /* Section headers */
    h2, h3 { color: #f1faee !important; }

    /* Sidebar */
    section[data-testid="stSidebar"] { background: #16213e; }

    /* Divider */
    hr { border-color: #2d3250; }

    /* DataTable tweaks */
    .dataframe { background: #16213e; }
</style>
""", unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────────────────────
# Sidebar
# ──────────────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## ⚔️ Edit War Analyzer")
    st.markdown("Detect edit wars and controversy in Wikipedia articles.")
    st.divider()

    article_title = st.text_input(
        "🔍 Wikipedia Article Title",
        placeholder="e.g. Flat Earth",
        help="Enter the exact Wikipedia article title (case-sensitive).",
    )

    run_btn = st.button("🚀 Analyze Article", type="primary", use_container_width=True)
    st.divider()

    st.markdown("### 💡 Example Articles")
    example_articles = [
        "Flat Earth",
        "Vaccine hesitancy",
        "Climate change",
        "Israel–Hamas war",
        "Donald Trump",
        "Homeopathy",
        "Genetically modified organism",
    ]
    for eg in example_articles:
        if st.button(eg, key=f"eg_{eg}", use_container_width=True):
            article_title = eg
            run_btn = True   # trigger analysis

    st.divider()
    st.caption("Data source: Wikipedia MediaWiki API")
    st.caption("⚠️ Large articles may take 10-30 seconds to fetch.")


# ──────────────────────────────────────────────────────────────────────────────
# Page Header
# ──────────────────────────────────────────────────────────────────────────────
st.markdown("# ⚔️ Wikipedia Edit War Analyzer")
st.markdown(
    "Analyse revision history to detect edit wars, identify controversies, "
    "and visualise editing behaviour."
)
st.divider()


# ──────────────────────────────────────────────────────────────────────────────
# Main analysis pipeline (runs when button is clicked)
# ──────────────────────────────────────────────────────────────────────────────
if run_btn and article_title:

    # ── Step 1: Fetch revisions ────────────────────────────────────────────
    with st.spinner(f"⏳ Fetching revision history for **{article_title}** …"):
        try:
            raw_df = fetch_revision_history(article_title)
        except ValueError as exc:
            st.error(f"❌ Input error: {exc}")
            st.stop()
        except RuntimeError as exc:
            st.error(f"❌ API error: {exc}")
            st.stop()

    if raw_df.empty:
        st.warning("⚠️ No revisions found. The article may be brand-new or restricted.")
        st.stop()

    # ── Step 2: Process data ───────────────────────────────────────────────
    with st.spinner("🔄 Processing revisions …"):
        df      = process_revisions(raw_df)
        summary = compute_summary(df)
        score_result = compute_controversy_score(df, summary)

    st.success(
        f"✅ Loaded **{summary['total_edits']:,}** revisions "
        f"({summary['first_edit']} → {summary['last_edit']})"
    )
    st.divider()

    # ── Controversy Score Banner ───────────────────────────────────────────
    st.markdown("## 🎯 Controversy Score")

    col_gauge, col_breakdown = st.columns([1.2, 1])

    with col_gauge:
        score = score_result["score"]
        label = score_result["label"]
        label_color = {"Low": "green", "Medium": "orange", "High": "red", "Extreme": "darkred"}
        fig_gauge = plot_controversy_gauge(score, label)
        st.plotly_chart(fig_gauge, use_container_width=True)

    with col_breakdown:
        st.markdown("#### Score Breakdown")

        metrics = [
            ("Revert Component",        score_result["revert_score"],  "Based on revert rate"),
            ("Editor Diversity",        score_result["editor_score"],  "Based on unique editors"),
            ("Edit Spike Frequency",    score_result["spike_score"],   "Based on traffic spikes"),
        ]
        for name, val, help_txt in metrics:
            st.metric(label=name, value=f"{val}/100", help=help_txt)

        verdict_colors = {
            "Low": "🟢", "Medium": "🟡", "High": "🔴", "Extreme": "🔥"
        }
        st.markdown(
            f"**Verdict:** {verdict_colors.get(label, '')} **{label} Controversy**"
        )

    st.divider()

    # ── Summary Statistics ─────────────────────────────────────────────────
    st.markdown("## 📊 Summary Statistics")

    stat_cols = st.columns(4)
    stats_to_show = [
        ("Total Edits",     f"{summary['total_edits']:,}",     stat_cols[0]),
        ("Total Reverts",   f"{summary['total_reverts']:,}",   stat_cols[1]),
        ("Revert Rate",     f"{summary['revert_rate']} %",     stat_cols[2]),
        ("Unique Editors",  f"{summary['unique_editors']:,}",  stat_cols[3]),
    ]
    for label_s, value_s, col in stats_to_show:
        with col:
            st.markdown(
                f"""<div class="stat-card">
                    <div class="stat-value">{value_s}</div>
                    <div class="stat-label">{label_s}</div>
                </div>""",
                unsafe_allow_html=True,
            )

    st.write("")  # spacer

    stat_cols2 = st.columns(4)
    stats_to_show2 = [
        ("Human Edits",      f"{summary['total_humans']:,}",   stat_cols2[0]),
        ("Bot Edits",        f"{summary['total_bots']:,}",      stat_cols2[1]),
        ("Spike Days",       f"{summary['spike_days']:,}",      stat_cols2[2]),
        ("NLP Conflicts",    f"{summary['nlp_conflicts']:,}",   stat_cols2[3]),
    ]
    for label_s, value_s, col in stats_to_show2:
        with col:
            st.markdown(
                f"""<div class="stat-card">
                    <div class="stat-value">{value_s}</div>
                    <div class="stat-label">{label_s}</div>
                </div>""",
                unsafe_allow_html=True,
            )

    st.divider()

    # ── Visualizations ─────────────────────────────────────────────────────
    st.markdown("## 📈 Visualizations")

    # Row 1: Edits over time | Reverts over time
    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(plot_edits_over_time(df), use_container_width=True)
    with col2:
        st.plotly_chart(plot_reverts_over_time(df), use_container_width=True)

    # Row 2: Bot vs Human | Top Editors
    col3, col4 = st.columns(2)
    with col3:
        st.plotly_chart(plot_bot_vs_human(summary), use_container_width=True)
    with col4:
        st.plotly_chart(plot_top_editors(summary), use_container_width=True)

    # Row 3: NLP conflict language (full width)
    st.plotly_chart(plot_conflict_language(df), use_container_width=True)

    st.divider()

    # ── Raw Data Table ─────────────────────────────────────────────────────
    with st.expander("🗂️ View Raw Revision Data (last 500 rows)", expanded=False):
        display_cols = ["timestamp", "user", "comment", "size", "size_delta",
                        "is_revert", "is_bot", "is_spike_day", "nlp_any_conflict"]
        display_cols = [c for c in display_cols if c in df.columns]

        page_df = df.tail(500)[display_cols].copy()
        page_df["timestamp"] = page_df["timestamp"].dt.tz_localize(None)   # avoid tz display issues

        st.dataframe(
            page_df,
            use_container_width=True,
            height=400,
        )

        csv = page_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            "⬇️ Download as CSV",
            data=csv,
            file_name=f"{article_title.replace(' ', '_')}_revisions.csv",
            mime="text/csv",
        )

elif run_btn and not article_title:
    st.warning("⚠️ Please enter an article title before clicking Analyze.")

else:
    # ── Default landing state ──────────────────────────────────────────────
    st.info(
        "👈 Enter a Wikipedia article title in the sidebar and click "
        "**Analyze Article** to get started."
    )

    st.markdown("### 🎯 What This Tool Does")
    col_a, col_b, col_c = st.columns(3)
    with col_a:
        st.markdown("""
**📥 Data Fetching**
- Full revision history via MediaWiki API
- Handles pagination automatically
- Rate-limit aware
        """)
    with col_b:
        st.markdown("""
**🔍 Analysis**
- Revert detection via keywords
- Bot vs human classification
- Edit spike detection
- NLP conflict language scoring
        """)
    with col_c:
        st.markdown("""
**📊 Visualizations**
- Weekly edit activity
- Revert timeline
- Bot vs human breakdown
- Top editors leaderboard
        """)
