(function(root, factory){
  if(typeof module === 'object' && module.exports){
    module.exports = factory();
  } else {
    root.PicnicScoring = factory();
  }
}(typeof self !== 'undefined' ? self : this, function(){
  function sortLeaderboardEntries(entries, higherIsBetter){
    return entries.slice().sort(function(a,b){
      if(a.score !== b.score) return higherIsBetter ? b.score - a.score : a.score - b.score;
      return a.timestamp - b.timestamp;
    });
  }

  function computeStandings(data){
    var rows = data.divisions.map(function(d){ return { division:d, total:0, breakdown:{} }; });
    var byId = {};
    rows.forEach(function(r){ byId[r.division.id] = r; });

    function addPoints(divisionId, game, points){
      var row = byId[divisionId];
      if(!row) return;
      row.total += points;
      if(!row.breakdown[game.id]) row.breakdown[game.id] = { gameName: game.name, points: 0 };
      row.breakdown[game.id].points += points;
    }

    data.games.forEach(function(game){
      var entries = data.log.filter(function(e){ return e.gameId === game.id; });
      if(game.scoringType === 'single'){
        var entry = entries[entries.length - 1];
        if(entry) addPoints(entry.divisionId, game, Number(game.pointsForWin) || 0);
      } else if(game.scoringType === 'repeatable'){
        var counts = {};
        entries.forEach(function(e){ counts[e.divisionId] = (counts[e.divisionId] || 0) + 1; });
        Object.keys(counts).forEach(function(divId){
          addPoints(divId, game, counts[divId] * (Number(game.pointsPerWin) || 0));
        });
      } else if(game.scoringType === 'multi-category'){
        (game.categories || []).forEach(function(cat){
          var catEntries = entries.filter(function(e){ return e.categoryName === cat.name; });
          if(cat.repeatable){
            var counts = {};
            catEntries.forEach(function(e){ counts[e.divisionId] = (counts[e.divisionId] || 0) + 1; });
            Object.keys(counts).forEach(function(divId){ addPoints(divId, game, counts[divId] * (Number(cat.points) || 0)); });
          } else {
            var catEntry = catEntries[catEntries.length - 1];
            if(catEntry) addPoints(catEntry.divisionId, game, Number(cat.points) || 0);
          }
        });
      } else if(game.scoringType === 'leaderboard'){
        if(entries.length){
          var sorted = sortLeaderboardEntries(entries, game.higherIsBetter);
          var recordHolder = null;
          entries.slice().sort(function(a,b){ return a.timestamp - b.timestamp; }).forEach(function(entry){
            if(recordHolder === null || (game.higherIsBetter ? entry.score > recordHolder : entry.score < recordHolder)){
              addPoints(entry.divisionId, game, Number(game.pointsForRecord) || 0);
              recordHolder = entry.score;
            }
          });
          addPoints(sorted[0].divisionId, game, Number(game.pointsForTopScore) || 0);
        }
      }
    });

    rows.sort(function(a,b){
      return b.total - a.total || a.division.name.localeCompare(b.division.name);
    });
    return rows;
  }

  return { computeStandings: computeStandings };
}));
