# Use Async Hook

![npm](https://img.shields.io/npm/v/react-generic-use-async)

A simple utility hook to execute asynchronous code within a React component, heavily inspired by Apollo hooks. The hook itself returns `loading`, `error` and `value` states for the executed function, and a retry method. These can all be destructured from the hook like so:

```
const [{ loading, error, value }, retry] = useAsync(() => Promise.resolve(true));
```
