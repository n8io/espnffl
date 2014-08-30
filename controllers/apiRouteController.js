var request = require('request').defaults({jar:true}); //Create a new cookie jar for maintaining auth
var _ = require('underscore'),
  cheerio = require('cheerio'),
  async = require('async'),
  colors = require('colors'),
  moment = require('moment-timezone'),
  url = require('url'),
  fs = require('fs');

var lastAuthDate = moment().add('week', -1); //Default to past
var maxValidYear = (new Date()).getFullYear();

var apiRouteController = function(){};

var leagueId, seasonId, weekId, teamId, logicalSeasonId;

var isSeasonConcluded = false;

apiRouteController.Members = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

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
      return sendBackValidResponse(res, results.scrapeMembers);
    }
  );

  return;
};

apiRouteController.Info = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  var tempSeasonId = seasonId == -1 ? 9999 : seasonId;

  if(leagueId <= 0 || (leagueId > 0 && tempSeasonId <= 0)){
    return res.status(400).json({ 'message' : 'A valid leagueId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > tempSeasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

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
      return sendBackValidResponse(res, results.scrapeLeagueInfo);
    }
  );

  return;
};

apiRouteController.TransactionCounts = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

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
      return sendBackValidResponse(res, results.scrapeTransactionCounter);
    }
  );
};

apiRouteController.FinalStandings = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

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
      return sendBackValidResponse(res, results.scrapeFinalStandings);
    }
  );
};

apiRouteController.Settings = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

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
      return sendBackValidResponse(res, results.scrapeLeagueSettings);
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

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear || weekId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId, seasonId, and weekId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

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
      return sendBackValidResponse(res, results.scrapeWeekScores);
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

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear || teamId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId, seasonId, and teamId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

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
      return sendBackValidResponse(res, results.scrapeTeamSchedule);
    }
  );
};

apiRouteController.TeamRoster = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;
  teamId = req.params.teamId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);
  teamId = parseInt(teamId, 0);

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear || teamId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId, seasonId, and teamId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeTeamRoster: scrapeTeamRoster
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve the given weeks scores.' });
      }
      return sendBackValidResponse(res, results.scrapeTeamRoster);
    }
  );
};

apiRouteController.DraftRecap = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear){
    return res.status(400).json({ 'message' : 'A valid leagueId and seasonId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeDraftRecap: scrapeDraftRecap
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve the given weeks scores.' });
      }
      return sendBackValidResponse(res, results.scrapeDraftRecap);
    }
  );
};

apiRouteController.Matchup = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;
  weekId = req.params.weekId || -1;
  teamId = req.params.teamId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);
  weekId = parseInt(weekId, 0);
  teamId = parseInt(teamId, 0);

  if(leagueId <= 0 || seasonId <= 0 || seasonId > maxValidYear || weekId <= 0 || teamId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId/seasonId/weekId/teamId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeMatchup: scrapeMatchup
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve the given matchup.' });
      }
      return sendBackValidResponse(res, results.scrapeMatchup);
    }
  );
};

apiRouteController.Trophies = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;
  weekId = req.params.weekId || -1;
  teamId = req.params.teamId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);
  weekId = parseInt(weekId, 0);
  teamId = parseInt(teamId, 0);

  if(leagueId <= 0 ){
    return res.status(400).json({ 'message' : 'A valid leagueId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeTrophies: scrapeTrophies
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve the trophies for give leagueId.' });
      }
      return sendBackValidResponse(res, results.scrapeTrophies);
    }
  );
};

apiRouteController.TrophyHistory = function (req, res) {
  leagueId = req.params.leagueId || -1;
  seasonId = req.params.seasonId || -1;
  weekId = req.params.weekId || -1;
  teamId = req.params.teamId || -1;
  trophyId = req.params.trophyId || -1;

  leagueId = parseInt(leagueId, 0);
  seasonId = parseInt(seasonId, 0);
  weekId = parseInt(weekId, 0);
  teamId = parseInt(teamId, 0);
  trophyId = parseInt(trophyId, 0);

  if(leagueId <= 0 || trophyId <= 0){
    return res.status(400).json({ 'message' : 'A valid leagueId/trophyId must be provided.' });
  }

  logicalSeasonId = moment().get('month') < 8 ? moment().get('year') - 1 : moment().get('year');
  isSeasonConcluded = logicalSeasonId > seasonId || (seasonId + 1 === moment().get('year') && moment().get('month') > 1);

  async.series(
    {
      espnAuth: authenticateEspnCredentials,
      scrapeTrophyHistory: scrapeTrophyHistory
    },
    // On Complete
    function(err, results){
      if(err){
        return res.status(500).json({ 'message' : 'Failed to retrieve the trophies for give leagueId.' });
      }
      return sendBackValidResponse(res, results.scrapeTrophyHistory);
    }
  );
};

