import React from 'react'
// import {Link} from "react-router-dom";

/* userStats object structure:
{
    "あ": {
        "totalRightGuesses": 6,
        "totalTouchWrongGuesses": 1,
        "totaltotalResponseTime":2.36,
        "totalAskForHelpCounter": 3,
        "currentGameStats": {
          "rightGuesses":1,
          "touchWrongGuesses":0,
          "totalResponseTime":1.33,
          "askForHelpCounter":0
        }
        "last7DaysStats": [
            {
                "date": 12379898722,
                "rightGuesses": 3,
                "TouchwrongGuesses": 1,
                "totalResponseTime": 1.45,
                "askForHelpCounter": 1
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

    const problematicKanasElement = <>
        <p>Slow Kanas:</p>
        <div>
            {
                getTopNProblematicKanas(5).map((kana, index) => {
                    return <p className='problematicKanasElement'>{kana.kana + ': ' + kana.averageResponseTime.toFixed(2)}</p>
                })
            }
        </div>
    </>
    let inGameUserGameScoreWindow = <></>
    if(props.visible){
        inGameUserGameScoreWindow = 
            <div className='inGameUserGameScoreBackground'>            
                <div className='inGameUserGameScoreWindow'>
                    <div className='inGameUserGameScoreWindow_header'>
                        <h1>{getTotalRightGuessesOfCurrentGame()}</h1>
                        <h2>Kanas Completed!</h2>
                    </div>
                    <div className='inGameUserGameScoreWindow_stats'>
                        <div className='inGameUserGameScoreWindow_stats_speed'>
                            <p>{"Time per Kana: " + getAverageResponseTimeOfCurrentGame().toFixed(3) + " seconds"}</p>
                        </div>
                        <div className='inGameUserGameScoreWindow_stats_problematicKanas'>
                            {problematicKanasElement}
                        </div>
                    </div>
                    <div className='inGameUserGameScoreWindow_buttons'>
                        {/* Changing to window.location because of some react problems 
                            (game-mode-word change wasn't being respected) 
                        */}
                        {/* <Link to='/learn-kana'> */} 
                            <button onClick={() => window.location.href = "/learn-kana"}>Back to Main Menu</button>
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
