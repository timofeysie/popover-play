# Math Refresher Plan for Reading ISL

4–6 weeks of focused review (≈2–5 hours/week)

## What the Formula Uses (Equation 2.12 Example)

$$\text{Pr}(Y = j \mid X = x_0) = \frac{1}{K} \sum_{i \in \mathcal{N}_0} I(y_i = j)$$

To read this comfortably, you need:

| Concept | What it means | Your gap |
|--------|----------------|----------|
| **Conditional probability** | $\text{Pr}(Y = j \mid X = x_0)$ = probability of $Y = j$ *given* $X = x_0$ | Likely familiar from stats, but notation may be rusty |
| **Set membership** | $i \in \mathcal{N}_0$ = "index $i$ is in the set $\mathcal{N}_0$" | Set notation often skipped in calculus |
| **Summation** | $\sum_{i \in \mathcal{N}_0}$ = sum over all $i$ in that set | Basic but worth a quick pass |
| **Indicator function** | $I(y_i = j)$ = 1 if true, 0 if false | Common in stats, rarely taught explicitly |

---

## Prerequisites (What ISL Assumes)

From the book’s “Who Should Read This Book?” section:

- At least one **elementary statistics course** (descriptive stats, basic probability, maybe regression)
- Comfort with **mathematical notation** at an advanced-undergrad level

Your calculus background helps with derivatives and integrals later in the book. The main gaps are:

1. **Probability** (especially conditional probability and Bayes)
2. **Notation** (sets, sums, indicators, matrices)
3. **Linear algebra** (vectors, matrices, dot products) — used in regression and beyond

---

## Suggested Learning Path

### Phase 1: Probability & Notation (≈1–2 weeks)

**1. Probability basics**

