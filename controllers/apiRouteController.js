var request = null;
var _ = require('underscore'),
  cheerio = require('cheerio'),
  async = require('async'),
  colors = require('colors'),
  moment = require('moment-timezone'),
  url = require('url'),
  fs = require('fs');

var apiRouteController = function(){};

var leagueId, seasonId, weekId, logicalSeasonId;

var isSeasonConcluded = false;

apiRouteController.Members = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  request = require('request');
  request = request.defaults({jar:true}); //Create a new cookie jar for maintaining auth

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeMembers: scrapeMembers
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve league members.' });
      }
      return res.status(200).json(results.scrapeMembers);
    }
  );

  return;
};

apiRouteController.Info = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  request = require('request');
  request = request.defaults({jar:true}); //Create a new cookie jar for maintaining auth

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeLeagueInfo: scrapeLeagueInfo
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve league info.' });
      }
      return res.status(200).json(results.scrapeLeagueInfo);
    }
  );

  return;
};

apiRouteController.TransactionCounts = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  request = require('request');
  request = request.defaults({jar:true}); //Create a new cookie jar for maintaining auth

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeTransactionCounter: scrapeTransactionCounter
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve transaction counts.' });
      }
      return res.status(200).json(results.scrapeTransactionCounter);
    }
  );
};

apiRouteController.FinalStandings = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  request = require('request');
  request = request.defaults({jar:true}); //Create a new cookie jar for maintaining auth

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeFinalStandings: scrapeFinalStandings
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve final standings.' });
      }
      return res.status(200).json(results.scrapeFinalStandings);
    }
  );
};

apiRouteController.Settings = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  request = require('request');
  request = request.defaults({jar:true}); //Create a new cookie jar for maintaining auth

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeLeagueSettings: scrapeLeagueSettings
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve league settings.' });
      }
      return res.status(200).json(results.scrapeLeagueSettings);
    }
  );
};

apiRouteController.WeekScores = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;
  weekId = req.params.weekId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);
  weekId = parseInt(weekId, 0);

  if(leagueId <= 0 || seasonId <= 0 || weekId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId, seasonId, and weekId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  request = require('request');
  request = request.defaults({jar:true}); //Create a new cookie jar for maintaining auth

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeWeekScores: scrapeWeekScores
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve the given weeks scores.' });
      }
      return res.status(200).json(results.scrapeWeekScores);
    }
  );
};

apiRouteController.TeamSchedule = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;
  teamId = req.params.teamId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);
  teamId = parseInt(teamId, 0);

  if(leagueId <= 0 || seasonId <= 0 || teamId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId, seasonId, and teamId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  request = require('request');
  request = request.defaults({jar:true}); //Create a new cookie jar for maintaining auth

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeTeamSchedule: scrapeTeamSchedule
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve the given weeks scores.' });
      }
      return res.status(200).json(results.scrapeTeamSchedule);
    }
  );
};

var authenticateEspnCredentials = function(callback){
  // language=en&affiliateName=espn&appRedirect=http%3A%2F%2Fespn.go.com%2F&parentLocation=http%3A%2F%2Fespn.go.com%2F&registrationFormId=espn
  var authOptions = {
    username: options.access.username,
    password: options.access.password,
    language:'en',
    affiliateName:'espn',
    appRedirect:'http://espn.go.com',
    parentLocation:'http://espn.go.com',
    registrationFormId:'espn'
  };
  var reqOptions = {
    url:'https://r.espn.go.com/members/util/loginUser',
    form: authOptions
  };
  console.log('Attempting to authenticate ESPN credentials...'.grey);
  request.post(reqOptions, function(err, result, body){
    var loginResult = JSON.parse(body);
    if(err){
      console.log('Failed to authenticate.'.red);
      callback(err, null);
      return;
    }
    else if(loginResult.login === 'false'){
      console.log('Failed authentication with given credentials.'.red);
      console.log(body.red);
      callback(body, null);
      return;
    }
    console.log('Passed authentication.'.green);
    callback(null, body);
    return;
  });
};