var authenticateEspnCredentials = function(callback){
  var staleAuthTimeInMs = 1 * 60 * 60 * 1000;
  if(moment().diff(lastAuthDate) <= staleAuthTimeInMs){
    return callback(null, {login:true});
  }

  console.log('Authentication expired. Need to re-authenticate.'.yellow);

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
    lastAuthDate = moment();
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
      var link = $(html).find('td').eq(2).find('a').attr('href');
      var teamId = _.str.trim(link.split('&')[1].split('=')[1]);
      var teamNameAbbr = _.str.trim($(html).find('td').eq(1).text());
      var teamName = _.str.trim($(html).find('td.teamName a').text()).replace('  ',' ');
      var ownerName = _.str.titleize(_.str.trim($(html).find('td').eq(4).find('a').text()));
      var firstName = ownerName.split(' ')[0];
      var lastName = ownerName.split(' ')[1];
      var ownerDivision = _.str.trim($(html).find('td').eq(3).text());
      var espnUserId = _.str.trim($(html).find('td').eq(4).find('a').attr('href').toLowerCase().split('userid=')[1].split('&seasonid')[0]);

      teams.push({
        espnUserId: parseInt(espnUserId, 0),
        division: ownerDivision,
        team: {
          id: parseInt(teamId,0),
          name: teamName,
          abbr: teamNameAbbr
        },
        owner: {
          firstName: _.str.capitalize(firstName),
          lastName: _.str.capitalize(lastName)
        }
      });
    });

    teams = _(teams).sortBy('id');
    var data = {
      timestamp: moment().utc().format(),
      league: {
        id: leagueId
      },
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
    url: 'http://games.espn.go.com/ffl/leaguesetup/ownerinfo?leagueId=' + leagueId + (seasonId > 0 ? '&seasonId=' + seasonId : '')
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
      league: {
        id: leagueId,
        name: leagueName,
        seasons: seasons
      },
      season: {
        id: (seasonId == -1 ? logicalSeasonId : currentSeasonId),
        isComplete: isSeasonConcluded
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
          firstName: _.str.capitalize(ownerFirstName),
          lastName: _.str.capitalize(ownerLastName)
        },
        feeTotal: feeTotal,
        paidAmount: paid,
        transactions: transactions
      });
    });

    teams = _(teams).sortBy('id');

    var data = {
      timestamp: moment().utc().format(),
      league: {
        id: leagueId
      },
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
      var teamName = _.str.trim($(teamLink).text().replace('  ', ' '));
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
          firstName: _.str.capitalize(firstName),
          lastName: _.str.capitalize(lastName)
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
      league: {
        id: leagueId
      },
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
      league: {
        id: leagueId
      },
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
              firstName: _.str.capitalize(ownerName.split(' ')[0]),
              lastName: _.str.capitalize(ownerName.split(' ')[1])
            }
          });
        }
      });
    });

    var data = {
      timestamp: timestamp,
      league: {
        id: leagueId
      },
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
      var opponentLink = $(row).find('td').eq(isSeasonConcluded ? 4 : 3).find('a');
      var ownerName = _.str.titleize(_.str.trim(($(opponentLink).attr('title')+'').split('(')[1], [')',' ']));

      var opponent = {
        id: getTeamIdFromUrl($(opponentLink).attr('href')),
        name: _.str.trim($(opponentLink).text()),
        owner: {
          firstName: _.str.capitalize(ownerName.split(' ')[0]),
          lastName: _.str.capitalize(ownerName.split(' ')[1])
        }
      };

      outcomes.push({
        week: {
          id: index+1
        },
        isHomeGame: isHomeGame,
        recordSnapshot: record,
        result: result,
        opponent: opponent
      });
    });

    if(!isSeasonConcluded){
      outcomes = calculateRunningRecord(outcomes);
    }

    var data = {
      timestamp: timestamp,
      league: {
        id: leagueId
      },
      season: {
        id: seasonId,
        isComplete: isSeasonConcluded
      },
      team: {
        id: teamId
      },
      outcomes: outcomes
    };

    callback(null, data);
    return;
  });
};

