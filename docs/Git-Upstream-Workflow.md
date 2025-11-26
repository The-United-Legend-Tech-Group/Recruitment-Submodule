# Git Upstream Workflow Guide

This guide explains how to work with the Arcana repository as the central upstream repository. Sub-repositories (forks) will use this workflow to stay synchronized with the main repository and contribute changes through pull requests.

## Overview

In this workflow:
- **Arcana** is the main repository (upstream) that all sub-repos will sync with
- **Sub-repos (forks)** are individual team copies where developers work
- Developers commit, pull, and push to their fork normally
- Changes are synced with the main repo using the **upstream remote** (`git fetch upstream` and `git merge upstream/main`)
- Contributors create new branches to submit pull requests for review

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Daily Workflow](#daily-workflow)
3. [Syncing with Upstream](#syncing-with-upstream)
4. [Creating a Pull Request](#creating-a-pull-request)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Step 1: Fork the Repository

1. Navigate to the Arcana repository on GitHub
2. Click the **Fork** button in the top-right corner
3. Select your account or organization to create the fork

### Step 2: Clone Your Fork

Clone your forked repository to your local machine:

```bash
git clone https://github.com/YOUR-USERNAME/Arcana.git
cd Arcana
```

### Step 3: Add Upstream Remote

Add the original Arcana repository as the upstream remote:

```bash
git remote add upstream https://github.com/The-United-Legend-Tech-Group/Arcana.git
```

### Step 4: Verify Remotes

Confirm that both remotes are configured correctly:

```bash
git remote -v
```

Expected output:
```
origin    https://github.com/YOUR-USERNAME/Arcana.git (fetch)
origin    https://github.com/YOUR-USERNAME/Arcana.git (push)
upstream  https://github.com/The-United-Legend-Tech-Group/Arcana.git (fetch)
upstream  https://github.com/The-United-Legend-Tech-Group/Arcana.git (push)
```

---

## Daily Workflow

### Working on Your Fork

For regular development work, use standard git commands with your fork:

```bash
# Pull latest changes from your fork
git pull origin main

# Make changes to your code
# ...

# Stage and commit changes
git add .
git commit -m "Your commit message"

# Push to your fork
git push origin main
```

---

## Syncing with Upstream

To keep your fork up-to-date with the main Arcana repository, follow these steps:

### Step 1: Fetch Upstream Changes

Fetch the latest changes from the upstream repository:

```bash
git fetch upstream
```

### Step 2: Switch to Main Branch

Ensure you're on your local main branch:

```bash
git checkout main
```

### Step 3: Merge Upstream Changes

Merge the upstream main branch into your local main:

```bash
git merge upstream/main
```

Alternatively, you can use rebase for a cleaner history:

```bash
git rebase upstream/main
```

### Step 4: Push Updates to Your Fork

Push the synchronized changes to your fork:

```bash
git push origin main
```

### Quick Sync Command

You can combine these steps into a single workflow:

```bash
git fetch upstream && git checkout main && git merge upstream/main && git push origin main
```

---

## Creating a Pull Request

When you're ready to contribute changes back to the main Arcana repository:

### Step 1: Sync with Upstream First

Always sync with upstream before creating a feature branch:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### Step 2: Create a New Branch

Create a new branch for your feature or fix:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - for new features
- `bugfix/` - for bug fixes
- `hotfix/` - for urgent fixes
- `docs/` - for documentation changes

### Step 3: Make Your Changes

Develop your feature on this branch:

```bash
# Make your code changes
# ...

# Stage changes
git add .

# Commit with a descriptive message
git commit -m "feat: add your feature description"
```

### Step 4: Push Your Branch to Your Fork

Push your feature branch to your fork:

```bash
git push origin feature/your-feature-name
```

### Step 5: Create Pull Request on GitHub

1. Navigate to the original Arcana repository on GitHub
2. You should see a prompt to create a pull request from your recently pushed branch
3. Click **Compare & pull request**
4. Fill in the pull request details:
   - **Title**: Clear, concise description of the change
   - **Description**: Detailed explanation of what was changed and why
5. Select reviewers if required
6. Click **Create pull request**

### Step 6: Address Review Feedback

If reviewers request changes:

```bash
# Make requested changes on your feature branch
git add .
git commit -m "fix: address review feedback"
git push origin feature/your-feature-name
```

The pull request will automatically update with your new commits.

---

## Best Practices

### Commit Messages

Follow conventional commit format:
- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation changes
- `refactor:` - code refactoring
- `test:` - adding tests
- `chore:` - maintenance tasks

Example:
```bash
git commit -m "feat: add user authentication module"
```

### Sync Frequently

Sync with upstream regularly to avoid large merge conflicts:

```bash
# Do this at least once a day
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Keep Branches Small

- Create focused branches for specific features
- Avoid combining unrelated changes in one branch
- Delete branches after they are merged

### Before Creating a Pull Request

1. ✅ Sync with upstream
2. ✅ Create a new branch from updated main
3. ✅ Make focused changes
4. ✅ Write clear commit messages
5. ✅ Test your changes locally
6. ✅ Push to your fork
7. ✅ Create pull request

---

## Troubleshooting

### Merge Conflicts

If you encounter merge conflicts when syncing:

```bash
# After running git merge upstream/main
# Git will indicate conflicted files

# Open conflicted files and resolve conflicts manually
# Look for conflict markers: <<<<<<<, =======, >>>>>>>

# After resolving conflicts
git add .
git commit -m "chore: resolve merge conflicts"
git push origin main
```

### Upstream Not Configured

If you get an error about upstream not being found:

```bash
git remote add upstream https://github.com/The-United-Legend-Tech-Group/Arcana.git
```

### Accidentally Committed to Main

If you accidentally committed to main instead of a feature branch:

```bash
# Create a new branch with your changes
git branch feature/your-feature-name

# Reset main to match upstream
git fetch upstream
git reset --hard upstream/main

# Switch to your feature branch
git checkout feature/your-feature-name
```

### Stale Feature Branch

If your feature branch is outdated:

```bash
# Update main first
git checkout main
git fetch upstream
git merge upstream/main

# Rebase your feature branch
git checkout feature/your-feature-name
git rebase main

# Force push to update your fork (only if no one else is using this branch)
# ⚠️ WARNING: Only use --force-with-lease when you are certain no one else is working
# on this branch. Force pushing rewrites history and can cause issues for collaborators.
git push origin feature/your-feature-name --force-with-lease
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Add upstream | `git remote add upstream https://github.com/The-United-Legend-Tech-Group/Arcana.git` |
| Fetch upstream | `git fetch upstream` |
| Merge upstream | `git merge upstream/main` |
| Create branch | `git checkout -b feature/name` |
| Push branch | `git push origin feature/name` |
| Sync main | `git fetch upstream && git checkout main && git merge upstream/main && git push origin main` |

---

## Summary

1. **Fork** the Arcana repository
2. **Clone** your fork locally
3. **Add upstream** remote pointing to the main Arcana repo
4. **Work normally** on your fork (commit, pull, push)
5. **Sync with upstream** regularly to stay updated
6. **Create a branch** when ready to contribute
7. **Push to your fork** and create a **pull request**
8. **Address feedback** from reviewers
9. Once approved, your changes will be **merged** into the main repository

---

## Need Help?

If you encounter issues not covered in this guide, please:
1. Check the [Git documentation](https://git-scm.com/doc)
2. Review [GitHub's fork workflow guide](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
3. Contact the repository maintainers
