import re
from typing import List, Dict, Any, Set

def extract_columns_from_condition(cond_str: str) -> List[str]:
    """
    Extract potential column names from PostgreSQL EXPLAIN condition strings.
    E.g., '(users.age > 18)' -> ['users.age']
    """
    # Find word tokens that might represent columns
    tokens = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*\.?[a-zA-Z_][a-zA-Z0-9_]*)\b', cond_str)
    
    # Simple stopwords to filter out SQL keywords and common types
    stopwords = {"AND", "OR", "NOT", "IS", "NULL", "TRUE", "FALSE", "TEXT", "VARCHAR", "INT", "INTEGER", "DATE", "TIMESTAMP", "ANY", "IN"}
    cols = [t for t in tokens if t.upper() not in stopwords and not t.isdigit()]
    return list(set(cols))

def analyze_node_for_indexes(node: Dict[str, Any], recommendations: Set[str]):
    node_type = node.get("Node Type", "")
    relation = node.get("Relation Name", "UnknownTable")
    
    if node_type == "Seq Scan":
        if "Filter" in node:
            cols = extract_columns_from_condition(node["Filter"])
            if cols:
                recommendations.add(f"Table '{relation}': Consider indexing columns {cols} used in Filter to avoid Seq Scan.")
    elif node_type in ["Hash Join", "Merge Join", "Nested Loop"]:
        conds = []
        if "Hash Cond" in node: conds.append(node["Hash Cond"])
        if "Merge Cond" in node: conds.append(node["Merge Cond"])
        if "Join Filter" in node: conds.append(node["Join Filter"])
        for cond in conds:
            cols = extract_columns_from_condition(cond)
            if cols:
                recommendations.add(f"Join Condition: Consider indexing columns {cols} to optimize join performance.")
    elif node_type == "Sort":
        if "Sort Key" in node:
            keys = node["Sort Key"]
            recommendations.add(f"Sort Key: Consider an index covering {keys} to avoid in-memory or disk sort.")
    elif node_type == "Aggregate":
        if "Group Key" in node:
            keys = node["Group Key"]
            recommendations.add(f"Group By: Consider an index covering {keys} to optimize grouping.")
            
    if "Plans" in node:
        for child in node["Plans"]:
            analyze_node_for_indexes(child, recommendations)

def suggest_indexes(plan_json: List[Dict[str, Any]]) -> List[str]:
    """
    Given a parsed PostgreSQL JSON query plan, return a list of human-readable
    index recommendations based on slow node types like Seq Scans, Sorts, and Joins.
    """
    recs = set()
    if plan_json and len(plan_json) > 0:
        root = plan_json[0].get("Plan")
        if root:
            analyze_node_for_indexes(root, recs)
    return list(recs)