var scrapeTeamRoster = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/clubhouse?leagueId=' + leagueId + '&seasonId=' + seasonId + '&teamId=' + teamId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league, season, and team.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var benchHeaderRow = $('.playertableSectionHeaderFirst').eq(1).parent();

    if(!benchHeaderRow){
      console.log('Failed to retrieve team\'s schedule. League/season/team combination may not be valid.'.red);
      callback(1, null);
      return;
    }

    var benchRows = $(benchHeaderRow).nextAll().find('td.playertablePlayerName').parent();
    var starterRows = $(benchHeaderRow).prevAll().find('td.playertablePlayerName').parent();

    var timestamp = moment().utc().format();
    var starters = [];
    var bench = [];

    function parsePlayerInfo(row){
      var td = $(row).find('td.playertablePlayerName');
      var injuryStatus = $(td).find('span[title]');
      var playerId = $(td).attr('id').split('_')[1];
      var playerLink = $(td).find('a').first();
      var txt = _.str.trim(playerLink.text(), [' ', ',']);
      var isTeamDefense = txt.indexOf('D/ST') > -1;
      var playerName = _.str.trim(txt.replace('D/ST', '').replace('*', ''));

      var team, position, injury;
      if(injuryStatus.length){
        injury = {
          key: $(injuryStatus).text(),
          status: $(injuryStatus).attr('title')
        };
        $(injuryStatus).remove();
      }

      if(isTeamDefense){
        team = getTeamInfoFromShortName(playerName).key;
        position = 'D/ST';
      }
      else{
        $(td).find('a').remove();
        txt = _.str.trim($(td).text().replace(/\s+/g, " "), [' ', ',', '*']);
        team = _.str.trim(txt.split(' ')[0]).toUpperCase();
        position = _(txt.split(' ')).rest(1).join('');
      }

      if(team === 'WAS'){
        // Hack update because ESPN changed
        team = 'WSH';
      }

      var isMyTeam = !!$(row).find('td.playerEditSlot').length;
      var tdIndex = isMyTeam ? 4 : 3;

      var strMatchup = _.str.trim($(row).find('td').eq(tdIndex).text());
      var strMatchupTime = _.str.trim($(row).find('td').eq(tdIndex+1).text());
      var matchupGameId = _.str.trim(($(row).find('td').eq(tdIndex+1).find('a').attr('href') || '').split('gameId=')[1]);

      var player = {
        id: parseInt(playerId, 0),
        name: playerName,
        team: team,
        position: position,
        fantasyPosition: parsePlayerFantasyPosition(position, $(row).find('td.playerSlot').text()),
        fantasyPositionCategory: parsePlayerFantasyPositionCategory(position)
      };

      if(matchupGameId){
        player.matchup = {
          id: parseInt(matchupGameId, 0) || -1,
          isHome: strMatchup.indexOf('@') === -1,
          isBye: strMatchup.toUpperCase() === 'BYE',
          isStarted: strMatchupTime.indexOf('-') > -1,
          opponent: _.str.trim(strMatchup.toUpperCase(), ['@']),
          status: strMatchupTime
        };
      }

      if(injury){
        player.injury = injury;
      }

      return player;
    }

    _(starterRows).each(function(row){
      starters.push(parsePlayerInfo(row));
    });

    _(benchRows).each(function(row){
      bench.push(parsePlayerInfo(row));
    });

    var ownerName = _.str.trim($('.per-info a').first().text());
    var ownerFirst = ownerName.split(' ')[0];
    var ownerLast = ownerName.split(' ')[1];
    var teamName = _.str.trim($('.team-name').text().replace($('.team-name em').text(), ''));
    var teamAbbr = _.str.trim($('.team-name em').text(), [' ', '(', ')']);
    var teamLogo = $('.games-univ-mod1 img').attr('src');

    var data = {
      timestamp: timestamp,
      league: {
        id: leagueId
      },
      season: {
        id: seasonId,
        isComplete: isSeasonConcluded
      },
      team: {
        id: teamId,
        abbr: teamAbbr,
        name: teamName,
        logoUrl: teamLogo
      },
      owner: {
        firstName: _.str.capitalize(ownerFirst),
        lastName: _.str.capitalize(ownerLast)
      },
      roster: {
        starters: starters.reverse(),
        bench: bench
      }
    };

    callback(null, data);
    return;
  });
};