var scrapeMembers = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/leaguesetup/ownerinfo?leagueId=' + leagueId + '&seasonId=' + seasonId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league and season.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var leagueName = $('.nav-main-breadcrumbs a').eq(2).text();

    var seasons = [];
    var currentSeasonId = null;

    var seasonOpts = $('#seasonHistoryMenu option');
    if(seasonOpts.length <= 0){
      console.log('Failed to retrieve seasons information.'.red);
      callback(1, null);
      return;
    }

    _(seasonOpts).each(function(html){
      var year = $(html).val();
      if(parseInt(year)){
        year = parseInt(year);
        seasons.push(year);
        if($(html).attr('selected')){
          currentSeasonId = year;
        }
      }
    });

    seasons = _(seasons).sort();

    var teamRows = $('.ownerRow[id*="-0"]');
    if(teamRows.length <= 0){
      console.log('Failed to retrieve team information.'.red);
      callback(1, null);
      return;
    }

    var teams = [];
    _(teamRows).each(function(html){
      var teamId = _.str.trim($(html).find('td').eq(0).text());
      var teamNameAbbr = _.str.trim($(html).find('td').eq(1).text());
      var teamName = _.str.trim($(html).find('td.teamName a').text()).replace('  ',' ');
      var ownerName = _.str.titleize(_.str.trim($(html).find('td').eq(4).find('a').text()));
      var firstName = ownerName.split(' ')[0];
      var lastName = ownerName.split(' ')[1];
      var ownerDivision = _.str.trim($(html).find('td').eq(3).text());
      teams.push({
        id: parseInt(teamId,0),
        division: ownerDivision,
        team: {
          name: teamName,
          abbr: teamNameAbbr
        },
        owner: {
          firstName: firstName,
          lastName: lastName
        }
      });
    });

    teams = _(teams).sortBy('id');
    var data = {
      timestamp: moment().utc().format(),
      season: {
        id: currentSeasonId,
        isComplete: isSeasonConcluded
      },
      members: teams
    };

    callback(null, data);
    return;
  });
};

var scrapeLeagueInfo = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/leaguesetup/ownerinfo?leagueId=' + leagueId + '&seasonId=' + seasonId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league and season.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var leagueName = $('.nav-main-breadcrumbs a').eq(2).text();

    var seasons = [];
    var currentSeasonId = null;

    var seasonOpts = $('#seasonHistoryMenu option');
    if(seasonOpts.length <= 0){
      console.log('Failed to retrieve seasons information.'.red);
      callback(1, null);
      return;
    }

    _(seasonOpts).each(function(html){
      var year = $(html).val();
      if(parseInt(year)){
        year = parseInt(year);
        seasons.push(year);
        if($(html).attr('selected')){
          currentSeasonId = year;
        }
      }
    });

    seasons = _(seasons).sort();
    var data = {
      timestamp: moment().utc().format(),
      season: {
        id: currentSeasonId,
        isComplete: isSeasonConcluded
      },
      league: {
        id: leagueId,
        name: leagueName,
        seasons: seasons
      }
    };

    callback(null, data);
    return;
  });
};

