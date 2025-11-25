from git import Repo
import os

repo_path = r"D:\DegreeProjects\Fyp\solveit-saas"

COMMIT_PER_FILE = True 
commit_message = """removed the lumberjack package for storage limitation reasons
"""

repo = Repo(repo_path)

if repo.is_dirty(untracked_files=True):
    diffs = repo.index.diff(None)
    untracked = repo.untracked_files

    all_changes = [d.a_path for d in diffs] + untracked
    print(f"Processing {len(all_changes)} changes...")

    for file_path in all_changes:
        if (not file_path):continue
        full_path = os.path.join(repo_path, file_path)

        try:
            if os.path.exists(full_path):
                print(f"Staging (Add): {file_path}")
                repo.index.add([full_path])
            else:
                print(f"Staging (Remove): {file_path}")
                repo.index.remove([file_path]) 
            
            if COMMIT_PER_FILE:
                print(f"Committing: {file_path}")
                repo.index.commit(commit_message)

        except Exception as e:
            print(f"Failed to process {file_path}: {e}")

    if not COMMIT_PER_FILE:
        repo.index.commit(commit_message)
        print("Done.")

else:
    print("No changes to commit.")