var scrapeDraftRecap = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/tools/draftrecap?leagueId=' + leagueId + '&seasonId=' + seasonId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league and season.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var rounds = $('tr.tableHead');
    if(!rounds || rounds.length === 0){
      console.log('Failed to retrieve draft recap. League/season combination may not be valid.'.red);
      callback(1, null);
      return;
    }

    var timestamp = moment().utc().format();
    var draftRounds = [];
    _(rounds).each(function(r, index){
      var draftPicks = [];
      var rows = $(r).siblings();
      _(rows).each(function(row, jndex){
        var pickNumber = parseInt(_.str.trim($(row).find('td').eq(0).text()),0);
        var playerInfo = getPlayerInfo(_.str.trim($(row).find('td').eq(1).text()));
        var playerLink = $(row).find('td').eq(1).find('a');
        var teamLink = $(row).find('td').eq(2).find('a');
        var teamId = getTeamIdFromUrl($(teamLink).attr('href'));
        var ownerName = _.str.titleize(_.str.trim($(teamLink).attr('title').split('(')[1].split(')'))).split(',').join('');

        var draftPick = {player:playerInfo};

        if(playerLink){
          draftPick.player.id = parseInt($(playerLink).attr('playerid'),0);
        }

        _.extend(draftPick, {
          pickNumber: pickNumber,
          team: {
            id: teamId,
            name: _.str.trim($(teamLink).text()).split('  ').join('')
          },
          owner: {
            firstName: _.str.capitalize(ownerName.split(' ')[0]),
            lastName: _.str.capitalize(ownerName.split(' ')[1])
          }
        });

        draftPicks.push(draftPick)
      });

      var round = {
        id: index+1,
        picks: draftPicks
      };

      draftRounds.push(round);
    });

    var data = {
      timestamp: timestamp,
      league: {
        id: leagueId
      },
      season: {
        id: seasonId,
        isComplete: isSeasonConcluded
      },
      rounds: draftRounds
    };

    callback(null, data);
    return;
  });
};

var scrapeMatchup = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/boxscorequick?leagueId=' + leagueId + '&seasonId=' + seasonId + '&scoringPeriodId=' + weekId + '&teamId=' + teamId + '&view=scoringperiod'
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league and season.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var playerTables = $('.playerTableTable');
    if(!playerTables || playerTables.length === 0){
      console.log('Failed to retrieve matchup\'s scores. League/season/week/team combination may not be complete or valid.'.red);
      callback(1, null);
      return;
    }

    var timestamp = moment().utc().format();
    var teams = [{ id: teamId, scores: { starters: 0, bench: 0 }, starters: [], bench: [] },{ id: null, scores: { starters: 0, bench: 0}, starters: [], bench: [] }];

    var teamInfo = $('#teamInfos').children('div').eq(1);
    var teamObj = $(teamInfo).children('div').children('div');
    var teamLink = $(teamObj).children('a');
    if($(teamLink).length === 0){
      var html = $(teamObj).html();
      html = _.str.strRight(html, 'LOGO.flashVars = "');
      html = _.str.strLeft(html, '"');
      var url = decodeURIComponent('/' + html);
      var id = parseInt(getTeamIdFromUrl(url),0);
      if(id !== teamId && id > 0){
        teams[1].id = id;
      }
    }
    else{
      var id = parseInt(getTeamIdFromUrl($(teamLink).attr('href')),0);
      if(id !== teamId && id > 0){
        teams[1].id = id;
      }
    }

    var isBenchAvailable = $(playerTables).length == 4;
    _(playerTables).each(function(table, index){
      var rows = $(table).find('tr');
      if(rows.length <= 0){
        console.log('Failed to retrieve player\'s scores. Could not find player rows.'.red);
        callback(1, null);
        return;
      }

      rows = _(rows).rest(isBenchAvailable && index % 2 == 1 ? 2 : 3);;
      rows = _(rows).map(function(r){
        if(isBenchAvailable){
          $(r).find('td').eq(0).remove();
        }
        return r;
      });

      var teamIndex = (isBenchAvailable && index < 2) || (!isBenchAvailable && index == 0) ? 0 : 1
      _(rows).each(function(row, jndex){
        if($(row).find('td').eq(2).text() === '') return;
        var playerCell = $(row).find('td.playertablePlayerName');
        var playerInfo = getPlayerInfo($(playerCell).text());
        playerInfo.id = getPlayerId($(playerCell).attr('id'));
        var scoredPoints = parseFloat(_.str.trim($(row).find('td.appliedPoints').text()),2);
        delete playerInfo.isKeeper;
        playerInfo.points = scoredPoints;

        playerInfo =
          {
            id: playerInfo.id,
            firstName: playerInfo.firstName,
            lastName: playerInfo.lastName,
            team : playerInfo.team,
            position: playerInfo.position,
            points: playerInfo.points
          };

        var isStarters = !(isBenchAvailable && index % 2 == 1);

        if(isStarters){
          teams[teamIndex].starters.push(playerInfo);
        }
        else{
          teams[teamIndex].bench.push(playerInfo);
        }
      });
    });

    _(teams).each(function(team, tindex){
      team.scores.starters = _(team.starters).reduce(function(total, player){
        return total + (player.points || 0);
      },0);
      team.scores.bench = _(team.bench).reduce(function(total, player){
        return total + (player.points || 0);
      },0);
    }, teams);

    var data = {
      timestamp: timestamp,
      league: {
        id: leagueId
      },
      season: {
        id: seasonId,
        isComplete: isSeasonConcluded
      },
      week: {
        id: weekId
      },
      teams: teams
    };

    callback(null, data);
    return;
  });
};