var scrapeTransactionCounter = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/tools/transactioncounter?leagueId=' + leagueId + '&seasonId=' + seasonId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league and season.'.red);
      callback(err, null);
      return;
    }

    var html = body.split("</td></td>").join("</td>");

    $ = cheerio.load(html);


    if(body.indexOf('TRANSACTION COUNTER') <= 0){
      console.log('Failed to retrieve transaction counts. Could not find TRANSACTION COUNTER.'.red);
      callback(1, null);
      return;
    }

    var rows = $('tr[valign=middle]');

    if(rows.length <= 0){
      console.log('Failed to retrieve transaction counts. Could not find transactional rows.'.red);
      callback(1, null);
      return;
    }

    var currentSeasonId = null;

    var seasonOpts = $('#seasonHistoryMenu option');
    if(seasonOpts.length <= 0){
      console.log('Failed to retrieve transaction counts.'.red);
      callback(1, null);
      return;
    }

    _(seasonOpts).each(function(html){
      var year = $(html).val();
      if(parseInt(year)){
        year = parseInt(year);
        if($(html).attr('selected')){
          currentSeasonId = year;
        }
      }
    });

    var trxTypes = getTrxTypes($);
    var trxTypeKeys = [
      'LeagueEntryFee',
      'CostPerLoss',
      'CostPerTrade',
      'CostPerAquisition',
      'CostPerDrop',
      'CostToMovePlayerToActive',
      'CostToMovePlayerToIr',
      'MiscLeagueFee'
    ];

    var teams = [];
    _(rows).each(function(row){
      var link = $(row).find('td').eq(0).find('a');
      var title = $(link).attr('title');
      var parts = title.split('(');
      var teamName = $(link).text().replace('  ', ' ');
      var ownerName = _.str.titleize(parts[parts.length - 1].split(')')[0]);
      var ownerFirstName = ownerName.split(' ')[0];
      var ownerLastName = ownerName.split(' ')[1];
      var teamId = getTeamIdFromUrl($(link).attr('href'));

      var transactions = [];
      for(var i = 1; i <= 8; i++){
        var td = $(row).find('td').eq(i);
        var feeBreakdown = _.extend(getFeeBreakDownFromStr($(td).text()), { key: trxTypeKeys[i-1] });
        transactions.push(feeBreakdown);
      }

      var feeTotalTd = $(row).find('td').eq(9);
      var paidTd = $(row).find('td').eq(10);

      var feeTotal = parseFloat($(feeTotalTd).text().split('$')[1], 2);
      var paid = parseFloat($(paidTd).text().split('$')[1], 2);

      teams.push({
        id: teamId,
        team: {
          name: teamName
        },
        owner: {
          firstName: ownerFirstName,
          lastName: ownerLastName
        },
        feeTotal: feeTotal,
        paidAmount: paid,
        transactions: transactions
      });
    });

    teams = _(teams).sortBy('id');

    var data = {
      timestamp: moment().utc().format(),
      season: {
        id: currentSeasonId,
        isComplete: isSeasonConcluded
      },
      transactionTypes: trxTypes,
      teams: teams
    };

    callback(null, data);
    return;
  });
};

var scrapeFinalStandings = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/tools/finalstandings?leagueId=' + leagueId + '&seasonId=' + seasonId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league and season.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var seasonOpts = $('#seasonHistoryMenu option');
    if(seasonOpts.length <= 0){
      console.log('Failed to retrieve final standings. Season is not complete or valid.'.red);
      callback(1, null);
      return;
    }

    _(seasonOpts).each(function(html){
      var year = $(html).val();
      if(parseInt(year, 0)){
        year = parseInt(year);
        if($(html).attr('selected')){
          currentSeasonId = year;
        }
      }
    });

    var table = $('#finalRankingsTable');
    if(!table){
      console.log('Failed to retrieve final standings. Season is not complete or valid.'.red);
      callback(1, null);
      return;
    }

    var rows = $('tr.sortableRow');
    if(rows.length <= 0){
      console.log('Failed to retrieve final standings. Could not find data columns.'.red);
      callback(1, null);
      return;
    }

    var standings = [];

    _(rows).each(function(row){
      var place = parseInt($(row).find('td').eq(0).text(),0);
      var teamLink = $(row).find('td').eq(1).find('a');
      var teamName = $(teamLink).text().replace('  ', ' ');
      var teamId = getTeamIdFromUrl($(teamLink).attr('href'));
      var ownerLink = $(row).find('td').eq(2).find('a');
      var ownerName = _.str.titleize($(ownerLink).text());
      var firstName = ownerName.split(' ')[0];
      var lastName = ownerName.split(' ')[1];
      var overallRecord = getOverallRecord($(row).find('td').eq(4).text());
      var pointsFor = parseFloat($(row).find('td').eq(5).text(),2);
      var pointsAgainst = parseFloat($(row).find('td').eq(6).text(),2);
      var pointsForAvg = parseFloat($(row).find('td').eq(7).text(),2);
      var pointsAgainstAvg = parseFloat($(row).find('td').eq(8).text(),2);
      standings.push({
        id: teamId,
        place: place,
        team: {
          name: teamName
        },
        owner: {
          firstName: firstName,
          lastName: lastName
        },
        overallRecord: overallRecord,
        points: {
          totals: {
            for: pointsFor,
            against: pointsAgainst,
          },
          averages: {
            for: pointsForAvg,
            against: pointsAgainstAvg
          }
        }
      });
    });

    var data = {
      timestamp: moment().utc().format(),
      season: {
        id: currentSeasonId,
        isComplete: isSeasonConcluded
      },
      standings: standings
    };

    callback(null, data);
    return;
  });
};

