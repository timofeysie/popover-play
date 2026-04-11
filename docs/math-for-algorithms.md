# Math for Algorithms — Glossary (Complexity & NP)

## Linear function

whenever a situation involves a consistent relationship between two variables, a linear equation can be used to represent and analyze that relationship.

## Polynomials

Polynomial equations with two variables allow us to represent how multiple factors influence a single outcome. By understanding and manipulating these equations, we can optimize designs, make predictions, and solve complex problems in various fields.
The path of a ball thrown is modeled by a quadratic polynomial (a polynomial of degree 2). h(t) = at^2 + bt + c, height (h) to the time in the air (t).

## Logarithms

Understanding $\log_b(x) = y \iff b^y = x$. This is crucial for entropy and information gain (often $\log_2$ in bits).

$\log_b(x) = y$ is the inverse of exponentiation: $b^y = x$. In plain language: “What exponent do I raise base $b$ to in order to get $x$?”

Logarithms let you express information and uncertainty in a way that lines up with probability; **information gain** in trees uses base-2 logs, written $\log_2$ in math mode or log₂ in plain text.

## Source paragraph (context)

*More NP-complete problems are described. Although Turing machines still are not explicitly mentioned, the definition of NP was changed to follow the Garey and Johnson definition of nondeterministic Turing machines. The notion of a polynomial transformation is defined more formally than in the first edition. I have added a discussion of two fundamental ideas: how to interpret the "length of the input" for number problems (e.g., prime testing), and the relation between the difficulty of decision problems and the related optimization problems. There is a new approximation algorithm for graph coloring.* (Computer Algorithms by Sara Base, 2nd edition)

---

## Terms

### Turing machine (TM)

A simple formal model of computation: a finite control, a read/write tape, and transition rules. It is the standard way to define what “algorithm” and “time” mean rigorously in complexity theory. “Not explicitly mentioned” in a text usually means the author still uses TM-based definitions informally while avoiding the full formalism.

### Nondeterministic Turing machine (NTM)

A Turing machine that may branch: at some steps it can follow several possible transitions. A string is *accepted* if *some* sequence of choices leads to acceptance. **NP** is often defined as the class of languages decidable by a *nondeterministic* TM in *polynomial time* (polynomial in the input length).

### NP (nondeterministic polynomial time)

The class of decision problems for which a proposed solution (certificate/witness) can be *verified* in polynomial time—or equivalently, problems solvable by a nondeterministic TM in polynomial time. The “Garey and Johnson” style ties this definition explicitly to NTMs and input length.

### NP-complete

A decision problem $X$ is **NP-complete** if:

1. $X$ is in **NP**, and
2. every problem in NP reduces to $X$ in polynomial time (via polynomial transformations / Karp reductions).

Intuitively: NP-complete problems are the “hardest” problems in NP; solving one in polynomial time would imply **P = NP**.

### Garey and Johnson

*Michael R. Garey and David S. Johnson*, authors of *Computers and Intractability: A Guide to the Theory of NP-Completeness* (1979). Their book standardizes definitions (NP, reductions, NP-completeness) and catalogs many NP-complete problems. “Following Garey and Johnson” usually means: TM-based definitions, careful treatment of encodings, and Karp-style reductions.

### Polynomial transformation (Karp reduction)

A many-one reduction between decision problems: a function $f$ computable in polynomial time such that for every instance $x$, $x$ is a *yes*-instance of problem $A$ if and only if $f(x)$ is a *yes*-instance of problem $B$. It is the usual tool for proving NP-completeness. “More formally than in the first edition” often means explicit requirements on $f$ and on how instances are encoded.

### Length of the input

The number of symbols in a reasonable encoding of an instance (often bits). Complexity is stated as a function of this length. For **number problems**, one must decide whether numbers are written in unary, binary, etc.—that choice changes whether a problem is in P, NP, or worse.

### Number problems (e.g. prime testing)

Problems whose instances include integers (primality, factoring, subset sum with large integers). **Prime testing** (is $n$ prime?) is a classic **decision** problem; its hardness depends on encoding: binary input length is $\Theta(\log n)$, so “polynomial time” means polynomial in $\log n$.

### Decision problem

A problem with a **yes** or **no** answer on each instance (e.g. “Is this graph $k$-colorable?”). Complexity classes like P and NP are usually defined for decision problems. **Optimization problems** (“find the minimum number of colors”) are often related but not identical.

### Optimization problem

A problem that asks for a *best* value or solution (minimum cost, maximum profit, smallest coloring number, etc.). Typically:

