from api_fetcher import fetch_revision_history
from data_processor import process_revisions, compute_summary
from controversy_score import compute_controversy_score

print("Fetching revisions for 'Flat Earth'...")
df = fetch_revision_history("Flat Earth")
df = process_revisions(df)
summary = compute_summary(df)
score = compute_controversy_score(df, summary)

print(f"Total revisions : {summary['total_edits']}")
print(f"Total reverts   : {summary['total_reverts']}")
print(f"Unique editors  : {summary['unique_editors']}")
print(f"Controversy     : {score['score']} / 100 ({score['label']})")