var scrapeLeagueSettings = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/leaguesetup/settings?leagueId=' + leagueId + '&seasonId=' + seasonId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league and season.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var basicTable = $('#basicSettingsTable');
    if(!basicTable){
      console.log('Failed to retrieve league settings. Could not find basic settings.'.red);
      callback(1, null);
      return;
    }

    var rows = $(basicTable).find('tr');
    rows = _(rows).rest(1);

    if(rows.length <= 0){
      console.log('Failed to retrieve league settings. Could not find basic settings.'.red);
      callback(1, null);
      return;
    }

    var basicSettings = [];
    _(rows).each(function(row){
      var label = $(row).find('td').eq(0).find('label');
      var text = $(label).text();
      var key = _.str.classify(text);
      var value = $(row).find('td').eq(1).text();
      basicSettings.push({
        key: key,
        name: text,
        value: isNaN(value) ? value : parseInt(value,0)
      });
    });

    var rosterSettings = [];
    var rosterDiv = $('div[name="roster"]').eq(0);
    var outerRosterTable = $(rosterDiv).find('table.leagueSettingsTable').eq(0)
    var dataSummary = $(outerRosterTable).find('td.dataSummary');
    var ps = $(dataSummary).find('p');

    _(ps).each(function(p){
      var parts = $(p).text().split(': ');
      var text = parts[0];
      var key = _.str.classify(text);
      var value = null;
      var irMax = 0;
      if(parts[1].indexOf('IR)') > -1){
        var sparts = parts[1].split(' (');
        value = parseInt(sparts[0],0) || 0;
        irMax = parseInt(sparts[1].split(' '),0) || 0;
      }
      else{
        value = parseInt(parts[1],0) || 0;
      }

      rosterSettings.push({
        key: key,
        name: text,
        value: value
      });

      if(irMax > 0){
        rosterSettings.push({
          key: 'MaxPlayersOnIr',
          name: 'Max Players On IR',
          value: irMax
        });
      }
    });

    var rosterTable = $(outerRosterTable).find('table.leagueSettingsTable').eq(0);
    rows = $(rosterTable).find('tr');
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var parts = $(row).find('td').eq(0).text().split(' (');
      var positionName = parts[0];
      var positionAbbr = parts[1].split(')')[0];
      var startMax = parseInt($(row).find('td').eq('1').text(),0) || 99;
      var rosterMax = parseInt($(row).find('td').eq('2').text(),0) || 99;

      rosterSettings.push({
        key: positionAbbr,
        name: positionName,
        maximumStarters: startMax,
        maximumOnRoster: rosterMax
      })
    });

    var scoringSettings = [];
    var scoringTable = $('div[name="scoring"]').find('table.leagueSettingsTable').eq(0);
    rows = $(scoringTable).children('tr');
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var categoryText = $(row).find('td').eq(0).text();
      var categoryKey = _.str.classify(categoryText);
      var statRows = $(row).find('td').eq(1).find('table').eq(0).find('tr');
      var categoryStats = [];
      _(statRows).each(function(srow){
        var parts = $(srow).find('td').eq(0).text().split(' (');
        var statName = parts[0];
        var statKey = _.str.classify(statName);
        var statAbbrev = parts[1].split(')')[0];
        var statPoints = parseFloat($(srow).find('td').eq(1).text(),2) || 0;

        categoryStats.push({
          key: statKey,
          abbr: statAbbrev,
          name: statName,
          points: statPoints
        });

        var isTwoColumn = $(srow).find('td').length === 5;

        if(isTwoColumn){
          parts = $(srow).find('td').eq(3).text().split(' (');
          statName = parts[0];
          statKey = _.str.classify(statName);
          statAbbrev = parts[1].split(')')[0];
          statPoints = parseFloat($(srow).find('td').eq(4).text(),2) || 0;

          categoryStats.push({
            key: statKey,
            abbr: statAbbrev,
            name: statName,
            points: statPoints
          });
        }
      });

      scoringSettings.push({
        key: categoryKey,
        name: categoryText,
        stats: categoryStats
      });
    });

    var playerRuleSettings = [];
    var playerRulesTable = $('div[name="rules"]').find('table.leagueSettingsTable').eq(0);
    rows = $(playerRulesTable).find('tr');
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var label = $(row).find('td').eq(0).find('label');
      var text = $(label).text();
      var key = _.str.classify(text);
      var value = $(row).find('td').eq(1).text();
      playerRuleSettings.push({
        key: key,
        name: text,
        value: isNaN(value) ? value : parseInt(value,0)
      });
    });

    var acqAndWaiverSettings = [];
    var acqAndWaiverTable = $('div[name="rules"]').find('table.leagueSettingsTable').eq(1);
    rows = $(acqAndWaiverTable).find('tr');
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var label = $(row).find('td').eq(0).find('label');
      var text = $(label).text();
      var key = _.str.classify(text);
      var value = $(row).find('td').eq(1).text();
      acqAndWaiverSettings.push({
        key: key,
        name: text,
        value: isNaN(value) ? value : parseInt(value,0)
      });
    });

    var tradeSettings = [];
    var tradeTable = $('div[name="rules"]').find('table.leagueSettingsTable').eq(2);
    rows = $(tradeTable).find('tr');
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var label = $(row).find('td').eq(0).find('label');
      var text = $(label).text();
      var key = _.str.classify(text);
      var value = $(row).find('td').eq(1).text();
      tradeSettings.push({
        key: key,
        name: text,
        value: isNaN(value) ? value : parseInt(value,0)
      });
    });

    var keeperSettings = [];
    var keeperTable = $('div[name="rules"]').find('table.leagueSettingsTable').eq(3);
    rows = $(keeperTable).find('tr');
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var label = $(row).find('td').eq(0).find('label');
      var text = $(label).text();
      var key = _.str.classify(text);
      var value = $(row).find('td').eq(1).text();
      keeperSettings.push({
        key: key,
        name: text,
        value: isNaN(value) ? value : parseInt(value,0)
      });
    });

    var regularSeasonSettings = [];
    var regularSeasonTable = $('div[name="schedule"]').find('table.leagueSettingsTable').eq(0);
    rows = $(regularSeasonTable).find('tr');
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var label = $(row).find('td').eq(0).find('label');
      var text = $(label).text();
      var key = _.str.classify(text);
      var value = $(row).find('td').eq(1).text();
      regularSeasonSettings.push({
        key: key,
        name: text,
        value: isNaN(value) ? value : parseInt(value,0)
      });
    });

    var playoffSettings = [];
    var playoffTable = $('div[name="schedule"]').children('.playoffSettings').children('table.leagueSettingsTable').eq(0);
    rows = $(playoffTable).find('tr');
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var label = $(row).find('td').eq(0).find('label');
      var text = $(label).text();
      var key = _.str.classify(text);
      var value = $(row).find('td').eq(1).text();
      playoffSettings.push({
        key: key,
        name: text,
        value: isNaN(value) ? value : parseInt(value,0)
      });
    });

    var draftSettings = [];
    var draftTable = $('div[name="draft"]').find('table#draftSettingsTable').eq(0);
    rows = $(draftTable).find('tr').filter(function(i, el){
      return !!!$(this).attr('style');
    });
    rows = _(rows).rest(1);

    _(rows).each(function(row){
      var label = $(row).find('td').eq(0).find('label');
      var text = $(label).text();
      var key = _.str.classify(text);
      var value = $(row).find('td').eq(1).text();
      draftSettings.push({
        key: key,
        name: text,
        value: isNaN(value) ? value : parseInt(value,0)
      });
    });

    var data = {
      timestamp: moment().utc().format(),
      season: {
        id: seasonId,
        isComplete: isSeasonConcluded
      },
      settings: {
        basic: basicSettings,
        roster: rosterSettings,
        scoring: scoringSettings,
        playerRules: playerRuleSettings,
        waiver: acqAndWaiverSettings,
        trade: tradeSettings,
        keeper: keeperSettings,
        regularSeason: regularSeasonSettings,
        playoffs: playoffSettings,
        draft: draftSettings
      }
    };

    callback(null, data);
    return;
  });
};