- The **decision** version (“Is there a solution with cost $\leq k$?”) is used for NP classification.
- The **optimization** version can be harder to classify in the same way; the paragraph’s “relation between difficulty” addresses how bounds transfer between the two.

### Approximation algorithm

An algorithm that runs in polynomial time and returns a feasible solution whose quality is **provably** within a guaranteed factor of the optimum (or satisfies a similar guarantee). Used when exact optimization is NP-hard; **graph coloring** is a standard setting where approximation results matter.

### Graph coloring

Assigning colors to vertices so that adjacent vertices get different colors. The **decision** problem (e.g. $k$-colorability for fixed $k$) is a standard NP-complete example; the **optimization** version minimizes the number of colors. New **approximation algorithms** give better worst-case guarantees or simpler proofs for certain graph classes or problem variants.

## Basic Statistics

Notes aimed at **decision trees** (splits, impurity, ensembles). Organized as in the original outline.

### I. Descriptive statistics

#### Measures of central tendency

- **Mean (average):** Sum of values divided by count.
- **Median:** Middle value when sorted.
- **Mode:** Most frequent value.

#### Measures of dispersion

- **Variance:** Average of squared differences from the mean:
  $\sigma^2 = \frac{\sum (x_i - \mu)^2}{N}$
- **Standard deviation:** Square root of the variance:
  $\sigma = \sqrt{\sigma^2}$

#### Other topics

- **Frequency distributions:** How data is spread across values or bins.
- **Proportions and percentages:** Basic calculations.

### II. Probability (crucial for splitting criteria)

#### Basic probability

- **Definitions:** Experiment, outcome, sample space, event.
- **Calculating probability:** Favorable outcomes / total outcomes (when equally likely).
- **Rules of probability:**
  - **Addition:** $P(A \cup B) = P(A) + P(B) - P(A \cap B)$
  - **Multiplication:** $P(A \cap B) = P(A) \times P(B \mid A)$ (dependent events)
  - **Complement:** $P(A') = 1 - P(A)$
- **Conditional probability:** $P(A \mid B) = \frac{P(A \cap B)}{P(B)}$

#### Information theory (used in decision trees)

- **Entropy:** Impurity or uncertainty in a set.
  - Binary classification:
    $H(S) = -p_1 \log_2(p_1) - p_0 \log_2(p_0)$
  - Higher entropy ⇒ more disorder.
- **Information gain:** Reduction in entropy after splitting on an attribute; often used to pick the best split.
  $IG(S, A) = H(S) - \sum_{v \in Values(A)} \frac{|S_v|}{|S|} H(S_v)$
- **Gini impurity (Gini index):** Common in CART.
  - Binary classification:
    $Gini(S) = 1 - (p_1^2 + p_0^2)$
  - Lower Gini ⇒ more homogeneity.

### III. Linear algebra (less direct for basic trees)

For basic classification trees, linear algebra is less central than probability and statistics. It matters more for gradient boosting (trees fitting residuals) and for how feature vectors are represented.

- **Vectors and matrices:** Representation; addition; scalar multiplication.
- **Dot (scalar) product:** How features combine in many models.

### IV. Calculus (optimization and regression trees)

Basic calculus is not strictly required for ID3/C4.5-style classification trees. It helps for **regression trees** (CART) and for **gradient boosting**, where optimization uses derivatives and extrema.

- **Derivatives:** Rates of change, slopes.
- **Minima and maxima:** Where a loss (e.g. mean squared error) is minimized.

### V. Concepts specific to decision trees

#### Tree structure

- **Nodes:** Root, internal (decision), leaf (terminal).
- **Branches:** Outcomes of a test at a node.

#### Splitting criteria

- **Information gain (entropy):** ID3, C4.5.
- **Gini impurity:** CART (classification).
- **Mean squared error / variance reduction:** Regression trees.

#### Overfitting and pruning

- Why deep trees can memorize training data.
- **Pruning** (e.g. complexity parameter $\alpha$) to improve generalization.

#### Ensemble methods (brief)

Decision trees as building blocks in **random forests** and **gradient boosting** (e.g. XGBoost, LightGBM).

### Recommended study approach

1. **Start with statistics and probability** — most directly applicable; prioritize entropy, information gain, and Gini impurity.
2. **Work through examples** — step-by-step builds of a small tree using entropy or Gini.
3. **Concepts before algebra** — why reduce impurity before memorizing every formula.
4. **Practice** — exercises and, if useful, a minimal split-from-scratch implementation in Python.