- **Khan Academy – Probability and Statistics**
  - [Probability](https://www.khanacademy.org/math/statistics-probability/probability-library)
  - [Conditional probability](https://www.khanacademy.org/math/statistics-probability/probability-library/conditional-probability-independence)
- **3Blue1Brown – Bayes theorem**
  - [Video: Bayes theorem](https://www.youtube.com/watch?v=HZGCoVF3YvM)
- **Book (optional):** *Think Stats* (Allen Downey) — free online, Python-based, gentle intro

**2. Set notation and summation**

- **Khan Academy – Precalculus**
  - [Set notation](https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:prob-comb)
- **3Blue1Brown – Essence of Linear Algebra**
  - [Vectors](https://www.youtube.com/watch?v=fNk_zzaMoSs) — helps with notation and intuition
- **Practice:** Write out $\sum_{i=1}^{n} x_i$ and $\sum_{i \in S} f(i)$ in plain English

**3. Indicator functions**

- **Stat 414 (Penn State) – Indicator functions**
  - [Online notes](https://online.stat.psu.edu/stat414/lesson/3/3.1)
- **Concept:** $I(\text{condition}) = 1$ if condition is true, $0$ otherwise. Used to count things in sums.

---

### Phase 2: Linear Algebra (≈1–2 weeks)

ISL uses matrices and vectors for regression, PCA, etc.

- **3Blue1Brown – Essence of Linear Algebra** (full playlist)
  - [Playlist](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)
- **Khan Academy – Linear algebra**
  - [Vectors and spaces](https://www.khanacademy.org/math/linear-algebra)
- **Focus:** Vectors, dot products, matrix multiplication, inverses, eigenvalues (high-level intuition)

---

### Phase 3: Statistics for ML (≈1 week)

- **StatQuest (Josh Starmer) – YouTube**
  - K-Nearest Neighbors, regression, bias–variance, cross-validation
  - Very visual, minimal math at first
- **ISL companion**
  - [ISL website](https://www.statlearning.com/) — R code, datasets, errata
  - [Python companion](https://github.com/empathy87/Introduction-to-Statistical-Learning) — if you prefer Python

---

## Reading Strategy for ISL

1. **Skim the math** on first pass — get the intuition from the prose and figures.
2. **Return to formulas** after Phase 1–2 — decode each symbol and rewrite in plain language.
3. **Use the exercises** — implement KNN, linear regression, etc. in Python to solidify understanding.
4. **Keep a notation cheat sheet** — e.g. $\mathcal{N}_0$ = neighborhood, $I(\cdot)$ = indicator, $\sum$ = sum over set.

---

## Quick Reference: Decoding Equation 2.12

| Symbol | Meaning |
|--------|---------|
| $\text{Pr}(Y = j \mid X = x_0)$ | Probability that the response is class $j$, given input $x_0$ |
| $K$ | Number of nearest neighbors |
| $\mathcal{N}_0$ | Set of indices of the $K$ nearest training points to $x_0$ |
| $i \in \mathcal{N}_0$ | For each index $i$ in that neighborhood |
| $I(y_i = j)$ | 1 if training point $i$ has class $j$, else 0 |
| $\frac{1}{K} \sum_{i \in \mathcal{N}_0} I(y_i = j)$ | Fraction of neighbors with class $j$ = estimated probability of class $j$ |

---

## Estimated Timeline

| Phase | Content | Time |
|-------|---------|------|
| Phase 1 | Probability, sets, summation, indicators | 1–2 weeks (2–5 hrs/week) |
| Phase 2 | Linear algebra essentials | 1–2 weeks (2–5 hrs/week) |
| Phase 3 | Stats/ML intuition + ISL companion | 1 week + ongoing |
| **Total** | Ready to read ISL with confidence | **~4–6 weeks** |

---

## Recommended Order of Sources

1. **Khan Academy** – Probability & conditional probability (free, structured)
2. **3Blue1Brown** – Bayes, linear algebra (visual, intuition-first)
3. **Stat 414 notes** – Indicator functions (short, focused)
4. **StatQuest** – ML concepts (before or alongside ISL)
5. **ISL + Python companion** – Main text + hands-on practice

---

## LeetCode Problems That Use These Concepts

Practice problems that reinforce the math you're learning:

### K-Nearest Neighbors (directly related to equation 2.12)

| Problem | # | Difficulty | What it reinforces |
|---------|---|------------|-------------------|
| [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) | 973 | Medium | Finding $\mathcal{N}_0$ — the K nearest points to a query. Uses Euclidean distance. |
| [K-th Nearest Obstacle Queries](https://leetcode.com/problems/k-th-nearest-obstacle-queries/) | 3275 | Medium | K-nearest with Manhattan distance, dynamic queries. |

### Probability

| Problem | # | Difficulty | What it reinforces |
|---------|---|------------|-------------------|
| [Knight Probability in Chessboard](https://leetcode.com/problems/knight-probability-in-chessboard/) | 688 | Medium | Computing probabilities over multiple steps (compound probability). |
| [Path with Maximum Probability](https://leetcode.com/problems/path-with-maximum-probability/) | 1514 | Medium | Finding path with max success probability; conditional-like reasoning. |
| [Random Pick Index](https://leetcode.com/problems/random-pick-index/) | 398 | Medium | Uniform sampling (each index has equal probability) — reservoir sampling. |
| [Linked List Random Node](https://leetcode.com/problems/linked-list-random-node/) | 382 | Medium | Reservoir sampling with unknown stream length. |

### Summation & indicator functions

Counting "how many satisfy condition" is $\sum_i I(\text{condition})$. These problems use that idea:

| Problem | # | Difficulty | What it reinforces |
|---------|---|------------|-------------------|
| [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/) | 560 | Medium | Prefix sums ($\sum$ over ranges); counting subarrays. |
| [Subarray Sums Divisible by K](https://leetcode.com/problems/subarray-sums-divisible-by-k/) | 974 | Medium | Same summation logic with modulo. |
| [Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/) | 209 | Medium | Optimization over subarray sums. |

### Set membership ($i \in S$)

Problems that rely on set/hash membership (the $\in$ idea):

| Problem | # | Difficulty | What it reinforces |
|---------|---|------------|-------------------|
| [Two Sum](https://leetcode.com/problems/two-sum/) | 1 | Easy | "Is complement in seen set?" |
| [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) | 217 | Easy | Membership in a set. |
| [Group Anagrams](https://leetcode.com/problems/group-anagrams/) | 49 | Medium | Partitioning by equivalence (set-like grouping). |

### Suggested order

1. **Start with K Closest Points to Origin (973)** — directly implements the "find K nearest" step of KNN.
2. **Knight Probability (688)** or **Path with Maximum Probability (1514)** — after Phase 1 probability.
3. **Subarray Sum Equals K (560)** — after summation/prefix-sum review.
4. **Random Pick Index (398)** — after reservoir sampling / uniform probability.

---

## Bottom Line

You already have calculus. The main work is:

- **Probability** (conditional probability, Bayes)
- **Notation** (sets, sums, indicators)
- **Linear algebra** (vectors, matrices)

