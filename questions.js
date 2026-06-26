/**
 * NBA Trivia Showdown - Questions Engine
 * Contains curated questions and a procedural generator database.
 */

// Curated Question Bank (High-Quality Seed Questions)
const CURATED_QUESTIONS = [
  {
    question: "Who is the NBA's all-time leading scorer, surpassing Kareem Abdul-Jabbar in 2023?",
    options: ["Michael Jordan", "Kobe Bryant", "LeBron James", "Karl Malone"],
    answer: "LeBron James",
    category: "NBA HISTORY"
  },
  {
    question: "Which team completed the best regular season in NBA history with a 73-9 record?",
    options: ["1995-96 Chicago Bulls", "2015-16 Golden State Warriors", "1971-72 Los Angeles Lakers", "1985-86 Boston Celtics"],
    answer: "2015-16 Golden State Warriors",
    category: "TEAMS"
  },
  {
    question: "Who is the shortest player in NBA history, standing at 5 feet 3 inches?",
    options: ["Spud Webb", "Muggsy Bogues", "Earl Boykins", "Nate Robinson"],
    answer: "Muggsy Bogues",
    category: "PLAYERS"
  },
  {
    question: "What player scored 100 points in a single game on March 2, 1962?",
    options: ["Wilt Chamberlain", "Kobe Bryant", "Elgin Baylor", "Michael Jordan"],
    answer: "Wilt Chamberlain",
    category: "RECORDS"
  },
  {
    question: "Which franchise has won the most NBA Championships, tied with the Boston Celtics at 17 titles?",
    options: ["Chicago Bulls", "Golden State Warriors", "Los Angeles Lakers", "San Antonio Spurs"],
    answer: "Los Angeles Lakers",
    category: "TEAMS"
  },
  {
    question: "Who was the youngest player in NBA history to win the Most Valuable Player (MVP) award?",
    options: ["LeBron James", "Derrick Rose", "Bob McAdoo", "Wes Unseld"],
    answer: "Derrick Rose",
    category: "AWARDS"
  },
  {
    question: "Which player has won the most NBA championships in history, holding 11 rings?",
    options: ["Bill Russell", "Sam Jones", "Robert Horry", "Kareem Abdul-Jabbar"],
    answer: "Bill Russell",
    category: "NBA HISTORY"
  },
  {
    question: "Which team drafted Kobe Bryant in the 1996 NBA Draft before trading him to the Lakers?",
    options: ["Charlotte Hornets", "Los Angeles Clippers", "Boston Celtics", "Philadelphia 76ers"],
    answer: "Kobe Bryant",
    category: "DRAFT"
  },
  {
    question: "What player was selected #1 overall in the famous 1984 NBA Draft by the Houston Rockets?",
    options: ["Michael Jordan", "Hakeem Olajuwon", "Charles Barkley", "John Stockton"],
    answer: "Hakeem Olajuwon",
    category: "DRAFT"
  },
  {
    question: "Who is the only player to win the Finals MVP award while playing for the losing team?",
    options: ["Jerry West", "LeBron James", "Michael Jordan", "Kareem Abdul-Jabbar"],
    answer: "Jerry West",
    category: "AWARDS"
  },
  {
    question: "Which player did the Chicago Bulls select with the 3rd overall pick in the 1984 NBA Draft?",
    options: ["Sam Bowie", "Michael Jordan", "Hakeem Olajuwon", "Charles Barkley"],
    answer: "Michael Jordan",
    category: "DRAFT"
  },
  {
    question: "Who holds the record for the most career assists in NBA history?",
    options: ["John Stockton", "Jason Kidd", "Chris Paul", "Steve Nash"],
    answer: "John Stockton",
    category: "RECORDS"
  },
  {
    question: "Which team drafted Nikola Jokic with the 41st overall pick in the 2014 NBA Draft?",
    options: ["Denver Nuggets", "Sacramento Kings", "Portland Trail Blazers", "Dallas Mavericks"],
    answer: "Denver Nuggets",
    category: "DRAFT"
  },
  {
    question: "What NBA player is depicted on the league's official logo?",
    options: ["Jerry West", "Michael Jordan", "Magic Johnson", "Bill Russell"],
    answer: "Jerry West",
    category: "NBA HISTORY"
  },
  {
    question: "Who is the only unanimous MVP in NBA history, winning all 131 first-place votes in 2016?",
    options: ["LeBron James", "Stephen Curry", "Michael Jordan", "Shaquille O'Neal"],
    answer: "Stephen Curry",
    category: "AWARDS"
  },
  {
    question: "Which head coach holds the record for the most NBA championships in history with 11?",
    options: ["Pat Riley", "Red Auerbach", "Phil Jackson", "Gregg Popovich"],
    answer: "Phil Jackson",
    category: "NBA HISTORY"
  },
  {
    question: "Who is the only player in NBA history to record a quadruple-double twice?",
    options: ["Nate Thurmond", "Alvin Robertson", "Hakeem Olajuwon", "No player has done it twice"],
    answer: "No player has done it twice",
    category: "RECORDS"
  },
  {
    question: "Which team selected Giannis Antetokounmpo with the 15th pick in the 2013 draft?",
    options: ["Milwaukee Bucks", "Toronto Raptors", "Atlanta Hawks", "Boston Celtics"],
    answer: "Milwaukee Bucks",
    category: "DRAFT"
  },
  {
    question: "What player won MVP, Finals MVP, and Defensive Player of the Year in the single 1993-94 season?",
    options: ["Michael Jordan", "Hakeem Olajuwon", "David Robinson", "Shaquille O'Neal"],
    answer: "Hakeem Olajuwon",
    category: "AWARDS"
  },
  {
    question: "What country is Dallas Mavericks star Luka Doncic from?",
    options: ["Serbia", "Slovenia", "Croatia", "Latvia"],
    answer: "Slovenia",
    category: "PLAYERS"
  }
];