var scrapeWeekScores = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/scoreboard?leagueId=' + leagueId + '&seasonId=' + seasonId + '&scoringPeriodId=' + weekId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league and season.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var htmlMatchups = $('#scoreboardMatchups').find('.matchup');
    if(!htmlMatchups || htmlMatchups.length === 0){
      console.log('Failed to retrieve week\'s scores. League/season/week combination may not be complete or valid.'.red);
      callback(1, null);
      return;
    }

    var timestamp = moment().utc().format();
    var scores = [];
    var winnersAreSet = $(htmlMatchups).find('.winning').length > 0;
    _(htmlMatchups).each(function(matchup, index){
      var rows = $(matchup).find('tr');
      if(rows.length <= 0){
        console.log('Failed to retrieve week\'s scores. Could not find matchup rows.'.red);
        callback(1, null);
        return;
      }

      var lastRecordedScore = 0;
      var isWinnerDecided = $(matchup).find('.winning').length > 0;
      _(rows).each(function(row,rindex){
        if(rindex != 2) {
          var teamLink = $(row).find('.team .name a');
          var teamId = getTeamIdFromUrl($(teamLink).attr('href'));
          var teamName = $(teamLink).attr('title').split(' (')[0].replace('  ', ' ');
          var teamAbbr = _.str.trim($(row).find('.team .name .abbrev').text(), ['(', ')', ' ']);
          var ownerName = _.str.titleize($(row).find('.team .owners a').eq(0).text());
          var score = parseFloat($(row).find('.score').text(),2);
          var outcome = 'undetermined';
          var isWinner = $(row).find('.score').hasClass('winning');

          if(isWinnerDecided && !isWinner){
            outcome = 'loss';
          }
          else if (isWinnerDecided && isWinner) {
            outcome = 'win';
          }
          else if (winnersAreSet){
            outcome = 'tie';
          }

          scores.push({
            matchup: {
              id: index
            },
            score: score,
            isHomeTeam: rindex === 1,
            isWinner: isWinner,
            outcome: outcome,
            team: {
              id: teamId,
              name: teamName,
              abbrev: teamAbbr
            },
            owner: {
              firstName: ownerName.split(' ')[0],
              lastName: ownerName.split(' ')[1]
            }
          });
        }
      });
    });

    var data = {
      timestamp: timestamp,
      season: {
        id: seasonId,
        isComplete: isSeasonConcluded
      },
      scores: scores
    };

    callback(null, data);
    return;
  });
};

