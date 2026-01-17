# Agent Instructions

## React Optimization

This project uses **React 19 with React Compiler**. Do not use manual optimization hooks such as:

- `useMemo`
- `useCallback`
- `React.memo`

The React Compiler automatically handles memoization and optimization, making these hooks unnecessary.
