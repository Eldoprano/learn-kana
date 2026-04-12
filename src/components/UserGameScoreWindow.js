import React from 'react'
// import {Link} from "react-router-dom";

/* userStats object structure:
{
    "あ": {
        "totalRightGuesses": 6,
        "totalWrongGuesses": 1,
        "totalWrongSubmissions": 2,
        "totalEditCount": 15,
        "totaltotalResponseTime":2.36,
        "totalAskForHelpCounter": 3,
        "currentGameStats": {
          "rightGuesses":1,
          "wrongGuesses":0,
          "wrongSubmissions":0,
          "editCount":3,
          "totalResponseTime":1.33,
          "askForHelpCounter":0
        }
        "dailyPerformance": [
            {
                "date": 1678886400000,
                "rightGuesses": 3,
                "wrongGuesses": 1,
                "wrongSubmissions": 2,
                "editCount": 8,
                "askForHelpCounter": 1,
                "responseTimeSum": 1.45
            }
        ]
    }
}
*/
export default function UserGameScoreWindow(props) {
    const userStats = JSON.parse(localStorage.getItem('userStats'))

    function getTotalRightGuessesOfCurrentGame() {
        let totalRightGuesses=0;
        for (const kana in userStats) {
            totalRightGuesses += userStats[kana].currentGameStats.rightGuesses;
        }
        return totalRightGuesses;
    }

    function getAverageResponseTimeOfCurrentGame() {
        let totalResponseTime=0;
        for (const kana in userStats) {
            totalResponseTime += userStats[kana].currentGameStats.totalResponseTime;
        }
        return (totalResponseTime/getTotalRightGuessesOfCurrentGame())/1000;
    }

    function getTotalEditsOfCurrentGame() {
        let totalEdits=0;
        for (const kana in userStats) {
            totalEdits += userStats[kana].currentGameStats.editCount || 0;
        }
        return totalEdits;
    }

    function getTotalWrongSubmissionsOfCurrentGame() {
        let totalWrongSubmissions=0;
        for (const kana in userStats) {
            totalWrongSubmissions += userStats[kana].currentGameStats.wrongSubmissions || 0;
        }
        return totalWrongSubmissions;
    }

    function getAverageEditsPerKana() {
        const totalRightGuesses = getTotalRightGuessesOfCurrentGame();
        if (totalRightGuesses === 0) return 0;
        return getTotalEditsOfCurrentGame() / totalRightGuesses;
    }

    // This function returns n kanas in descending order that have the highest average response time
    function getTopNProblematicKanas(n) {
        let problematicKanas = [];
        for (const kana in userStats) {
            if(userStats[kana].currentGameStats.rightGuesses === 0) {
                continue;
            }

            const averageResponseTime = userStats[kana].currentGameStats.totalResponseTime / userStats[kana].currentGameStats.rightGuesses;
            problematicKanas.push({
                kana: kana,
                averageResponseTime: averageResponseTime/1000
            });
        }
        problematicKanas.sort((a,b) => b.averageResponseTime - a.averageResponseTime);
        return problematicKanas.slice(0,n);
    }

    // Get problematic characters based on recent performance (last 30 days)
    function getProblematicCharactersForFilter() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();

        // Collect metrics for all characters with recent data
        let allMetrics = [];

        for (const kana in userStats) {
            const stats = userStats[kana];

            if (!stats || !stats.dailyPerformance || stats.dailyPerformance.length === 0) {
                continue;
            }

            let recentRightGuesses = 0;
            let recentWrongGuesses = 0;
            let recentAskForHelpCounter = 0;
            let recentResponseTimeSum = 0;

            stats.dailyPerformance.forEach(daily => {
                if (daily.date >= thirtyDaysAgoTimestamp) {
                    recentRightGuesses += daily.rightGuesses || 0;
                    recentWrongGuesses += daily.wrongGuesses || 0;
                    recentAskForHelpCounter += daily.askForHelpCounter || 0;
                    recentResponseTimeSum += daily.responseTimeSum || 0;
                }
            });

            const totalAttempts = recentRightGuesses + recentWrongGuesses + recentAskForHelpCounter;

            if (totalAttempts >= 2) { // Minimum 2 attempts to be considered
                const errorRate = (recentWrongGuesses + recentAskForHelpCounter) / totalAttempts;
                const avgResponseTime = recentRightGuesses > 0 ? recentResponseTimeSum / recentRightGuesses : 0;

                allMetrics.push({
                    kana,
                    errorRate,
                    avgResponseTime,
                    problemScore: errorRate * 100 + (avgResponseTime / 1000) * 2 // Combined score
                });
            }
        }

        // Sort by problem score and take top 30% or at least 5 characters
        allMetrics.sort((a, b) => b.problemScore - a.problemScore);
        const numberOfProblematic = Math.max(5, Math.ceil(allMetrics.length * 0.3));
        const topProblematic = allMetrics.slice(0, numberOfProblematic);

        return topProblematic.map(m => m.kana);
    }

    function handleTryProblematicsClick() {
        const problematicChars = getProblematicCharactersForFilter();

        if (problematicChars.length === 0) {
            alert("No problematic characters found! You're doing great! 🎉");
            return;
        }

        // Store the problematic characters filter in localStorage
        localStorage.setItem('problematicKanasFilter', JSON.stringify(problematicChars));

        // Reload to start a new game with filtered characters
        window.location.reload(false);
    }

    let userStatsElement = <></>
    if (getAverageResponseTimeOfCurrentGame() > 0) {
        userStatsElement = <div className='inGameUserGameScoreWindow_stats'>
            <div className='inGameUserGameScoreWindow_stats_speed'>
                <p>
                    {"Time per Kana: " + getAverageResponseTimeOfCurrentGame().toFixed(3) + " seconds"}
                </p>
                <p>
                    {"Avg Edits per Kana: " + getAverageEditsPerKana().toFixed(1)}
                </p>
                {getTotalWrongSubmissionsOfCurrentGame() > 0 && (
                    <p>
                        {"Wrong Submissions: " + getTotalWrongSubmissionsOfCurrentGame()}
                    </p>
                )}
            </div>
            <div className='inGameUserGameScoreWindow_stats_problematicKanas'>
                <p>Slow Kanas:</p>
                <div>
                    {
                        getTopNProblematicKanas(5).map((kana, index) => {
                            return <p className='problematicKanasElement' key={'problematicKanasElement-'+{index}}>{kana.kana + ': ' + kana.averageResponseTime.toFixed(2)}</p>
                        })
                    }
                </div>
            </div>
        </div>
    } else {
        userStatsElement = <div className='inGameUserGameScoreWindow_stats'>
            <div className='inGameUserGameScoreWindow_stats_speed'>
                <p>Yeah.. ehh... Try again?</p>
            </div>
        </div>
    }

    let inGameUserGameScoreWindow = <></>
    if(props.visible){
        inGameUserGameScoreWindow = 
            <div className='inGameUserGameScoreBackground'>            
                <div className='inGameUserGameScoreWindow'>
                    <div className='inGameUserGameScoreWindow_header'>
                        <h1>{getTotalRightGuessesOfCurrentGame()}</h1>
                        <h2>{(localStorage.getItem("game-mode-word") === "true") ? "Words" : "Kanas"} Completed!</h2>
                    </div>
                    {userStatsElement}
                    <div className='inGameUserGameScoreWindow_buttons'>
                        {/* Changing to window.location because of some react problems
                            (game-mode-word change wasn't being respected)
                             <Link to='/learn-kana'> */}
                            <button onClick={() => {
                                localStorage.removeItem('problematicKanasFilter');
                                window.location.href = "/learn-kana#game-menu-title";
                            }}>Back to Main Menu</button>
                        {/* </Link> */}
                        <button onClick={handleTryProblematicsClick}>Review Mistakes</button>
                        <button onClick={() => {
                            localStorage.removeItem('problematicKanasFilter');
                            window.location.reload(false);
                        }}>Play Again</button>
                    </div>
                </div>            
            </div>
    }

    return (
        <>
            {inGameUserGameScoreWindow}
        </>
    )
}