var scrapeTeamSchedule = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/schedule?leagueId=' + leagueId + '&seasonId=' + seasonId + '&teamId=' + teamId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league, season, and team.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var rows = _($('tr.tableSubHead').eq(0).siblings()).rest(1);
    if(!rows || rows.length === 0){
      console.log('Failed to retrieve team\'s schedule. League/season/team combination may not be valid.'.red);
      callback(1, null);
      return;
    }

    var timestamp = moment().utc().format();
    var outcomes = [];

    _(rows).each(function(row, index){
      var record = {wins:null,losses:null,ties:null}; //Calculate it later if season is not concluded
      if(isSeasonConcluded){
        record = getOverallRecord($(row).find('td').eq(1).text());
      }
      var result = getGameResults(_.str.trim($(row).find('td').eq(isSeasonConcluded ? 2 : 1).text()));
      var isHomeGame = _.str.trim($(row).find('td').eq(isSeasonConcluded ? 3 : 2).text()).toLowerCase() === '';

      outcomes.push({
        isHomeGame: isHomeGame,
        recordSnapshot: record,
        result: result
      });
    });

    var data = {
      timestamp: timestamp,
      season: {
        id: seasonId,
        isComplete: isSeasonConcluded
      },
      outcomes: outcomes
    };

    callback(null, data);
    return;
  });
};