// Procedural Generator Database
const DRAFT_PICKS_DB = [
  { name: "LeBron James", team: "Cleveland Cavaliers", year: 2003, pick: 1 },
  { name: "Yao Ming", team: "Houston Rockets", year: 2002, pick: 1 },
  { name: "Kyrie Irving", team: "Cleveland Cavaliers", year: 2011, pick: 1 },
  { name: "Anthony Davis", team: "New Orleans Hornets", year: 2012, pick: 1 },
  { name: "Stephen Curry", team: "Golden State Warriors", year: 2009, pick: 7 },
  { name: "James Harden", team: "Oklahoma City Thunder", year: 2009, pick: 3 },
  { name: "Russell Westbrook", team: "Seattle SuperSonics", year: 2008, pick: 4 },
  { name: "Kevin Durant", team: "Seattle SuperSonics", year: 2007, pick: 2 },
  { name: "Chris Paul", team: "New Orleans Hornets", year: 2005, pick: 4 },
  { name: "Dwight Howard", team: "Orlando Magic", year: 2004, pick: 1 },
  { name: "Dwyane Wade", team: "Miami Heat", year: 2003, pick: 5 },
  { name: "Carmelo Anthony", team: "Denver Nuggets", year: 2003, pick: 3 },
  { name: "Allen Iverson", team: "Philadelphia 76ers", year: 1996, pick: 1 },
  { name: "Tim Duncan", team: "San Antonio Spurs", year: 1997, pick: 1 },
  { name: "Shaquille O'Neal", team: "Orlando Magic", year: 1992, pick: 1 },
  { name: "Magic Johnson", team: "Los Angeles Lakers", year: 1979, pick: 1 },
  { name: "Larry Bird", team: "Boston Celtics", year: 1978, pick: 6 },
  { name: "Michael Jordan", team: "Chicago Bulls", year: 1984, pick: 3 },
  { name: "Hakeem Olajuwon", team: "Houston Rockets", year: 1984, pick: 1 },
  { name: "Patrick Ewing", team: "New York Knicks", year: 1985, pick: 1 },
  { name: "David Robinson", team: "San Antonio Spurs", year: 1987, pick: 1 },
  { name: "Derrick Rose", team: "Chicago Bulls", year: 2008, pick: 1 },
  { name: "John Wall", team: "Washington Wizards", year: 2010, pick: 1 },
  { name: "Blake Griffin", team: "Los Angeles Clippers", year: 2009, pick: 1 },
  { name: "Karl-Anthony Towns", team: "Minnesota Timberwolves", year: 2015, pick: 1 },
  { name: "Ben Simmons", team: "Philadelphia 76ers", year: 2016, pick: 1 },
  { name: "Jayson Tatum", team: "Boston Celtics", year: 2017, pick: 3 },
  { name: "Deandre Ayton", team: "Phoenix Suns", year: 2018, pick: 1 },
  { name: "Luka Doncic", team: "Atlanta Hawks", year: 2018, pick: 3 }, // traded to Dallas
  { name: "Zion Williamson", team: "New Orleans Pelicans", year: 2019, pick: 1 },
  { name: "Anthony Edwards", team: "Minnesota Timberwolves", year: 2020, pick: 1 },
  { name: "Cade Cunningham", team: "Detroit Pistons", year: 2021, pick: 1 },
  { name: "Paolo Banchero", team: "Orlando Magic", year: 2022, pick: 1 },
  { name: "Victor Wembanyama", team: "San Antonio Spurs", year: 2023, pick: 1 }
];

