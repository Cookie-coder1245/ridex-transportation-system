# How to Push the Updated Version to GitHub

This guide explains how to push the **new** changes (e.g., the updated fare‑calculation logic) to GitHub **without losing** the previous version that already exists in the remote repository.

---

## 1️⃣ Verify the repository status
```bash
cd d:\Ridex_project
git status
```
You should see the files you modified (e.g., `static/js/script.js`, `README.md`, `PUSH_GUIDE.md`) listed under *"Changes not staged for commit"*.

---

## 2️⃣ Stage the changes you want to push
You can stage everything or pick specific files.
```bash
# Stage all modified files
git add .

# Or stage only selected files
# git add static/js/script.js README.md PUSH_GUIDE.md
```

---

## 3️⃣ Commit the changes
Write a clear commit message that describes what you changed.
```bash
git commit -m "Add fuel‑cost calculation to fare and update README with full formula"
```
If you prefer to open an editor for a multi‑line message, omit `-m`.

---

## 4️⃣ Ensure you are on the correct branch
The main development branch in this project is **`main`**.
```bash
git branch   # shows the current branch
# If you are not on main, switch to it
git checkout main
```
If you are working on a feature branch, push that branch instead (see step 6).

---

## 5️⃣ Pull the latest remote changes (optional but recommended)
This prevents merge conflicts if someone else pushed meanwhile.
```bash
git pull origin main
```
Resolve any conflicts, then repeat **step 2** and **step 3** if needed.

---

## 6️⃣ Push the new commit to GitHub
```bash
git push origin main
```
If you are on a different branch (e.g., `feature/fare-update`), push that branch:
```bash
git push origin feature/fare-update
```
GitHub will now contain **both** the previous commit(s) and the new commit you just pushed. The history is preserved, so you can always revert or view older versions.

---

## 7️⃣ Verify on GitHub
Open the repository URL in a browser:
```
https://github.com/Cookie-coder1245/ridex-transportation-system
```
Check the *Commits* tab – you should see your new commit on top of the existing ones.

---

## 8️⃣ (Optional) Tag the new version
If you want to mark this release, create a tag:
```bash
git tag -a v1.1 -m "Add fuel‑cost fare calculation"
git push origin v1.1
```
Tags are useful for releases and for quickly checking out a specific version later.

---

### Summary of Commands
```bash
cd d:\Ridex_project
git status
git add .
git commit -m "Add fuel‑cost calculation to fare and update README with full formula"
git checkout main   # if needed
git pull origin main  # optional
git push origin main
# optional tag
# git tag -a v1.1 -m "Add fuel‑cost fare calculation"
# git push origin v1.1
```

---

**That’s it!** Your updated code is now safely stored on GitHub while the previous version remains in the repository’s history.