function getTeamIdFromUrl(urlStr){
  if(!urlStr) return -1;
  if(!_.str.startsWith(urlStr, 'http')){
    urlStr = 'http://www.google.com' + urlStr;
  }

  var uri = url.parse(urlStr, true);

  return parseInt(uri.query.teamId);
}

function getFeeBreakDownFromStr(str){
  var parts = str.split(' ');
  var total = parseFloat(_.str.trim(parts[0], '$'),2);
  var qty = parseInt(_.str.trim(parts[1], ['(',')',' ']),0);

  return {
    total: total,
    quantity: qty
  };
}

function getTrxTypes($){
  var table = $('.tableBody')[1];
  var rows = _($(table).find('tr')).rest(2);
  var trxTypes = [];
  _(rows).each(function(row){
    var trxName = $(row).find('td').eq(0).text();
    var trxKey = _.str.classify(trxName);
    var trxCost = parseFloat($(row).find('td').eq(1).text().split('$')[1], 2);
    trxTypes.push({
      name: trxName,
      key: trxKey,
      cost: trxCost
    });
  });

  return trxTypes;
}

function getOverallRecord(str){
  var parts = str.split('-');
  var wins = parseInt(parts[0],0);
  var losses = parseInt(parts[1],0);
  var ties = parseInt(parts[2],0) || 0;
  return {
    wins: wins,
    losses: losses,
    ties: ties
  };
}

function getGameResults(str){
  var parts = str.split(' ');

  if(parts.length < 2){
    return {
      isWinner: false,
      outcome: 'undertermined',
      scores: {
        team: null,
        opponent: null
      }
    };
  }

  var sparts = parts[1].split('-');
  var score1 = parseFloat(sparts[0],2) || 0;
  var score2 = parseFloat(sparts[1],2) || 0;
  var outcome = parts[0].toLowerCase() === 'w' ? 'win' : (parts[0].toLowerCase() === 'l' ? 'loss' : 'tie');
  var max = [score1,score2].sort()[1];
  var min = [score1,score2].sort()[0];

  return {
    isWinner: outcome === 'win',
    outcome: outcome,
    scores: {
      team: outcome === 'win' ? max : min,
      opponent: outcome === 'win' ? min : max
    }
  };
}

module.exports = apiRouteController;