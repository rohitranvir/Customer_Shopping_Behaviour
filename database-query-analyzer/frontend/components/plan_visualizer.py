import graphviz
from typing import Dict, Any

def parse_explain_node(node: Dict[str, Any], graph: graphviz.Digraph, parent_id: str = None) -> str:
    """Recursively parse the EXPLAIN JSON output and construct a graphviz Digraph."""
    node_id = str(id(node))
    node_type = node.get("Node Type", "Unknown")
    total_cost = node.get("Total Cost", 0)
    actual_time = node.get("Actual Total Time", 0) # Requires EXPLAIN ANALYZE
    
    # Determine color based on cost heuristics (could make this dynamic relative to total query cost)
    color = "white"
    if total_cost > 1000:
        color = "#ffcccc" # Light Red
    elif total_cost > 100:
        color = "#ffebcc" # Light Orange
    elif total_cost > 10:
        color = "#ffffcc" # Light Yellow
    else:
        color = "#ccffcc" # Light Green
    
    label = f"<<TABLE BORDER='0' CELLBORDER='1' CELLSPACING='0'>\n"
    label += f"<TR><TD COLSPAN='2'><B>{node_type}</B></TD></TR>\n"
    label += f"<TR><TD>Cost</TD><TD>{total_cost:.2f}</TD></TR>\n"
    if actual_time > 0:
        label += f"<TR><TD>Time(ms)</TD><TD>{actual_time:.3f}</TD></TR>\n"
    
    # Add other interesting metrics if available
    if "Relation Name" in node:
        label += f"<TR><TD>Relation</TD><TD>{node['Relation Name']}</TD></TR>\n"
    if "Rows Removed by Filter" in node:
        label += f"<TR><TD>Rows Removed</TD><TD>{node['Rows Removed by Filter']}</TD></TR>\n"

    label += "</TABLE>>"
    
    graph.node(node_id, label=label, shape="none", style="filled", fillcolor=color)
    
    if parent_id:
        graph.edge(node_id, parent_id, label=f" {node.get('Plan Rows', 0)} rows")
    
    # Process children nodes
    if "Plans" in node:
        for child_plan in node["Plans"]:
            parse_explain_node(child_plan, graph, node_id)
            
    return node_id

def generate_plan_graph(plan_json: list) -> graphviz.Digraph:
    """Generate a graphviz Digraph from PostgreSQL EXPLAIN ANALYZE FORMAT JSON output."""
    diagram = graphviz.Digraph(format='svg')
    diagram.attr(rankdir='BT')  # Bottom to Top (Data flowing up to the root)
    
    if not plan_json or not isinstance(plan_json, list) or len(plan_json) == 0:
        diagram.node("error", "Invalid Plan Data")
        return diagram
    
    root_node = plan_json[0].get("Plan")
    if root_node:
        parse_explain_node(root_node, diagram)
    else:
        diagram.node("error", "No Plan Node Found")
        
    return diagram
