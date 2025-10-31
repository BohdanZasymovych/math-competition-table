# Math Competition Table

## Scoring system

- Each task starts with **10 points**
- **Correct answer**: Team receives the task's current value, then the task value decreases by 1 (minimum 1)
- **Wrong answer**: Task value increases by 1, and any team that previously solved that task gets +1 point
- **Duplicate submission**: Ignored (same team cannot submit the same task twice)


## How to restart competition

Open browser console (F12) and run:
```javascript
localStorage.setItem('submissions','[]'); localStorage.removeItem('timer'); localStorage.removeItem('COMPETITION_STAGE'); location.reload();
```
Then click "Start a Math Competition!" button.