const TEAMS_DB = [
  { name: "Boston Celtics", city: "Boston", arena: "TD Garden", championships: 18, conference: "Eastern", division: "Atlantic", mascot: "Lucky the Leprechaun" },
  { name: "Brooklyn Nets", city: "Brooklyn", arena: "Barclays Center", championships: 0, conference: "Eastern", division: "Atlantic", mascot: "Sly the Silver Fox (formerly)" },
  { name: "New York Knicks", city: "New York", arena: "Madison Square Garden", championships: 2, conference: "Eastern", division: "Atlantic", mascot: "None" },
  { name: "Philadelphia 76ers", city: "Philadelphia", arena: "Wells Fargo Center", championships: 3, conference: "Eastern", division: "Atlantic", mascot: "Franklin the Dog" },
  { name: "Toronto Raptors", city: "Toronto", arena: "Scotiabank Arena", championships: 1, conference: "Eastern", division: "Atlantic", mascot: "The Raptor" },
  { name: "Chicago Bulls", city: "Chicago", arena: "United Center", championships: 6, conference: "Eastern", division: "Central", mascot: "Benny the Bull" },
  { name: "Cleveland Cavaliers", city: "Cleveland", arena: "Rocket Mortgage FieldHouse", championships: 1, conference: "Eastern", division: "Central", mascot: "Sir CC" },
  { name: "Detroit Pistons", city: "Detroit", arena: "Little Caesars Arena", championships: 3, conference: "Eastern", division: "Central", mascot: "Hooper" },
  { name: "Indiana Pacers", city: "Indianapolis", arena: "Gainbridge Fieldhouse", championships: 0, conference: "Eastern", division: "Central", mascot: "Boomer" },
  { name: "Milwaukee Bucks", city: "Milwaukee", arena: "Fiserv Forum", championships: 2, conference: "Eastern", division: "Central", mascot: "Bango" },
  { name: "Atlanta Hawks", city: "Atlanta", arena: "State Farm Arena", championships: 1, conference: "Eastern", division: "Southeast", mascot: "Harry the Hawk" },
  { name: "Charlotte Hornets", city: "Charlotte", arena: "Spectrum Center", championships: 0, conference: "Eastern", division: "Southeast", mascot: "Hugo the Hornet" },
  { name: "Miami Heat", city: "Miami", arena: "Kaseya Center", championships: 3, conference: "Eastern", division: "Southeast", mascot: "Burnie" },
  { name: "Orlando Magic", city: "Orlando", arena: "Kia Center", championships: 0, conference: "Eastern", division: "Southeast", mascot: "Stuff the Magic Dragon" },
  { name: "Washington Wizards", city: "Washington", arena: "Capital One Arena", championships: 1, conference: "Eastern", division: "Southeast", mascot: "G-Wiz" },
  { name: "Denver Nuggets", city: "Denver", arena: "Ball Arena", championships: 1, conference: "Western", division: "Northwest", mascot: "Rocky the Mountain Lion" },
  { name: "Minnesota Timberwolves", city: "Minneapolis", arena: "Target Center", championships: 0, conference: "Western", division: "Northwest", mascot: "Crunch the Wolf" },
  { name: "Oklahoma City Thunder", city: "Oklahoma City", arena: "Paycom Center", championships: 1, conference: "Western", division: "Northwest", mascot: "Rumble the Bison" },
  { name: "Portland Trail Blazers", city: "Portland", arena: "Moda Center", championships: 1, conference: "Western", division: "Northwest", mascot: "Blaze the Trail Cat" },
  { name: "Utah Jazz", city: "Salt Lake City", arena: "Delta Center", championships: 0, conference: "Western", division: "Northwest", mascot: "Jazz Bear" },
  { name: "Golden State Warriors", city: "San Francisco", arena: "Chase Center", championships: 7, conference: "Western", division: "Pacific", mascot: "None" },
  { name: "Los Angeles Clippers", city: "Los Angeles", arena: "Intuit Dome", championships: 0, conference: "Western", division: "Pacific", mascot: "Chuck the Condor" },
  { name: "Los Angeles Lakers", city: "Los Angeles", arena: "Crypto.com Arena", championships: 17, conference: "Western", division: "Pacific", mascot: "None" },
  { name: "Phoenix Suns", city: "Phoenix", arena: "Footprint Center", championships: 0, conference: "Western", division: "Pacific", mascot: "The Suns Gorilla" },
  { name: "Sacramento Kings", city: "Sacramento", arena: "Golden 1 Center", championships: 1, conference: "Western", division: "Pacific", mascot: "Slamson the Lion" },
  { name: "Dallas Mavericks", city: "Dallas", arena: "American Airlines Center", championships: 1, conference: "Western", division: "Southwest", mascot: "Champ" },
  { name: "Houston Rockets", city: "Houston", arena: "Toyota Center", championships: 2, conference: "Western", division: "Southwest", mascot: "Clutch the Bear" },
  { name: "Memphis Grizzlies", city: "Memphis", arena: "FedExForum", championships: 0, conference: "Western", division: "Southwest", mascot: "Grizz" },
  { name: "New Orleans Pelicans", city: "New Orleans", arena: "Smoothie King Center", championships: 0, conference: "Western", division: "Southwest", mascot: "Pierre the Pelican" },
  { name: "San Antonio Spurs", city: "San Antonio", arena: "Frost Bank Center", championships: 5, conference: "Western", division: "Southwest", mascot: "The Coyote" }
];