var scrapeTrophies = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/trophylist?leagueId=' + leagueId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var trophyTable = $('.games-fullcol.games-fullcol-extramargin').find('table');
    var trophyRows = [];

    if(trophyTable.length === 2){
      trophyTable = $(trophyTable).last();
    }

    if(trophyTable.length === 1){
      trophyRows = $(trophyTable).find('tr');
      trophyRows = _.chain(trophyRows).initial().rest(); // Removes first and last rows
    }

    if(!trophyRows || trophyRows.length === 0){
      console.log('Failed to retrieve trophy rows.'.red);
      callback(1, null);
      return;
    }

    var timestamp = moment().utc().format();

    var trophies = [];

    _(trophyRows).each(function(tr){
      _($(tr).find('td')).each(function(td){
        var trophy = {image:{}};
        var img = $(td).find('img');
        trophy.image.url = img.attr('src');
        trophy.image.height = 90;
        trophy.image.width = 90;

        var wrapper = $(td).children('div').eq(1);
        trophy.label = $(wrapper).find('center b').text();
        trophy.id = getTrophyIdFromUrl($(wrapper).find('center a').attr('href'));
        // trophy.stars = parseInt($(info).children('div').children('span').children('img').attr('alt').split(' ')[0], 0);
        $(wrapper).find('center').remove();
        $(wrapper).find('br').remove();
        $(wrapper).find('a').remove();
        $(wrapper).find('.sidebar').remove();
        trophy.description = $(wrapper).text();

        // console.log(JSON.stringify(trophy, null, 2));

        trophies.push(trophy);
      });
    });

    var data = {
      timestamp: timestamp,
      league: {
        id: leagueId
      },
      trophies: trophies
    };

    callback(null, data);
    return;
  });
};

var scrapeTrophyHistory = function(callback){
  var reqOpt = {
    url: 'http://games.espn.go.com/ffl/trophyhistory?leagueId=' + leagueId + '&trophyId=' + trophyId
  };

  request.get(reqOpt, function(err, result, body){
    if(err){
      console.log('Failed to retrieve given league.'.red);
      callback(err, null);
      return;
    }

    $ = cheerio.load(body);

    var awards = $('.games-alert-mod.alert-mod2.games-grey-alert');

    if(!awards || awards.length === 0){
      console.log('Failed to retrieve trophy rows.'.red);
      callback(1, null);
      return;
    }

    var timestamp = moment().utc().format();

    var trophies = [];

    var monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    _(awards).each(function(award){
      var trophy = {};

      trophy.awardedOn = moment($(award).children('b').text(), 'MMM DD, YYYY', 'en').utc().format();

      var link = $(award).children('a');
      trophy.awardedTo = {
        teamId: getTeamIdFromUrl($(link).attr('href')),
        name: $(link).children('b').text()
      };

      trophy.description = $(award).children('div').text();

      trophies.push(trophy);
    });

    var data = {
      timestamp: timestamp,
      league: {
        id: leagueId
      },
      trophies: trophies
    };

    callback(null, data);
    return;
  });
};

