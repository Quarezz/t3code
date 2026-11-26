# Maintaining this fork

This is an unofficial fork of [T3 Code](https://github.com/pingdotgg/t3code).

Keep the fork's changes on its `main` branch. To update it, merge upstream into the fork
instead of resetting the fork to upstream. The merge keeps both histories.

Add the upstream remote once if you cloned the fork yourself.

```sh
git remote add upstream https://github.com/pingdotgg/t3code.git
```

From a clean checkout, run these commands when you want to update. Stop if any command fails.

```sh
git switch main
git pull --ff-only origin main
git fetch upstream main
git merge --no-edit upstream/main
```

Resolve any conflicts and test the build before running `git push origin main`.
To back out of a conflicted merge, run `git merge --abort`. Do not use a force sync.
