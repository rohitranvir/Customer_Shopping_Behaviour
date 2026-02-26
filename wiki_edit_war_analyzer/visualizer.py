"""
visualizer.py
-------------
Generates all Plotly visualizations for the Wikipedia Edit War Analyzer.
Each function returns a plotly.graph_objects.Figure that can be rendered
directly in the Streamlit dashboard.
"""

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


# ──────────────────────────────────────────────────────────────────────────────
# Colour palette
# ──────────────────────────────────────────────────────────────────────────────
COLOR_HUMAN  = "#4C9BE8"
COLOR_BOT    = "#F4A261"
COLOR_REVERT = "#E63946"
COLOR_NEUTRAL = "#6A994E"


def plot_edits_over_time(df: pd.DataFrame) -> go.Figure:
    """
    Line chart: number of edits per week over the article's full history.
    Spike days are highlighted in the background.
    """
    if df.empty:
        return go.Figure()

    # Resample to weekly counts
    df_indexed = df.set_index("timestamp").sort_index()
    weekly = df_indexed.resample("W").size().reset_index()
    weekly.columns = ["week", "edits"]

    fig = px.line(
        weekly,
        x="week",
        y="edits",
        title="📈 Weekly Edit Activity",
        labels={"week": "Date", "edits": "Edit Count"},
        color_discrete_sequence=[COLOR_HUMAN],
    )
    fig.update_traces(mode="lines+markers", marker=dict(size=4))
    fig.update_layout(
        hovermode="x unified",
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
        title_font_size=16,
    )
    return fig


def plot_reverts_over_time(df: pd.DataFrame) -> go.Figure:
    """
    Bar chart: weekly revert counts vs total edits (stacked).
    """
    if df.empty:
        return go.Figure()

    df_indexed = df.set_index("timestamp").sort_index()

    weekly_total   = df_indexed.resample("W").size().rename("total")
    weekly_reverts = df_indexed[df_indexed["is_revert"]].resample("W").size().rename("reverts")

    combined = pd.concat([weekly_total, weekly_reverts], axis=1).fillna(0).reset_index()
    combined.columns = ["week", "total", "reverts"]
    combined["normal"] = combined["total"] - combined["reverts"]

    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=combined["week"], y=combined["normal"],
        name="Normal Edits",
        marker_color=COLOR_NEUTRAL,
    ))
    fig.add_trace(go.Bar(
        x=combined["week"], y=combined["reverts"],
        name="Reverts",
        marker_color=COLOR_REVERT,
    ))
    fig.update_layout(
        barmode="stack",
        title="⚔️ Reverts vs Normal Edits Over Time",
        xaxis_title="Date",
        yaxis_title="Edit Count",
        hovermode="x unified",
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
        title_font_size=16,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    )
    return fig


def plot_bot_vs_human(summary: dict) -> go.Figure:
    """
    Horizontal bar chart comparing bot vs human edit counts.
    """
    if not summary:
        return go.Figure()

    categories = ["Human Edits", "Bot Edits"]
    values     = [summary.get("total_humans", 0), summary.get("total_bots", 0)]
    colors     = [COLOR_HUMAN, COLOR_BOT]

    fig = go.Figure(go.Bar(
        x=values,
        y=categories,
        orientation="h",
        marker_color=colors,
        text=values,
        textposition="auto",
    ))
    fig.update_layout(
        title="🤖 Bot vs Human Edits",
        xaxis_title="Number of Edits",
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
        title_font_size=16,
    )
    return fig


def plot_top_editors(summary: dict, top_n: int = 10) -> go.Figure:
    """
    Horizontal bar chart of the top N most active editors.
    """
    top_editors = summary.get("top_editors", {})
    if not top_editors:
        return go.Figure()

    editors = list(top_editors.keys())[:top_n]
    counts  = list(top_editors.values())[:top_n]
    colors  = [COLOR_BOT if "bot" in e.lower() else COLOR_HUMAN for e in editors]

    fig = go.Figure(go.Bar(
        x=counts,
        y=editors,
        orientation="h",
        marker_color=colors,
        text=counts,
        textposition="auto",
    ))
    fig.update_layout(
        title=f"🏆 Top {top_n} Most Active Editors",
        xaxis_title="Number of Edits",
        yaxis=dict(autorange="reversed"),
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
        title_font_size=16,
        height=max(300, top_n * 40),
    )
    return fig


def plot_conflict_language(df: pd.DataFrame) -> go.Figure:
    """
    Pie chart: distribution of NLP-detected conflict language categories
    found in edit comments.
    """
    if df.empty:
        return go.Figure()

    from config import CONFLICT_KEYWORDS  # avoid circular at module level

    category_counts = {}
    for category in CONFLICT_KEYWORDS:
        col = f"nlp_{category}"
        if col in df.columns:
            count = int(df[col].sum())
            if count > 0:
                category_counts[category] = count

    if not category_counts:
        # Nothing detected – return a simple message figure
        fig = go.Figure()
        fig.add_annotation(
            text="No conflict language detected in comments.",
            xref="paper", yref="paper",
            x=0.5, y=0.5, showarrow=False,
            font=dict(size=14, color="white"),
        )
        fig.update_layout(
            paper_bgcolor="#0e1117",
            plot_bgcolor="#0e1117",
            title="💬 Conflict Language in Edit Comments",
        )
        return fig

    labels = list(category_counts.keys())
    values = list(category_counts.values())

    fig = go.Figure(go.Pie(
        labels=labels,
        values=values,
        hole=0.4,
        marker=dict(colors=px.colors.qualitative.Bold),
    ))
    fig.update_layout(
        title="💬 Conflict Language in Edit Comments",
        paper_bgcolor="#0e1117",
        plot_bgcolor="#0e1117",
        font_color="white",
        title_font_size=16,
    )
    return fig


def plot_controversy_gauge(score: float, label: str) -> go.Figure:
    """
    Gauge meter for the overall controversy score.
    """
    color_map = {
        "Low":     "green",
        "Medium":  "orange",
        "High":    "red",
        "Extreme": "darkred",
    }
    bar_color = color_map.get(label, "gray")

    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=score,
        title={"text": f"Controversy Score — {label}", "font": {"color": "white", "size": 18}},
        number={"font": {"color": "white", "size": 40}},
        gauge={
            "axis": {"range": [0, 100], "tickcolor": "white"},
            "bar":  {"color": bar_color},
            "steps": [
                {"range": [0,  25], "color": "#1a472a"},
                {"range": [25, 50], "color": "#4a3728"},
                {"range": [50, 75], "color": "#6b2727"},
                {"range": [75, 100],"color": "#4a0000"},
            ],
            "threshold": {
                "line": {"color": "white", "width": 3},
                "thickness": 0.75,
                "value": score,
            },
        },
    ))
    fig.update_layout(
        paper_bgcolor="#0e1117",
        font_color="white",
        height=280,
    )
    return fig
