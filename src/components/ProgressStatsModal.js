import React, { useState, useEffect } from 'react';
import { kanaCharacters } from '../kanaCharacters.js';

function ProgressStatsModal(props) {
    const [activeTab, setActiveTab] = useState('characters');
    const [userStats, setUserStats] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);

    useEffect(() => {
        // Load user stats from localStorage
        const stats = JSON.parse(localStorage.getItem('userStats')) || {};
        setUserStats(stats);
    }, [props.visible]);

    useEffect(() => {
        // Clear hovered item when switching tabs
        setHoveredItem(null);
    }, [activeTab]);

    // Calculate mastery level based on stats (0-100)
    const calculateMastery = (character) => {
        const stats = userStats[character];
        if (!stats) return null;

        const totalAttempts = stats.totalRightGuesses + stats.totalWrongGuesses;
        if (totalAttempts === 0) return null;

        // Calculate accuracy (0-1)
        const accuracy = stats.totalRightGuesses / totalAttempts;

        // Calculate average response time (lower is better, cap at 5 seconds)
        const avgResponseTime = stats.totaltotalResponseTime / stats.totalRightGuesses / 1000;
        const timeScore = Math.max(0, 1 - (avgResponseTime / 5));

        // Calculate help factor (less help is better)
        const helpFactor = Math.max(0, 1 - (stats.totalAskForHelpCounter / totalAttempts));

        // Calculate edit efficiency (fewer edits per correct answer is better)
        const avgEditsPerCorrect = stats.totalRightGuesses > 0 
            ? (stats.totalEditCount || 0) / stats.totalRightGuesses 
            : 0;
        const editEfficiency = Math.max(0, 1 - (avgEditsPerCorrect / 5)); // Cap at 5 edits

        // Calculate wrong submission penalty (fewer wrong submissions is better)
        const wrongSubmissionRate = (stats.totalWrongSubmissions || 0) / totalAttempts;
        const submissionAccuracy = Math.max(0, 1 - wrongSubmissionRate);

        // Calculate experience factor (more practice is better, cap at 20 attempts)
        const experienceFactor = Math.min(totalAttempts / 20, 1);

        // Weighted formula: accuracy (40%), time (15%), help (10%), edits (15%), submissions (10%), experience (10%)
        const mastery = (
            accuracy * 0.4 + 
            timeScore * 0.15 + 
            helpFactor * 0.1 + 
            editEfficiency * 0.15 + 
            submissionAccuracy * 0.1 + 
            experienceFactor * 0.1
        ) * 100;

        return Math.round(mastery);
    };

    // Get color based on mastery level
    const getMasteryColor = (mastery) => {
        if (mastery === null) return '#ffffff10'; // No data - very subtle
        if (mastery >= 80) return '#4ade80'; // Green - excellent
        if (mastery >= 60) return '#22d3ee'; // Cyan - good
        if (mastery >= 40) return '#fbbf24'; // Yellow - ok
        if (mastery >= 20) return '#fb923c'; // Orange - needs work
        return '#f87171'; // Red - struggling
    };

    // Get all characters from kanaCharacters
    const getAllCharacters = () => {
        const characters = [];

        ['hiragana', 'katakana'].forEach(type => {
            Object.keys(kanaCharacters[type]).forEach(groupKey => {
                const group = kanaCharacters[type][groupKey];
                Object.keys(group.characters).forEach(charKey => {
                    const char = group.characters[charKey];
                    characters.push({
                        character: char.jp_character,
                        romanji: char.romanji[0],
                        type: type
                    });
                });
            });
        });

        // Sort: characters with data first (by mastery), then characters without data
        return characters.sort((a, b) => {
            const masteryA = calculateMastery(a.character);
            const masteryB = calculateMastery(b.character);

            if (masteryA === null && masteryB === null) return 0;
            if (masteryA === null) return 1;
            if (masteryB === null) return -1;

            return masteryB - masteryA; // Higher mastery first
        });
    };

    // Get all words from kanaCharacters
    const getAllWords = () => {
        const words = [];

        Object.keys(kanaCharacters.words).forEach(wordKey => {
            const word = kanaCharacters.words[wordKey];
            words.push({
                character: word.jp_character,
                romanji: word.romanji[0],
                meaning: word.meaning
            });
        });

        // Sort: words with data first (by mastery), then words without data
        return words.sort((a, b) => {
            const masteryA = calculateMastery(a.character);
            const masteryB = calculateMastery(b.character);

            if (masteryA === null && masteryB === null) return 0;
            if (masteryA === null) return 1;
            if (masteryB === null) return -1;

            return masteryB - masteryA; // Higher mastery first
        });
    };

    // Format stats for tooltip
    const getStatsText = (character) => {
        const stats = userStats[character];
        if (!stats) {
            return 'No practice data yet';
        }

        const totalAttempts = stats.totalRightGuesses + stats.totalWrongGuesses;
        const accuracy = totalAttempts > 0 ? Math.round((stats.totalRightGuesses / totalAttempts) * 100) : 0;
        const avgResponseTime = stats.totalRightGuesses > 0
            ? (stats.totaltotalResponseTime / stats.totalRightGuesses / 1000).toFixed(2)
            : 0;
        const avgEditsPerCorrect = stats.totalRightGuesses > 0
            ? ((stats.totalEditCount || 0) / stats.totalRightGuesses).toFixed(1)
            : 0;

        let statsLines = [
            `Times Shown: ${stats.totalTimesShown || 'N/A'}`,
            `Correct: ${stats.totalRightGuesses} | Wrong: ${stats.totalWrongGuesses}`,
            `Accuracy: ${accuracy}%`,
            `Avg Time: ${avgResponseTime}s`,
        ];

        if (stats.totalEditCount > 0) {
            statsLines.push(`Edits: ${stats.totalEditCount} (avg ${avgEditsPerCorrect}/correct)`);
        }

        if (stats.totalWrongSubmissions > 0) {
            statsLines.push(`Wrong Submissions: ${stats.totalWrongSubmissions}`);
        }

        if (stats.totalAskForHelpCounter > 0) {
            statsLines.push(`Help Requested: ${stats.totalAskForHelpCounter} times`);
        }

        return statsLines.join('\n');
    };

    // Render character grid item
    const renderGridItem = (item, index) => {
        const mastery = calculateMastery(item.character);
        const color = getMasteryColor(mastery);

        return (
            <div
                key={`${activeTab}-${item.character}-${item.romanji}-${index}`}
                className="progress-stats-grid-item"
                style={{ backgroundColor: color }}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <div className="progress-stats-grid-item-character">
                    {item.character}
                </div>
                <div className="progress-stats-grid-item-romanji">
                    {item.romanji}
                </div>
                {mastery !== null && (
                    <div className="progress-stats-grid-item-mastery">
                        {mastery}%
                    </div>
                )}
            </div>
        );
    };

    // Render tooltip
    const renderTooltip = () => {
        if (!hoveredItem) return null;

        return (
            <div className="progress-stats-tooltip">
                <div className="progress-stats-tooltip-title">
                    {hoveredItem.character} ({hoveredItem.romanji})
                    {hoveredItem.meaning && <span className="progress-stats-tooltip-meaning"> - {hoveredItem.meaning}</span>}
                </div>
                <div className="progress-stats-tooltip-content">
                    {getStatsText(hoveredItem.character).split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>
            </div>
        );
    };

    // Get summary stats
    const getSummaryStats = () => {
        const items = activeTab === 'characters' ? getAllCharacters() : getAllWords();
        const withData = items.filter(item => calculateMastery(item.character) !== null);
        const withoutData = items.filter(item => calculateMastery(item.character) === null);

        const avgMastery = withData.length > 0
            ? Math.round(withData.reduce((sum, item) => sum + calculateMastery(item.character), 0) / withData.length)
            : 0;

        return {
            total: items.length,
            practiced: withData.length,
            notPracticed: withoutData.length,
            avgMastery: avgMastery
        };
    };

    if (!props.visible) {
        return null;
    }

    const items = activeTab === 'characters' ? getAllCharacters() : getAllWords();
    const summary = getSummaryStats();

    return (
        <div className='progress-stats-modal-background' onClick={props.onClose}>
            <div className='progress-stats-modal' onClick={(e) => e.stopPropagation()}>
                <div className='progress-stats-modal-header'>
                    <h2>Learning Progress</h2>
                    <button className='progress-stats-modal-close' onClick={props.onClose}>×</button>
                </div>

                <div className='progress-stats-modal-tabs'>
                    <button
                        className={`progress-stats-tab ${activeTab === 'characters' ? 'active' : ''}`}
                        onClick={() => setActiveTab('characters')}
                    >
                        Characters
                    </button>
                    <button
                        className={`progress-stats-tab ${activeTab === 'words' ? 'active' : ''}`}
                        onClick={() => setActiveTab('words')}
                    >
                        Words
                    </button>
                </div>

                <div className='progress-stats-summary'>
                    <div className='progress-stats-summary-item'>
                        <div className='progress-stats-summary-value'>{summary.practiced}/{summary.total}</div>
                        <div className='progress-stats-summary-label'>Practiced</div>
                    </div>
                    <div className='progress-stats-summary-item'>
                        <div className='progress-stats-summary-value'>{summary.avgMastery}%</div>
                        <div className='progress-stats-summary-label'>Avg Mastery</div>
                    </div>
                    <div className='progress-stats-summary-item'>
                        <div className='progress-stats-summary-value'>{summary.notPracticed}</div>
                        <div className='progress-stats-summary-label'>Not Practiced</div>
                    </div>
                </div>

                <div className='progress-stats-legend'>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#4ade80'}}></div>
                        <span>80-100% Excellent</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#22d3ee'}}></div>
                        <span>60-79% Good</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#fbbf24'}}></div>
                        <span>40-59% OK</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#fb923c'}}></div>
                        <span>20-39% Needs Work</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#f87171'}}></div>
                        <span>0-19% Struggling</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#ffffff10'}}></div>
                        <span>No Data</span>
                    </div>
                </div>

                <div className='progress-stats-grid-container'>
                    <div className='progress-stats-grid' key={activeTab}>
                        {items.map((item, index) => renderGridItem(item, index))}
                    </div>
                </div>

                {renderTooltip()}
            </div>
        </div>
    );
}

export default ProgressStatsModal;
