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
                            <button onClick={() => window.location.href = "/learn-kana#game-menu-title"}>Back to Main Menu</button>
                        {/* </Link> */}
                        <button onClick={() => alert("Not implemented.. yet")}>Try Problematics</button>
                        <button onClick={() => window.location.reload(false)}>Play Again</button>
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
