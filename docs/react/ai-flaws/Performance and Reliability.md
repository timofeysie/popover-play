# Performance and Reliability

## Performance killers

Performance regressions, such as:

- infinite API call loops, 
- missing debouncing on search inputs

Models also fail to use optimization techniques like:

- image lazy loading
- code splitting
- table virtualization for large datasets

## Lack of context

Models focus on solving the immediate prompt without awareness of the system as a whole (e.g., fetching 100 items from an API when only 4 are displayed).

## Missing resilience

Often a model will omit crucial resilience mechanisms like these which can cause system failures under real-world traffic.

- timeouts, 
- retries, or 
- proper error boundaries
