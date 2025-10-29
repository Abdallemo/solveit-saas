from git import Repo
import os

repo_path = r"D:\DegreeProjects\Fyp\solveit-saas"
commit_message = """Fully decouple WebSocket message handling via feature channels
Moves Chat, Comments, and Signaling from HTTP POST triggers to direct client-to-server WebSocket messaging using dedicated Go channels. This significantly improves real-time performance and reliability.
"""

repo = Repo(repo_path)

if repo.is_dirty(untracked_files=True):
    changed_files = [item.a_path for item in repo.index.diff(None)]
    changed_files += repo.untracked_files

    for file in changed_files:
        abs_path = os.path.join(repo_path, file)   # type: ignore
        if os.path.exists(abs_path):
            print(f"Staging and committing: {file}")
            repo.index.add([abs_path])
            repo.index.commit(commit_message)
        else:
            print(f"Skipping missing file: {file}")
else:
    print("No changes to commit.")