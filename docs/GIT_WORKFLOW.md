# Git Workflow & Contribution Rules

This is a quick guide on how we’re handling branches, commits, and PRs for the project. 

NOTE: Nothing overly strict — just enough structure so everyone works smoothly together.

---

# 1. 🚫 Don’t Push Directly to `main`

Please avoid committing straight to `main`.  
All changes should go through a **Pull Request**, so there’s always a chance to review and catch issues early.

`main` stays clean and always in a working state.

---

# 2. 🌿 Branch Naming

For branches tied to GitHub issues, use:

```
issue-<number>-<short-description>
```

Examples:

```
issue-3-users-crud
issue-9-auth-layer
issue-15-event-model
issue-22-comments-endpoints
```

Keep names lowercase, short, and hyphen-separated.

---

## 🔧 Non-issue branches

If you’re working on something not tied to a GitHub issue (small fixes, experiments, cleanup, minor enhancements), you *can* use branches like:

```
feat/<short-description>
fix/<short-description>
refactor/<short-description>
chore/<short-description>
docs/<short-description>
```

Examples:

```
feat/add-logging
fix/profile-route
refactor/user-controller
docs/update-readme
```

This isn’t strict — it’s just a nice way to keep things organized.

---

# 3. ✍️ Commit Message Format

Use **imperative tense** for commit messages.  
(Think: “do”, “add”, “fix” — not “did”, “added”, “fixed”.)

### Common verbs:
```
add
update
fix
implement
remove
refactor
improve
```

### Examples:
```
feat(users): implement CRUD layer (#3)
feat(auth): implement authentication middleware (#9)
fix(routes): correct profile route path
refactor(model): clean up validation rules
```

As long as it’s clear what the commit does, you're good.

---

# 4. 🔀 Pull Requests

We will avoid pushing directly to master to avoid conflict between team members hence we go take the branch to PR route.

When opening a PR, please include:

- A clear title  
- A short explanation of what changed  

### Basic flow:
```
1. Create a feature branch
2. Commit using the standards above
3. Push the branch
4. Open a Pull Request to main
5. Merge to main
```

That’s pretty much it — simple and consistent.

---
