# Math for Machine Learning

A decision tree is a decision support recursive partitioning structure that uses a tree-like model of decisions and their possible consequences, including chance event outcomes, resource costs, and utility. It is one way to display an algorithm that only contains conditional control statements.

## Mathematics Refresher for Decision Trees

### I. Core Concepts (Essential)

#### Algebra and Functions

- **Basic Arithmetic Operations**: Addition, subtraction, multiplication, division. (Fundamental)
- **Variables and Expressions**: Understanding how to work with symbols representing values.
- **Equations and Inequalities**: Solving for unknowns, understanding relationships (e.g., $x > 5$).
- **Functions**: Input-output relationships, common functions (linear, polynomial).

**Linear function** — whenever a situation involves a consistent relationship between two variables, a linear equation can be used to represent and analyze that relationship.

**Polynomials** — polynomial equations with two variables allow us to represent how multiple factors influence a single outcome. By understanding and manipulating these equations, we can optimize designs, make predictions, and solve complex problems in various fields.

The path of a ball thrown is modeled by a quadratic polynomial (a polynomial of degree 2):

$$h(t) = at^2 + bt + c$$

relating height ($h$) to the time in the air ($t$).

**Logarithms**: Understanding $\log_b(x) = y \iff b^y = x$. This is crucial for entropy and information gain.

$\log_b(x) = y$ is the inverse operation of exponentiation, where $b^y = x$. In simple terms, it answers the question: "What exponent do I need to raise the base $b$ to in order to get the number $x$?"

Logarithms are the mathematical tool that allows us to quantify information and uncertainty in a way that is consistent with probability and allows for a meaningful measure of information gain.

#### Basic Statistics

**Measures of Central Tendency:**

- **Mean (Average)**: Sum of values divided by count.
- **Median**: Middle value when sorted.
- **Mode**: Most frequent value.

**Measures of Dispersion:**

- **Variance**: Average of the squared differences from the mean.
  $$\sigma^2 = \frac{\sum (x_i - \mu)^2}{N}$$
- **Standard Deviation**: Square root of the variance.
  $$\sigma = \sqrt{\sigma^2}$$

- **Frequency Distributions**: Understanding how data is distributed.
- **Proportions and Percentages**: Basic calculations.

### II. Probability (Crucial for Splitting Criteria)

#### Basic Probability

- **Definitions**: Experiment, outcome, sample space, event.
- **Calculating Probability**: Number of favorable outcomes / Total number of outcomes.
- **Rules of Probability:**
  - Addition Rule: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$
  - Multiplication Rule: $P(A \cap B) = P(A) \times P(B|A)$ (for dependent events)
  - Complement Rule: $P(A') = 1 - P(A)$
- **Conditional Probability**: $P(A|B) = \frac{P(A \cap B)}{P(B)}$ (Probability of A given B)

#### Information Theory Concepts (Directly applied in Decision Trees)

- **Entropy**: A measure of impurity or uncertainty in a set of data.
  - Formula for a binary classification: $H(S) = -p_1 \log_2(p_1) - p_0 \log_2(p_0)$
  - Understanding that higher entropy means more disorder.
- **Information Gain**: The reduction in entropy achieved by splitting data on an attribute. This is how decision trees choose the best split.
  - Formula: $IG(S, A) = H(S) - \sum_{v \in Values(A)} \frac{|S_v|}{|S|} H(S_v)$
- **Gini Impurity (or Gini Index)**: Another measure of impurity, commonly used in CART (Classification and Regression Trees).
  - Formula for a binary classification: $Gini(S) = 1 - (p_1^2 + p_0^2)$
  - Understanding that lower Gini impurity means more homogeneity.

### III. Linear Algebra (Less direct for basic decision trees, but good for context)

For basic decision trees, linear algebra isn't as central as probability/statistics. However, if you move into more complex tree-based models (like gradient boosting where individual trees might fit residuals), or want a deeper understanding of underlying data representations, it becomes more relevant.

- **Vectors and Matrices**: Basic understanding of their representation and operations (addition, scalar multiplication).
- **Dot Product (Scalar Product)**: Useful in understanding how features combine.

### IV. Calculus (Primarily for Optimization & Regression Trees)

For classification decision trees (like ID3, C4.5), basic calculus isn't strictly necessary.

For Regression Trees (e.g., in CART), and particularly for understanding how more advanced tree-based models (like Gradient Boosting Machines) are optimized, basic calculus is helpful:

- **Derivatives**: Understanding rates of change, slopes.
- **Minima and Maxima**: Identifying where functions are minimized or maximized. This is relevant for algorithms that aim to minimize error (e.g., Mean Squared Error in regression trees).

### V. Specific Concepts for Decision Trees

**Tree Structure:**

- **Nodes**: Root node, internal nodes (decision nodes), leaf nodes (terminal nodes).
- **Branches**: Representing the outcome of a decision at a node.

**Splitting Criteria:**

- Information Gain (using Entropy) — for ID3, C4.5.
- Gini Impurity — for CART.
- Mean Squared Error (MSE) / Variance Reduction — for Regression Trees.

**Overfitting and Pruning:**

- Understanding why trees can become too complex and memorize training data.
- Basic idea of how pruning (e.g., using a complexity parameter $\alpha$) helps generalize.

**Ensemble Methods (Brief Introduction):**

While not strictly decision tree math, understanding how decision trees are used in more powerful models like Random Forests and Gradient Boosting Machines (XGBoost, LightGBM) provides important context.

### Recommended Study Approach

1. **Start with Statistics and Probability**: These are the most directly applicable. Focus heavily on entropy, information gain, and Gini impurity.
2. **Work through Examples**: Find online tutorials or textbooks that show step-by-step calculations for building a small decision tree using entropy/Gini impurity.
3. **Conceptual Understanding First**: Before diving deep into formulas, try to understand why these concepts are used (e.g., why do we want to reduce impurity?).
4. **Practice**: Solve problems and, if possible, try implementing a simple decision tree from scratch in Python (even just the splitting logic) to solidify your understanding.

---

## NP (Nondeterministic Polynomial)
