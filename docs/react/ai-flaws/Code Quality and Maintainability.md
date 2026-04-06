# Code Quality and Maintainability

## Architectural design

AI cannot understand your application's full architecture or long-term maintenance needs.
It tends to generate simple, isolated solutions that ignore existing patterns, folder conventions, or the way data flows through your app.

**Example — AI drops a fetch directly into a component instead of following an established data-fetching layer:**

```tsx
// ❌ AI-generated: ignores your existing useFetch/apiClient conventions
function UserProfile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(setUser);
  }, [id]);

  return <div>{user?.name}</div>;
}

// ✅ Fits the project's established pattern
function UserProfile({ id }: { id: string }) {
  const { data: user } = useUser(id); // shared hook, handles caching/errors/loading
  return <div>{user?.name}</div>;
}
```

Always ask: *does this fit how we already do things*, not just *does it work in isolation*.

---

## Boilerplate and "slop"

AI output can be difficult to review and maintain: 

— unnecessary complexity
- duplicated utility functions across files
- verbose code that could be expressed in a few lines

It optimizes for completeness over clarity, you often get more code than you need.

**Example — duplicated helpers that already exist elsewhere:**

```tsx
// ❌ AI re-implements a formatting utility that already lives in src/utils/format.ts
function UserCard({ joinedAt }: { joinedAt: string }) {
  const formatted = new Date(joinedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return <p>Joined: {formatted}</p>;
}

// ✅ Re-use what exists
import { formatDate } from "@/utils/format";

function UserCard({ joinedAt }: { joinedAt: string }) {
  return <p>Joined: {formatDate(joinedAt)}</p>;
}
```

Review generated code the same way you'd review a PR from a junior developer who doesn't know the codebase yet.

## Idiomatic React

AI defaults to "lowest common denominator" examples and frequently produces outdated patterns.

For example:

- overusing `useEffect` for derived values
- misusing `useRef` for state tracking
- reaching for imperative DOM manipulation when a declarative approach is simpler

**Example — deriving state inside an effect instead of computing it inline:**

```tsx
// ❌ Unnecessary effect to derive a value from existing state
const [items, setItems] = useState<Item[]>([]);
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(items.length); // triggers an extra render for no reason
}, [items]);

// ✅ Derived values don't need state at all
const [items, setItems] = useState<Item[]>([]);
const count = items.length; // just a variable
```

**Example — misusing `useRef` to track something that should be state:**

```tsx
// ❌ AI uses a ref to "remember" a value across renders, then tries to show it in the UI
const isSubmitted = useRef(false);
const handleSubmit = () => { isSubmitted.current = true; };
return <p>{isSubmitted.current ? "Submitted" : "Pending"}</p>; // won't re-render!

// ✅ If it needs to appear in the UI, it belongs in state
const [isSubmitted, setIsSubmitted] = useState(false);
const handleSubmit = () => setIsSubmitted(true);
return <p>{isSubmitted ? "Submitted" : "Pending"}</p>;
```

## Complex state management

AI struggles with non-trivial forms or application-wide state.
It produces messy `useState` chains and tangled `useEffect` logic that would be better served by dedicated libraries.

**Example — re-implementing what `react-hook-form` does, badly:**

```tsx
// ❌ Manual form state: no validation, no touched tracking, no error display strategy
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [nameError, setNameError] = useState("");

const handleSubmit = () => {
  if (!name) setNameError("Required");
  // ... grows indefinitely with each new field
};

// ✅ react-hook-form handles validation, errors, touched state, and performance
import { useForm } from "react-hook-form";

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register("name", { required: "Required" })} />
    {errors.name && <span>{errors.name.message}</span>}
  </form>
);
```

**Example — scattered global state instead of a store:**

```tsx
// ❌ Prop-drilling or context abuse for state that many components need
function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  return <ProductList cart={cart} setCart={setCart} />; // passed down 4 levels...
}

// ✅ A small Zustand store keeps the logic in one place
import { create } from "zustand";

const useCartStore = create<CartStore>(set => ({
  items: [],
  addItem: item => set(state => ({ items: [...state.items, item] })),
}));
```

When AI produces long chains of `useState` + `useEffect`, treat it as a signal to reach for the right abstraction rather than accepting the generated shape as-is.
