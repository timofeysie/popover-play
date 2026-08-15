# Performance and Reliability

## Infinite API loops

AI-generated `useEffect` calls often trigger the exact request loop they're meant to prevent: an effect updates state, the state change triggers a re-render, the re-render re-runs the effect, and so on — hammering the backend with duplicate requests. The usual cause is a missing or wrong dependency array.

**Example — an effect that re-triggers itself:**

```tsx
// ❌ No dependency array: the effect reruns on every render,
// and setUser triggers exactly that
function UserProfile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }); // <- missing [id]

  return <div>{user?.name}</div>;
}

// ✅ Dependency array scopes the effect to actual input changes
function UserProfile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }, [id]);

  return <div>{user?.name}</div>;
}
```

---

## Missing debounce on search

A search input wired directly to `onChange` fires one request per keystroke — typing "product" is 7 API calls instead of 1. In one project the source article reviewed, this pattern produced 50+ search requests/sec at peak; adding debouncing brought it down to 2–3 requests/sec.

**Example:**

```tsx
// ❌ Every keystroke hits the network
function Search() {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    fetch(`/api/search?q=${e.target.value}`).then(/* ... */);
  };

  return <input onChange={handleChange} />;
}

// ✅ Debounce collapses bursts of keystrokes into one request
function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetch(`/api/search?q=${debouncedQuery}`).then(/* ... */);
  }, [debouncedQuery]);

  return <input onChange={e => setQuery(e.target.value)} />;
}
```

---

## Over-fetching and lack of context

Models solve the immediate prompt without awareness of the system as a whole. Instead of asking the backend for the shape it actually needs, they pull raw data and process it client-side — e.g. hitting `/api/users` and counting rows in the frontend instead of requesting a count endpoint, or loading every one of a user's files ("sometimes hundreds") to display only 4. Fetching the full list instead of paginating it was measured, in one case, at a 2MB payload instead of 50KB.

**Example:**

```tsx
// ❌ Fetches everything, computes a total on the client
function UserCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(users => setCount(users.length));
  }, []);

  return <p>{count} users</p>;
}

// ✅ Asks the backend for the number it needs
function UserCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/users/count").then(r => r.json()).then(({ count }) => setCount(count));
  }, []);

  return <p>{count} users</p>;
}
```

---

## Missing lazy loading

Images load eagerly regardless of whether they're in the viewport. A landing page that loaded 20 images up front but displayed 3 on screen improved Time to Interactive by ~2 seconds once the offscreen images were deferred.

**Example:**

```tsx
// ❌ All images load immediately, even offscreen ones
<img src={product.imageUrl} alt={product.name} />

// ✅ Defer offscreen images to the browser's native lazy loading
<img src={product.imageUrl} alt={product.name} loading="lazy" />
```

---

## Missing virtualization for large datasets

A plain `.map()` over rows works fine in a demo and falls over in production. One dashboard became unusable past ~500 rows; virtualizing the list let it handle 10,000 rows smoothly by only rendering what's in (or near) the viewport.

**Example:**

```tsx
// ❌ Renders every row's DOM node up front, however many there are
function Table({ rows }: { rows: Row[] }) {
  return <div>{rows.map(row => <TableRow key={row.id} {...row} />)}</div>;
}

// ✅ Only the visible slice is ever mounted
import { FixedSizeList } from "react-window";

function Table({ rows }: { rows: Row[] }) {
  return (
    <FixedSizeList height={600} itemCount={rows.length} itemSize={40} width="100%">
      {({ index, style }) => <TableRow style={style} {...rows[index]} />}
    </FixedSizeList>
  );
}
```

---

## Missing resilience

AI optimizes for the literal request — ask for "a fetch call" and that's what you get, with no timeout, no retry, and no boundary to contain a failure. Under real-world network conditions (slow connections, flaky endpoints, transient 5xxs) that turns a single failed request into a broken page instead of a recoverable error.

**Example:**

```tsx
// ❌ No timeout, no retry, no fallback UI on failure
function Profile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }, [id]);

  return <div>{user?.name}</div>;
}

// ✅ Bounded request, wrapped by an <ErrorBoundary> higher up the
// tree so a failed fetch degrades to a fallback instead of crashing
function Profile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(`/api/users/${id}`, { signal: controller.signal })
      .then(r => r.json())
      .then(setUser)
      .finally(() => clearTimeout(timeout));

    return () => controller.abort();
  }, [id]);

  return <div>{user?.name}</div>;
}
```
