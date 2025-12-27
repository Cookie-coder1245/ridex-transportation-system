# How to Push RideX to GitHub

## Step-by-Step Guide

### 1. Initialize Git Repository

```bash
cd ridex_backend
git init
```

### 2. Add All Files

```bash
git add .
```

### 3. Create Initial Commit

```bash
git commit -m "Initial commit: RideX Smart Transportation System"
```

### 4. Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **"+"** icon in the top right
3. Select **"New repository"**
4. Name it: `ridex-transportation-system` (or any name you prefer)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

### 5. Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ridex-transportation-system.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Alternative: Using SSH

If you prefer SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/ridex-transportation-system.git
git branch -M main
git push -u origin main
```

## Quick Commands Summary

```bash
# Navigate to project
cd ridex_backend

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: RideX Smart Transportation System"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/ridex-transportation-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Authentication

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your GitHub password)
  - Go to: GitHub Settings → Developer settings → Personal access tokens → Generate new token
  - Select scopes: `repo`
  - Copy the token and use it as password

## Future Updates

After initial push, to update:

```bash
git add .
git commit -m "Your commit message"
git push
```

## Troubleshooting

**If you get "remote origin already exists":**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ridex-transportation-system.git
```

**If you need to force push (be careful!):**
```bash
git push -u origin main --force
```

---

**That's it! Your project is now on GitHub! 🎉**

