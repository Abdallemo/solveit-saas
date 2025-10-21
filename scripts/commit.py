from git import Repo
import os

repo_path = r"D:\DegreeProjects\Fyp\solveit-saas"
commit_message = """refactor: switch DisplayListComponent to client-side data flow w/ custom useQueryParam + react-query
Integrated custom useQueryParam manager to handle URL state sync without Next.js router.refresh.
Reworked DisplayListComponent to fetch data client-side via useQuery for smoother state updates,
removing SSR dependency and avoiding unnecessary reloads.
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