const PLAYER_DETAILS_DB = [
  { name: "Stephen Curry", college: "Davidson", number: 30, nickname: "Baby-Faced Assassin", position: "Point Guard" },
  { name: "LeBron James", college: "None (Drafted from HS)", number: 23, nickname: "King James", position: "Small Forward" },
  { name: "Kevin Durant", college: "Texas", number: 35, nickname: "The Slim Reaper", position: "Power Forward" },
  { name: "Giannis Antetokounmpo", college: "None (Greece)", number: 34, nickname: "The Greek Freak", position: "Power Forward" },
  { name: "Nikola Jokic", college: "None (Serbia)", number: 15, nickname: "The Joker", position: "Center" },
  { name: "Luka Doncic", college: "None (Slovenia)", number: 77, nickname: "El Matador", position: "Point Guard" },
  { name: "Jayson Tatum", college: "Duke", number: 0, nickname: "Taco Jay", position: "Small Forward" },
  { name: "Joel Embiid", college: "Kansas", number: 21, nickname: "The Process", position: "Center" },
  { name: "Jimmy Butler", college: "Marquette", number: 22, nickname: "Jimmy Buckets", position: "Small Forward" },
  { name: "Anthony Davis", college: "Kentucky", number: 3, nickname: "The Brow", position: "Power Forward" },
  { name: "Damian Lillard", college: "Weber State", number: 0, nickname: "Dame Time", position: "Point Guard" },
  { name: "Kyrie Irving", college: "Duke", number: 11, nickname: "Uncle Drew", position: "Point Guard" },
  { name: "James Harden", college: "Arizona State", number: 1, nickname: "The Beard", position: "Shooting Guard" },
  { name: "Russell Westbrook", college: "UCLA", number: 0, nickname: "Brodie", position: "Point Guard" },
  { name: "Kawhi Leonard", college: "San Diego State", number: 2, nickname: "The Claw", position: "Small Forward" },
  { name: "Michael Jordan", college: "North Carolina", number: 23, nickname: "Air Jordan", position: "Shooting Guard" },
  { name: "Kobe Bryant", college: "None (Drafted from HS)", number: 24, nickname: "Black Mamba", position: "Shooting Guard" },
  { name: "Shaquille O'Neal", college: "LSU", number: 32, nickname: "Diesel", position: "Center" },
  { name: "Allen Iverson", college: "Georgetown", number: 3, nickname: "The Answer", position: "Point Guard" },
  { name: "Magic Johnson", college: "Michigan State", number: 32, nickname: "Magic", position: "Point Guard" },
  { name: "Larry Bird", college: "Indiana State", number: 33, nickname: "Larry Legend", position: "Small Forward" },
  { name: "Karl Malone", college: "Louisiana Tech", number: 32, nickname: "The Mailman", position: "Power Forward" },
  { name: "Hakeem Olajuwon", college: "Houston", number: 34, nickname: "The Dream", position: "Center" },
  { name: "Tim Duncan", college: "Wake Forest", number: 21, nickname: "The Big Fundamental", position: "Power Forward" },
  { name: "Charles Barkley", college: "Auburn", number: 34, nickname: "Sir Charles", position: "Power Forward" },
  { name: "Paul Pierce", college: "Kansas", number: 34, nickname: "The Truth", position: "Small Forward" },
  { name: "Gary Payton", college: "Oregon State", number: 20, nickname: "The Glove", position: "Point Guard" },
  { name: "Dirk Nowitzki", college: "None (Germany)", number: 41, nickname: "Dirty Dirk", position: "Power Forward" },
  { name: "Dwyane Wade", college: "Marquette", number: 3, nickname: "Flash", position: "Shooting Guard" },
  { name: "Ray Allen", college: "Connecticut", number: 34, nickname: "Jesus Shuttlesworth", position: "Shooting Guard" }
];

