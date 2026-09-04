const test = require('node:test');
const assert = require('node:assert/strict');
const { computeStandings } = require('./scoring.js');

const divisions = [
  { id: 'a', name: 'TISD' },
  { id: 'b', name: 'ESDD' },
  { id: 'c', name: 'TBMD' }
];

function standings(games, log) {
  return computeStandings({ divisions, games, log });
}

function total(rows, divisionId) {
  return rows.find((row) => row.division.id === divisionId).total;
}

test('empty log gives every division zero points', () => {
  const rows = standings([], []);
  assert.deepEqual(rows.map((row) => row.total), [0, 0, 0]);
});

test('single winner awards points only to the latest winner', () => {
  const rows = standings([
    { id: 'toss', name: 'Water Balloon Toss', scoringType: 'single', pointsForWin: 5 }
  ], [
    { gameId: 'toss', divisionId: 'a', timestamp: 1 },
    { gameId: 'toss', divisionId: 'b', timestamp: 2 }
  ]);

  assert.equal(total(rows, 'a'), 0);
  assert.equal(total(rows, 'b'), 5);
});

test('repeatable wins add points for each logged result', () => {
  const rows = standings([
    { id: 'cornhole', name: 'Cornhole', scoringType: 'repeatable', pointsPerWin: 1 }
  ], [
    { gameId: 'cornhole', divisionId: 'a', timestamp: 1 },
    { gameId: 'cornhole', divisionId: 'a', timestamp: 2 },
    { gameId: 'cornhole', divisionId: 'b', timestamp: 3 }
  ]);

  assert.equal(total(rows, 'a'), 2);
  assert.equal(total(rows, 'b'), 1);
});

test('non-repeatable categories keep only their latest winner', () => {
  const rows = standings([
    {
      id: 'planes',
      name: 'Paper Airplanes',
      scoringType: 'multi-category',
      categories: [
        { name: 'Farthest Flight', points: 1 },
        { name: 'Hang Time', points: 1 }
      ]
    }
  ], [
    { gameId: 'planes', categoryName: 'Farthest Flight', divisionId: 'a', timestamp: 1 },
    { gameId: 'planes', categoryName: 'Farthest Flight', divisionId: 'b', timestamp: 2 },
    { gameId: 'planes', categoryName: 'Hang Time', divisionId: 'a', timestamp: 3 }
  ]);

  assert.equal(total(rows, 'a'), 1);
  assert.equal(total(rows, 'b'), 1);
});

test('repeatable categories award points for every success', () => {
  const rows = standings([
    {
      id: 'hula',
      name: 'Hula Hoop',
      scoringType: 'multi-category',
      categories: [{ name: 'Successful Hoop', points: 1, repeatable: true }]
    }
  ], [
    { gameId: 'hula', categoryName: 'Successful Hoop', divisionId: 'a', timestamp: 1 },
    { gameId: 'hula', categoryName: 'Successful Hoop', divisionId: 'a', timestamp: 2 },
    { gameId: 'hula', categoryName: 'Successful Hoop', divisionId: 'b', timestamp: 3 }
  ]);

  assert.equal(total(rows, 'a'), 2);
  assert.equal(total(rows, 'b'), 1);
});

test('higher leaderboard awards record points and final winner bonus', () => {
  const rows = standings([
    {
      id: 'bottle',
      name: 'Bottle Flip',
      scoringType: 'leaderboard',
      higherIsBetter: true,
      pointsForRecord: 1,
      pointsForTopScore: 5
    }
  ], [
    { gameId: 'bottle', divisionId: 'a', score: 5, timestamp: 1 },
    { gameId: 'bottle', divisionId: 'b', score: 8, timestamp: 2 },
    { gameId: 'bottle', divisionId: 'c', score: 10, timestamp: 3 },
    { gameId: 'bottle', divisionId: 'a', score: 9, timestamp: 4 }
  ]);

  assert.equal(total(rows, 'a'), 1);
  assert.equal(total(rows, 'b'), 1);
  assert.equal(total(rows, 'c'), 6);
});

test('lower leaderboard treats the smallest score as the record and winner', () => {
  const rows = standings([
    {
      id: 'target',
      name: 'Closest Target',
      scoringType: 'leaderboard',
      higherIsBetter: false,
      pointsForRecord: 1,
      pointsForTopScore: 5
    }
  ], [
    { gameId: 'target', divisionId: 'a', score: 10, timestamp: 1 },
    { gameId: 'target', divisionId: 'b', score: 7, timestamp: 2 },
    { gameId: 'target', divisionId: 'c', score: 8, timestamp: 3 },
    { gameId: 'target', divisionId: 'a', score: 5, timestamp: 4 }
  ]);

  assert.equal(total(rows, 'a'), 7);
  assert.equal(total(rows, 'b'), 1);
  assert.equal(total(rows, 'c'), 0);
});

test('unknown divisions do not create standings rows', () => {
  const rows = standings([
    { id: 'cornhole', name: 'Cornhole', scoringType: 'repeatable', pointsPerWin: 1 }
  ], [
    { gameId: 'cornhole', divisionId: 'missing', timestamp: 1 }
  ]);

  assert.deepEqual(rows.map((row) => row.total), [0, 0, 0]);
});

test('standings sort by total, then division name', () => {
  const rows = standings([
    { id: 'cornhole', name: 'Cornhole', scoringType: 'repeatable', pointsPerWin: 1 }
  ], [
    { gameId: 'cornhole', divisionId: 'b', timestamp: 1 },
    { gameId: 'cornhole', divisionId: 'a', timestamp: 2 }
  ]);

  assert.deepEqual(rows.map((row) => row.division.name), ['ESDD', 'TISD', 'TBMD']);
});
