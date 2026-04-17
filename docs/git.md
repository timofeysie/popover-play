# Git issues

## Divergent branches

```
timo@Timothys-MacBook-Pro popover-play % git pull
remote: Enumerating objects: 14, done.
remote: Counting objects: 100% (14/14), done.
remote: Compressing objects: 100% (5/5), done.
   12cc25a..4e8167d  main       -> origin/main
hint: You have divergent branches and need to specify how to reconcile them.
hint: You can do so by running one of the following commands sometime before
hint: your next pull:
hint:
hint:   git config pull.rebase false  # merge
hint:   git config pull.rebase true   # rebase
hint:   git config pull.ff only       # fast-forward only
hint:
hint: You can replace "git config" with "git config --global" to set a default
hint: preference for all repositories. You can also pass --rebase, --no-rebase,
hint: or --ff-only on the command line to override the configured default per
hint: invocation.
fatal: Need to specify how to reconcile divergent branches.
```

### Comparison of reconcile options

#### `git config pull.rebase false` — merge

Creates a merge commit that joins the two divergent histories. The commit graph shows both lines of work explicitly, including when they diverged and where they reunited.

- **Pro:** Preserves the full, honest history of what happened and when.
- **Pro:** Non-destructive — existing commits are never rewritten.
- **Con:** Produces extra merge commits that can clutter the log, especially on active branches.
- **Best for:** Teams that value a complete audit trail and work on long-lived feature branches.

#### `git config pull.rebase true` — rebase

Replays your local commits on top of the incoming commits, as if you had started from the latest remote state. The result is a linear history with no merge commit.

- **Pro:** Clean, linear history that is easy to read with `git log`.
- **Pro:** Avoids noisy merge commits for routine pulls.
- **Con:** Rewrites local commit SHAs — never rebase commits that have already been pushed and shared.
- **Con:** Rebase conflicts must be resolved commit-by-commit, which can be tedious for long divergences.
- **Best for:** Solo developers or teams that enforce a linear history policy.

### `git config pull.ff only` — fast-forward only

Refuses to pull unless the local branch can simply be moved forward to the remote tip (i.e. no divergence exists). If the branches have truly diverged, the pull fails and you must reconcile manually.

- **Pro:** Safest option — never silently creates merge commits or rewrites history.
- **Pro:** Forces you to make a conscious decision about how to reconcile.
- **Con:** Requires an extra step (manual merge or rebase) whenever branches diverge.
- **Best for:** Teams with strict history policies who want full control over every integration.

### Quick-reference table

| | Creates merge commit | Rewrites history | Fails on divergence |
|---|---|---|---|
| `--no-rebase` (merge) | Yes | No | No |
| `--rebase` | No | Yes (local only) | No |
| `--ff-only` | No | No | Yes |

### Recommendation

For most solo or small-team workflows, `pull.rebase true` keeps the log readable. Set it globally with:

```bash
git config --global pull.rebase true
```

If you are unsure, `pull.ff only` is the safest default because it never makes a silent decision on your behalf.

### My solution

As a solo developer, I chose `git config pull.rebase true`.

Here is the git log after the pull:

```
commit df3e10eec6b382264ad1d2c3e1bead031a446064 (HEAD -> main)
Author: tim.curchod <tim.curchod@8pod.com>
Date:   Sat Apr 18 09:03:49 2026 +1000
    add notes on git rebase options
commit 451c145f147fc9f3a805df30f8a779b2740b5bb9
Date:   Sat Apr 18 08:22:36 2026 +1000
    create two sum demo
Date:   Sat Apr 18 08:16:48 2026 +1000
    add details on two sum solution evolution
commit 55b4c8f660c434d7f12e3c07818095b319b36c80
Author: tim_curchod <timofeyc@hotmail.com>
Date:   Sat Apr 11 18:24:12 2026 +1000
    add notes on math for algorithms
```

Note the two users which resulted in this issue:
My personal account: <timofeyc@hotmail.com>
My work github account: <tim.curchod@8pod.com>

I shouldn't really work on personal projects on my work laptop, but since this repo is about learning and career development which is open source and will only enrich my work, it seems OK here.