const HISTORICAL_AWARDS_DB = [
  { year: "2023-24", mvp: "Nikola Jokic", dpoy: "Rudy Gobert", roty: "Victor Wembanyama" },
  { year: "2022-23", mvp: "Joel Embiid", dpoy: "Jaren Jackson Jr.", roty: "Paolo Banchero" },
  { year: "2021-22", mvp: "Nikola Jokic", dpoy: "Marcus Smart", roty: "Scottie Barnes" },
  { year: "2020-21", mvp: "Nikola Jokic", dpoy: "Rudy Gobert", roty: "LaMelo Ball" },
  { year: "2019-20", mvp: "Giannis Antetokounmpo", dpoy: "Giannis Antetokounmpo", roty: "Ja Morant" },
  { year: "2018-19", mvp: "Giannis Antetokounmpo", dpoy: "Rudy Gobert", roty: "Luka Doncic" },
  { year: "2017-18", mvp: "James Harden", dpoy: "Rudy Gobert", roty: "Ben Simmons" },
  { year: "2016-17", mvp: "Russell Westbrook", dpoy: "Draymond Green", roty: "Malcolm Brogdon" },
  { year: "2015-16", mvp: "Stephen Curry", dpoy: "Kawhi Leonard", roty: "Karl-Anthony Towns" },
  { year: "2014-15", mvp: "Stephen Curry", dpoy: "Kawhi Leonard", roty: "Andrew Wiggins" },
  { year: "2013-14", mvp: "Kevin Durant", dpoy: "Joakim Noah", roty: "Michael Carter-Williams" },
  { year: "2012-13", mvp: "LeBron James", dpoy: "Marc Gasol", roty: "Damian Lillard" },
  { year: "2011-12", mvp: "LeBron James", dpoy: "Tyson Chandler", roty: "Kyrie Irving" },
  { year: "2010-11", mvp: "Derrick Rose", dpoy: "Dwight Howard", roty: "Blake Griffin" },
  { year: "2009-10", mvp: "LeBron James", dpoy: "Dwight Howard", roty: "Tyreke Evans" },
  { year: "2008-09", mvp: "LeBron James", dpoy: "Dwight Howard", roty: "Derrick Rose" },
  { year: "2007-08", mvp: "Kobe Bryant", dpoy: "Kevin Garnett", roty: "Kevin Durant" },
  { year: "2006-07", mvp: "Dirk Nowitzki", dpoy: "Marcus Camby", roty: "Brandon Roy" },
  { year: "2005-06", mvp: "Steve Nash", dpoy: "Ben Wallace", roty: "Chris Paul" },
  { year: "2004-05", mvp: "Steve Nash", dpoy: "Ben Wallace", roty: "Emeka Okafor" },
  { year: "2003-04", mvp: "Kevin Garnett", dpoy: "Ron Artest", roty: "LeBron James" },
  { year: "2002-03", mvp: "Tim Duncan", dpoy: "Ben Wallace", roty: "Amare Stoudemire" },
  { year: "2001-02", mvp: "Tim Duncan", dpoy: "Ben Wallace", roty: "Pau Gasol" },
  { year: "2000-01", mvp: "Allen Iverson", dpoy: "Dikembe Mutombo", roty: "Mike Miller" },
  { year: "1999-00", mvp: "Shaquille O'Neal", dpoy: "Alonzo Mourning", roty: "Elton Brand" }, // co-roty Steve Francis omitted for simplicity
  { year: "1998-99", mvp: "Karl Malone", dpoy: "Alonzo Mourning", roty: "Vince Carter" },
  { year: "1997-98", mvp: "Michael Jordan", dpoy: "Dikembe Mutombo", roty: "Tim Duncan" },
  { year: "1996-97", mvp: "Karl Malone", dpoy: "Dikembe Mutombo", roty: "Allen Iverson" },
  { year: "1995-96", mvp: "Michael Jordan", dpoy: "Gary Payton", roty: "Damon Stoudamire" },
  { year: "1994-95", mvp: "David Robinson", dpoy: "Dikembe Mutombo", roty: "Grant Hill" }, // co-roty Jason Kidd
  { year: "1993-94", mvp: "Hakeem Olajuwon", dpoy: "Hakeem Olajuwon", roty: "Chris Webber" },
  { year: "1992-93", mvp: "Charles Barkley", dpoy: "Hakeem Olajuwon", roty: "Shaquille O'Neal" },
  { year: "1991-92", mvp: "Michael Jordan", dpoy: "David Robinson", roty: "Larry Johnson" },
  { year: "1990-91", mvp: "Michael Jordan", dpoy: "Dennis Rodman", roty: "Derrick Coleman" },
  { year: "1989-90", mvp: "Magic Johnson", dpoy: "Dennis Rodman", roty: "David Robinson" },
  { year: "1988-89", mvp: "Magic Johnson", dpoy: "Mark Eaton", roty: "Mitch Richmond" },
  { year: "1987-88", mvp: "Michael Jordan", dpoy: "Michael Jordan", roty: "Mark Jackson" }
];

