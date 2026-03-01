import streamlit as st
import requests
from components.plan_visualizer import generate_plan_graph

st.set_page_config(
    page_title="Query Analyzer 🚀",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("Database Query Performance Analyzer 🚀")
st.markdown("Advanced tool with real-time monitoring, ML predictions, and intelligent optimization suggestions.")

import requests
from components.plan_visualizer import generate_plan_graph
import pandas as pd

col1, col2 = st.columns([2, 1])

# Initialize session state for plan rendering
if 'plan_data' not in st.session_state:
    st.session_state['plan_data'] = None

nav = st.sidebar.radio("Go to", ["Query Analyzer", "Dashboard History", "Index Advisor"])

if nav == "Dashboard History":
    st.subheader("Query Execution History Dashboard")
    try:
        response = requests.get("http://127.0.0.1:8000/api/v1/history?limit=20")
        if response.status_code == 200:
            history = response.json()
            if history:
                df = pd.DataFrame(history)
                # Convert timestamp for better viewing
                df['timestamp'] = pd.to_datetime(df['timestamp']).dt.strftime('%Y-%m-%d %H:%M:%S')
                st.dataframe(df[['timestamp', 'profile', 'execution_time_ms', 'total_cost', 'query_text']])
            else:
                st.info("No query history recorded yet.")
        else:
            st.error("Failed to load history.")
    except requests.exceptions.ConnectionError:
            st.error("Could not connect to the Backend API. Is it running?")

elif nav == "Index Advisor":
    st.subheader("Smart Index Advisor 🧠")
    st.markdown("Analyzing historical query plans to identify missing indexes on sequential scans, sorts, and joins.")
    
    if st.button("Generate Recommendations", type="primary"):
        with st.spinner("Analyzing slow queries..."):
            try:
                response = requests.get("http://127.0.0.1:8000/api/v1/index_advisor?limit=10")
                if response.status_code == 200:
                    recs = response.json()
                    if recs:
                        for idx, item in enumerate(recs):
                            with st.expander(f"Query {item['query_id']} Recommendations"):
                                st.code(item['query_text'], language="sql")
                                st.markdown("**Suggested Indexes:**")
                                for rec in item['recommendations']:
                                    st.success(rec)
                    else:
                        st.info("No index recommendations found. Your recent queries look well-optimized! 🎉")
                else:
                    st.error(f"Error fetching recommendations: {response.text}")
            except requests.exceptions.ConnectionError:
                st.error("Could not connect to the Backend API. Is it running?")


elif nav == "Query Analyzer":
    with col1:
        st.subheader("Analyze Query")
        query = st.text_area("Enter your SQL Query", height=250, placeholder="EXPLAIN ANALYZE SELECT * FROM your_table WHERE id = 1;")
        profile = st.selectbox("Database Profile", ["dev", "staging", "prod"])
        if st.button("Analyze Query", type="primary"):
            with st.spinner("Analyzing..."):
                try:
                    response = requests.post("http://127.0.0.1:8000/api/v1/analyze", json={"query": query, "profile": profile})
                    if response.status_code == 200:
                        data = response.json()
                        st.success("Query analyzed successfully!")
                        st.session_state['plan_data'] = data["plan"]
                    else:
                        st.error(f"Error: {response.text}")
                        st.session_state['plan_data'] = None
                except requests.exceptions.ConnectionError:
                    st.error("Could not connect to the Backend API. Is it running?")
                    st.session_state['plan_data'] = None
                # The following two lines were duplicates and incorrectly indented, removed as part of the fix.
                # st.error("Could not connect to the Backend API. Is it running?")
                # st.session_state['plan_data'] = None

    with col2:
        st.subheader("Quick Metrics")
        
        # Calculate simple aggregate metrics if plan exists
        cost = "N/A"
        time = "N/A"
        if st.session_state['plan_data'] and len(st.session_state['plan_data']) > 0:
            root_plan = st.session_state['plan_data'][0].get("Plan", {})
            cost = f"{root_plan.get('Total Cost', 0):.2f}"
            time = f"{root_plan.get('Actual Total Time', 0):.2f} ms" if root_plan.get('Actual Total Time') else "N/A"

        st.metric(label="Estimated Cost", value=cost, delta=None)
        st.metric(label="Execution Time", value=time, delta=None)
        st.metric(label="Cache Hit Ratio", value="N/A", delta=None)

    st.divider()

    st.subheader("Query Plan Visualization")
    if st.session_state['plan_data']:
        graph = generate_plan_graph(st.session_state['plan_data'])
        st.graphviz_chart(graph)
        with st.expander("Raw JSON Plan"):
            st.json(st.session_state['plan_data'])
    else:
        st.markdown("*Visual plan graph will render here after execution.*")