var sendBackValidResponse = function(res, responeBody){
  lastAuthDate = moment();
  return res.json(responeBody);
};

function getTeamIdFromUrl(urlStr){
  if(!urlStr) return -1;
  if(!_.str.startsWith(urlStr, 'http')){
    urlStr = 'http://www.google.com' + urlStr;
  }

  var uri = url.parse(urlStr, true);

  return parseInt(uri.query.teamId, 0);
}

function getTrophyIdFromUrl(urlStr){
  // console.log(urlStr);
  if(!urlStr) return -1;
  if(!_.str.startsWith(urlStr, 'http')){
    urlStr = 'http://www.google.com' + urlStr;
  }

  var uri = url.parse(urlStr, true);

  return parseInt(uri.query.trophyId, 0);
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
      outcome: 'undetermined',
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

function calculateRunningRecord(outcomes){
  _(outcomes).each(function(o,i){
    if(o.result.outcome != 'undetermined'){
      var wins = i === 0 ? 0 : outcomes[i-1].recordSnapshot.wins;
      var losses = i === 0 ? 0 : outcomes[i-1].recordSnapshot.losses;
      var ties = i === 0 ? 0 : outcomes[i-1].recordSnapshot.ties;

      if(o.result.outcome === 'win'){
        o.recordSnapshot = {
          wins: wins+1,
          losses: losses,
          ties: ties
        };
      }
      else if(o.result.outcome === 'loss'){
        o.recordSnapshot = {
          wins: wins,
          losses: losses+1,
          ties: ties
        };
      }
      else{
        o.recordSnapshot = {
          wins: wins,
          losses: losses,
          ties: ties+1
        };
      }
    }
  }, outcomes);

  return outcomes;
}

function getPlayerInfo(pstr){
  var pi = {
    firstName: null,
    lastName: null,
    team: {
      abbrev: null
    },
    position: null,
    isKeeper: false
  };

  if(!pstr) return pi;

  var s = pstr.split('*').join('');

  if(_.str.words(s).length < 4){
    return pi;
  }

  var firstName = _.str.words(s)[0];
  var lastName = _.str.words(s)[1].split(',').join('');
  var teamAbbr = _.str.words(s)[2].toUpperCase();
  var position = _.str.words(s)[3];
  var isKeeper = _.str.words(s).length > 4;

  pi.firstName = firstName;
  pi.lastName = lastName;
  pi.team.abbrev = teamAbbr;
  pi.position = position;
  pi.isKeeper = isKeeper;

  if(lastName == 'D/ST'){
    pi.firstName = null,
    pi.lastName = null
  }

  return pi;
}

function getPlayerId(str){
  return parseInt(str.split('_')[1],0);
}

function getTeamInfoFromShortName(shortName){
  var teams = [
    {
      "id": "60026",
      "name": "Seahawks",
      "key": "SEA"
    },
    {
      "id": "60029",
      "name": "Panthers",
      "key": "CAR"
    },
    {
      "id": "60012",
      "name": "Chiefs",
      "key": "KC"
    },
    {
      "id": "60004",
      "name": "Bengals",
      "key": "CIN"
    },
    {
      "id": "60022",
      "name": "Cardinals",
      "key": "ARI"
    },
    {
      "id": "60025",
      "name": "49ers",
      "key": "SF"
    },
    {
      "id": "60014",
      "name": "Rams",
      "key": "STL"
    },
    {
      "id": "60002",
      "name": "Bills",
      "key": "BUF"
    },
    {
      "id": "60017",
      "name": "Patriots",
      "key": "NE"
    },
    {
      "id": "60011",
      "name": "Colts",
      "key": "IND"
    },
    {
      "id": "60018",
      "name": "Saints",
      "key": "NO"
    },
    {
      "id": "60027",
      "name": "Buccaneers",
      "key": "TB"
    },
    {
      "id": "60005",
      "name": "Browns",
      "key": "CLE"
    },
    {
      "id": "60007",
      "name": "Broncos",
      "key": "DEN"
    },
    {
      "id": "60033",
      "name": "Ravens",
      "key": "BAL"
    },
    {
      "id": "60019",
      "name": "Giants",
      "key": "NYG"
    },
    {
      "id": "60023",
      "name": "Steelers",
      "key": "PIT"
    },
    {
      "id": "60010",
      "name": "Titans",
      "key": "TEN"
    },
    {
      "id": "60015",
      "name": "Dolphins",
      "key": "MIA"
    },
    {
      "id": "60008",
      "name": "Lions",
      "key": "DET"
    },
    {
      "id": "60028",
      "name": "Redskins",
      "key": "WSH"
    },
    {
      "id": "60028",
      "name": "Redskins",
      "key": "WAS"
    },
    {
      "id": "60009",
      "name": "Packers",
      "key": "GB"
    },
    {
      "id": "60013",
      "name": "Raiders",
      "key": "OAK"
    },
    {
      "id": "60021",
      "name": "Eagles",
      "key": "PHI"
    },
    {
      "id": "60020",
      "name": "Jets",
      "key": "NYJ"
    },
    {
      "id": "60006",
      "name": "Cowboys",
      "key": "DAL"
    },
    {
      "id": "60003",
      "name": "Bears",
      "key": "CHI"
    },
    {
      "id": "60024",
      "name": "Chargers",
      "key": "SD"
    },
    {
      "id": "60034",
      "name": "Texans",
      "key": "HOU"
    },
    {
      "id": "60001",
      "name": "Falcons",
      "key": "ATL"
    },
    {
      "id": "60030",
      "name": "Jaguars",
      "key": "JAC"
    },
    {
      "id": "60016",
      "name": "Vikings",
      "key": "MIN"
    }
  ];

  var found =  _(teams).find(function(t){
    return t.name.toUpperCase() === (shortName||'').toUpperCase();
  });

  if(!found){
    logger.error('Could not located a team with shortName: ' + shortName);
  }

  return found;
}

function parsePlayerFantasyPosition(actual, slotPosition){
  var raw = actual || '';
  raw = raw.toLowerCase();

  if(!raw) return actual;

  if(slotPosition && slotPosition.toLowerCase() !== 'bench'){
    return slotPosition.toUpperCase();
  }

  switch(raw){
    case 'cch':
      return 'coach'.toUpperCase();
    case 'qb':
    case 'te':
    case 'wr':
    case 'p':
    case 'rb/wr':
    case 'd/st':
    case 'de,lb':
      return raw.toUpperCase();
    case 'rb':
    case 'fb':
    case 'hb':
      return 'rb'.toUpperCase();
    case 'db':
    case 'cb':
    case 's':
    case 'fs':
    case 'ss':
    case 'ws':
      return 'db'.toUpperCase();
    case 'lb':
    case 'ilb':
    case 'olb':
      return 'lb'.toUpperCase();
    case 'dl':
    case 'de':
    case 'dt':
      return 'dl'.toUpperCase();
    case 'ol':
    case 'c':
    case 'g':
    case 'og':
    case 'lg':
    case 'rg':
    case 't':
    case 'rt':
    case 'lt':
    case 'ot':
      return 'ol'.toUpperCase();
    case 'k':
    case 'pk':
      return 'k'.toUpperCase();
    default:
      console.log(raw);
      return raw.toUpperCase();
  }
}

function parsePlayerFantasyPositionCategory(actual){
  var raw = actual || '';
  raw = raw.toLowerCase();

  if(!raw) return actual;

  switch(raw){
    case 'cch':
      return 'coach'.toUpperCase();
    case 'qb':
    case 'te':
    case 'wr':
    case 'rb':
    case 'fb':
    case 'hb':
    case 'ol':
    case 'c':
    case 'g':
    case 'og':
    case 'lg':
    case 'rg':
    case 't':
    case 'rt':
    case 'lt':
    case 'ot':
    case 'rb/wr':
      return 'off'.toUpperCase();
    case 'db':
    case 'cb':
    case 's':
    case 'fs':
    case 'ss':
    case 'ws':
    case 'lb':
    case 'ilb':
    case 'olb':
    case 'dl':
    case 'de':
    case 'dt':
    case 'd/st':
    case 'de,lb':
      return 'def'.toUpperCase();
    case 'k':
    case 'pk':
    case 'p':
      return 'st'.toUpperCase();
    default:
      console.log(raw);
      return raw.toUpperCase();
  }
}

module.exports = apiRouteController;