// Helper: Shuffle Array
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper: Pick a random item from array
function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Procedural Generator
const ProceduralGenerator = {
  // Generate a random trivia question based on template types
  generateQuestion: function() {
    const templates = [
      this.getPlayerDraftTeamQuestion,
      this.getPlayerJerseyNumberQuestion,
      this.getPlayerCollegeQuestion,
      this.getTeamChampionshipCountQuestion,
      this.getMvpAwardQuestion,
      this.getTeamArenaQuestion,
      this.getPlayerNicknameQuestion,
      this.getTeamDivisionQuestion
    ];
    
    // Select a random template generator
    const selectedTemplate = randomPick(templates).bind(this);
    return selectedTemplate();
  },

  // 1. "Which team selected [Player] in the [Year] NBA Draft?"
  getPlayerDraftTeamQuestion: function() {
    const pick = randomPick(DRAFT_PICKS_DB);
    const questionText = `Which team selected ${pick.name} with pick #${pick.pick} in the ${pick.year} NBA Draft?`;
    
    const correctAnswer = pick.team;
    
    // Select 3 other random teams as distractors
    const allTeams = TEAMS_DB.map(t => t.name).filter(t => t !== correctAnswer);
    const distractors = shuffleArray(allTeams).slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...distractors]);
    
    return {
      question: questionText,
      options: options,
      answer: correctAnswer,
      category: "DRAFT"
    };
  },

  // 2. "What jersey number does [Player] wear?"
  getPlayerJerseyNumberQuestion: function() {
    // Filter out players whose number details are valid
    const players = PLAYER_DETAILS_DB.filter(p => p.number !== undefined);
    const player = randomPick(players);
    
    const isRetired = ["Michael Jordan", "Kobe Bryant", "Shaquille O'Neal", "Allen Iverson", "Magic Johnson", "Larry Bird", "Karl Malone", "Hakeem Olajuwon", "Tim Duncan", "Charles Barkley", "Paul Pierce", "Gary Payton", "Dirk Nowitzki", "Dwyane Wade", "Ray Allen"].includes(player.name);
    
    const questionText = `What jersey number did ${player.name} wear for the majority of his career?`;
    const activeQuestionText = `What jersey number does ${player.name} currently wear?`;
    
    const correctAnswer = player.number.toString();
    
    // Distractors: other numbers
    const distractorPool = [];
    while (distractorPool.length < 3) {
      const num = Math.floor(Math.random() * 99).toString();
      if (num !== correctAnswer && !distractorPool.includes(num)) {
        distractorPool.push(num);
      }
    }
    
    const options = shuffleArray([correctAnswer, ...distractorPool]);
    
    return {
      question: isRetired ? questionText : activeQuestionText,
      options: options,
      answer: correctAnswer,
      category: "PLAYERS"
    };
  },

  // 3. "Which college did [Player] attend?"
  getPlayerCollegeQuestion: function() {
    // Filter players who attended a college
    const eligiblePlayers = PLAYER_DETAILS_DB.filter(p => p.college && !p.college.includes("None"));
    const player = randomPick(eligiblePlayers);
    
    const questionText = `Which college or university did ${player.name} play for before entering the NBA?`;
    const correctAnswer = player.college;
    
    const otherColleges = eligiblePlayers.map(p => p.college).filter(c => c !== correctAnswer);
    const uniqueColleges = [...new Set(otherColleges)];
    const distractors = shuffleArray(uniqueColleges).slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...distractors]);
    
    return {
      question: questionText,
      options: options,
      answer: correctAnswer,
      category: "COLLEGE"
    };
  },

  // 4. "How many NBA Championships have the [Team] won in franchise history?"
  getTeamChampionshipCountQuestion: function() {
    const team = randomPick(TEAMS_DB);
    const questionText = `How many NBA Championships have the ${team.name} won in franchise history?`;
    
    const correctAnswer = team.championships.toString();
    
    // Distractors: other likely championship counts
    const possibleCounts = ["0", "1", "2", "3", "4", "5", "6", "17", "18"];
    let distractors = possibleCounts.filter(c => c !== correctAnswer);
    distractors = shuffleArray(distractors).slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...distractors]);
    
    return {
      question: questionText,
      options: options,
      answer: correctAnswer,
      category: "TEAMS"
    };
  },

  // 5. "Who won the NBA MVP Award in the [Year] season?"
  getMvpAwardQuestion: function() {
    const award = randomPick(HISTORICAL_AWARDS_DB);
    const questionText = `Who won the NBA Most Valuable Player (MVP) Award for the ${award.year} season?`;
    
    const correctAnswer = award.mvp;
    
    // Pick other MVP winners of surrounding eras
    const otherMvps = HISTORICAL_AWARDS_DB.map(a => a.mvp).filter(name => name !== correctAnswer);
    const uniqueMvps = [...new Set(otherMvps)];
    const distractors = shuffleArray(uniqueMvps).slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...distractors]);
    
    return {
      question: questionText,
      options: options,
      answer: correctAnswer,
      category: "AWARDS"
    };
  },

  // 6. "The [Team] play their home games in which arena?"
  getTeamArenaQuestion: function() {
    const team = randomPick(TEAMS_DB);
    const questionText = `The ${team.name} play their home games in which arena?`;
    
    const correctAnswer = team.arena;
    
    const otherArenas = TEAMS_DB.map(t => t.arena).filter(a => a !== correctAnswer && a !== "None");
    const uniqueArenas = [...new Set(otherArenas)];
    const distractors = shuffleArray(uniqueArenas).slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...distractors]);
    
    return {
      question: questionText,
      options: options,
      answer: correctAnswer,
      category: "ARENAS"
    };
  },

  // 7. "Which NBA player is famously known by the nickname '[Nickname]'?"
  getPlayerNicknameQuestion: function() {
    const players = PLAYER_DETAILS_DB.filter(p => p.nickname && p.nickname !== "None");
    const player = randomPick(players);
    
    const questionText = `Which legendary NBA player is famously known by the nickname "${player.nickname}"?`;
    const correctAnswer = player.name;
    
    const otherPlayers = PLAYER_DETAILS_DB.map(p => p.name).filter(n => n !== correctAnswer);
    const distractors = shuffleArray(otherPlayers).slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...distractors]);
    
    return {
      question: questionText,
      options: options,
      answer: correctAnswer,
      category: "NICKNAMES"
    };
  },

  // 8. "Which division do the [Team] compete in?"
  getTeamDivisionQuestion: function() {
    const team = randomPick(TEAMS_DB);
    const questionText = `Which NBA Division do the ${team.name} compete in?`;
    
    const correctAnswer = `${team.division} Division`;
    
    const divisions = [
      "Atlantic Division",
      "Central Division",
      "Southeast Division",
      "Northwest Division",
      "Pacific Division",
      "Southwest Division"
    ];
    
    const distractors = divisions.filter(d => d !== correctAnswer);
    const options = shuffleArray([correctAnswer, ...distractors]).slice(0, 4);
    
    // Ensure the correct answer is definitely in the options (it will be, since we took correctAnswer + 3 distractors)
    const finalOptions = shuffleArray([correctAnswer, ...shuffleArray(distractors).slice(0, 3)]);
    
    return {
      question: questionText,
      options: finalOptions,
      answer: correctAnswer,
      category: "TEAMS"
    };
  }
};

