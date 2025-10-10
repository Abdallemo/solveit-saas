from git import Repo
import os

repo_path = r"D:\DegreeProjects\Fyp\solveit-saas"
commit_message = """Add persistent floating video UI via Zustand global state
Implements a global Zustand store to cache live WebRTC stream data, decoupling it from unmounting route components. This fixes state loss on navigation and enables the display of a persistent, minimized video call interface in the main chat view."""

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