// Global Trivia Engine Object
const TriviaEngine = {
  history: [], // tracks recent questions to avoid repeats
  questionCounter: 0,

  getNextQuestion: function() {
    this.questionCounter++;
    
    let nextQ = null;
    let attempts = 0;
    
    // 25% chance of a curated question, 75% chance of procedural, if we have curated questions remaining.
    const useCurated = Math.random() < 0.25 && CURATED_QUESTIONS.length > this.history.filter(q => q.isCurated).length;
    
    while (!nextQ && attempts < 50) {
      attempts++;
      
      if (useCurated) {
        // Pick a random curated question that hasn't been answered recently
        const availableCurated = CURATED_QUESTIONS.filter(cq => 
          !this.history.some(hq => hq.text === cq.question)
        );
        
        if (availableCurated.length > 0) {
          const picked = randomPick(availableCurated);
          nextQ = { ...picked, isCurated: true };
        } else {
          // Fall back to procedural
          const procQ = ProceduralGenerator.generateQuestion();
          if (!this.history.some(hq => hq.text === procQ.question)) {
            nextQ = { ...procQ, isCurated: false };
          }
        }
      } else {
        // Procedural question
        const procQ = ProceduralGenerator.generateQuestion();
        if (!this.history.some(hq => hq.text === procQ.question)) {
          nextQ = { ...procQ, isCurated: false };
        }
      }
    }
    
    // If somehow we failed to find a unique question (e.g. infinite loop protection), pick a random procedural one anyway
    if (!nextQ) {
      nextQ = { ...ProceduralGenerator.generateQuestion(), isCurated: false };
    }
    
    // Save to history
    this.history.push({ text: nextQ.question, isCurated: nextQ.isCurated });
    
    // Keep history at maximum 40 entries
    if (this.history.length > 40) {
      this.history.shift();
    }
    
    return {
      id: this.questionCounter,
      question: nextQ.question,
      options: nextQ.options,
      answer: nextQ.answer,
      category: nextQ.category
    };
  }
};

// Make accessible globally
window.TriviaEngine = TriviaEngine;
