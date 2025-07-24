import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// --- CSS Styles ---
const LudoStyles = `
    .ludo-app-container {
        background-color: #0c1a3e;
        min-height: 100vh;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        gap: 1rem;
        font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }
    .ludo-title {
        font-size: 2.5rem;
        font-weight: bold;
        letter-spacing: 0.05em;
        color: white;
        text-align: center;
        margin-bottom: 0.5rem;
    }
    .game-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        width: 100%;
        max-width: 100%;
    }
    .player-status-bar {
        display: flex;
        justify-content: space-around;
        width: 100%;
        max-width: 600px;
        padding: 0.5rem;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 10px;
    }
    .player-status {
        color: #9ca3af;
        font-weight: bold;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        text-align: center;
    }
    .player-status.active {
        color: white;
        background-color: #f59e0b;
        box-shadow: 0 0 15px #f59e0b;
    }
    .player-status-piece {
        font-size: 1.2rem;
    }

    .board-container {
        width: 90vw;
        height: 90vw;
        max-width: 500px;
        max-height: 500px;
        position: relative;
        background: #e0d8c4;
        border: 12px solid #8b7d5e;
        border-radius: 4px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.3), 
                    inset 0 0 30px rgba(0,0,0,0.1);
    }
    .board-grid {
        width: 100%; 
        height: 100%;
        display: grid;
        grid-template-columns: repeat(15, 1fr);
        grid-template-rows: repeat(15, 1fr);
        background-color: white;
        position: relative;
    }
    .pieces-container {
        position: absolute;
        top: 0; 
        left: 0;
        width: 100%; 
        height: 100%;
        pointer-events: none;
    }
    .col {
        box-sizing: border-box;
        border: 1px solid rgba(221, 221, 221, 0.5);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .base-area {
        grid-column: span 6;
        grid-row: span 6;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    .base-piece-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 15%;
        width: 80%;
        height: 80%;
        position: relative;
    }
    .base-piece-spot {
        border-radius: 50%;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2vw;
        max-font-size: 24px;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
        position: relative;
    }
    .base-area-blue { background-color: #0077c8; }
    .base-area-red { background-color: #e53935; }
    .base-area-yellow { background-color: #fdd835; }
    .base-area-green { background-color: #43a047; }

    .blue-path { background-color: #0077c8; }
    .red-path { background-color: #e53935; }
    .green-path { background-color: #43a047; }
    .yellow-path { background-color: #fdd835; }
    .white-path { 
        background-color: #fff;
        border: 1px solid rgba(0,0,0,0.1);
    }
    
    .center-triangle {
        grid-area: 7 / 7 / 10 / 10;
        background: 
            conic-gradient(
                from 0deg at 50% 50%,
                #0077c8 0% 25%,
                #e53935 25% 50%,
                #fdd835 50% 75%,
                #43a047 75% 100%
            );
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        border: none;
    }
    
    .piece {
        width: 5.5vw; 
        height: 5.5vw;
        max-width: 25px; 
        max-height: 25px;
        border-radius: 50%;
        border: 2px solid rgba(0, 0, 0, 0.5);
        box-shadow: inset 0 -3px 4px rgba(0,0,0,0.3),
                    0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.4s ease-in-out;
        cursor: pointer;
        position: absolute;
        pointer-events: all;
        z-index: 10;
    }
    .piece-blue { background-color: #3b82f6; }
    .piece-red { background-color: #ef4444; }
    .piece-green { background-color: #22c55e; }
    .piece-yellow { background-color: #eab308; }

    .abletomove {
        animation: pulse 1.5s infinite;
        box-shadow: 0 0 15px 5px white, 
                   inset 0 -3px 4px rgba(0,0,0,0.3),
                   0 2px 4px rgba(0,0,0,0.2);
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1) var(--transform-translate, ''); }
        50% { transform: scale(1.1) var(--transform-translate, ''); }
    }
    .star-symbol {
        position: absolute;
        font-size: 3vw;
        max-font-size: 24px;
        color: rgba(0, 0, 0, 0.5);
        z-index: 0;
    }
    
    .arrow-up::after { transform: rotate(-90deg); }
    .arrow-down::after { transform: rotate(90deg); }
    .arrow-left::after { transform: rotate(180deg); }
    
    .winner-overlay {
        position: fixed; 
        top: 0; 
        left: 0; 
        right: 0; 
        bottom: 0;
        z-index: 50; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.8);
    }
    .winner-box {
        padding: 2.5rem; 
        text-align: center; 
        background-color: #1f2937;
        border-radius: 0.5rem; 
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .winner-text { 
        font-size: 2.5rem; 
        font-weight: bold; 
        margin-bottom: 1rem; 
    }
    .winner-text-red { color: #ef4444; }
    .winner-text-green { color: #22c55e; }
    .winner-text-yellow { color: #eab308; }
    .winner-text-blue { color: #3b82f6; }
    .new-game-button {
        padding: 0.75rem 1.5rem; 
        margin-top: 1rem; 
        font-size: 1.25rem; 
        font-weight: bold;
        color: white; 
        background-color: #16a34a; 
        border-radius: 0.5rem;
        border: none; 
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .new-game-button:hover { background-color: #15803d; }
    .game-message {
        height: 2rem; 
        font-size: 1.125rem; 
        font-weight: 600;
        display: flex; 
        align-items: center; 
        justify-content: center;
        transition: color 0.3s;
        color: white;
        text-align: center;
        min-height: 2.5rem;
    }
    .msg-bonus { color: #22c55e; }
    .msg-capture { color: #ef4444; }
    .msg-info { color: #eab308; }
    .controls-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 0.5rem;
    }
    .single-dice {
        width: 80px; 
        height: 80px;
        background-color: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        font-weight: bold;
        color: #1f2937;
        cursor: pointer;
        transition: all 0.2s;
        border: 3px solid #475569;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .single-dice.active-roll {
        border-color: #f59e0b;
        box-shadow: 0 0 20px #f59e0b;
        transform: scale(1.05);
    }
    .single-dice.disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
        opacity: 0.7;
    }

    @media (max-width: 500px) {
        .ludo-title {
            font-size: 2rem;
        }
        .board-container {
            width: 95vw;
            height: 95vw;
            border-width: 8px;
        }
        .piece {
            width: 6.5vw;
            height: 6.5vw;
        }
        .player-status {
            padding: 0.5rem;
            font-size: 0.9rem;
        }
    }
`;

// --- Configuration Constants ---
const playerOrder = ['blue', 'red', 'green', 'yellow'];
const playerNames = { blue: 'Player 1', red: 'Player 2', green: 'Player 3', yellow: 'Player 4' };
const playerEmojis = { blue: '', red: '', green: '', yellow: '' };

const mainPathCoords = [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0]
];

const homePathsCoords = {
    blue: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
    red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
    green: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
    yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

const baseSpotsMap = {
    blue: ['c-2-2', 'c-2-3', 'c-3-2', 'c-3-3'],
    red: ['c-2-11', 'c-2-12', 'c-3-11', 'c-3-12'],
    green: ['c-11-11', 'c-11-12', 'c-12-11', 'c-12-12'],
    yellow: ['c-11-2', 'c-11-3', 'c-12-2', 'c-12-3'],
};

const startPositions = { blue: 0, red: 13, green: 26, yellow: 39 };
const safeSpots = ['c-6-1', 'c-1-8', 'c-8-13', 'c-13-6', 'c-2-6', 'c-6-12', 'c-12-8', 'c-8-2'];
const arrowSpots = {'c-6-5': 'arrow-up', 'c-0-8': 'arrow', 'c-8-13': 'arrow-down', 'c-14-6': 'arrow-left'};

const Piece = React.memo(({ piece, isMovable, onPieceClick, positionStyle }) => (
    <div
        style={positionStyle}
        className={`piece piece-${piece.color} ${isMovable ? "abletomove" : ""}`}
        onClick={() => isMovable && onPieceClick(piece)}
    />
));

const BaseArea = React.memo(({ color, cellRefs }) => (
    <div className={`base-area base-area-${color}`}>
        <div className="base-piece-container">
            {baseSpotsMap[color].map((id, index) => (
                <div 
                    key={id} 
                    ref={el => cellRefs.current[id] = el} 
                    className="base-piece-spot"
                    style={{ backgroundColor: color === 'yellow' ? '#fef3c7' : `${color}20` }}
                >
                    {playerEmojis[color]}
                </div>
            ))}
        </div>
    </div>
));

const Board = React.memo(({ pieces, movablePieces, onPieceClick, cellRefs, boardRef }) => {
    return (
        <div className="board-container" ref={boardRef}>
            <div className="board-grid">
                {Array.from({ length: 15 * 15 }).map((_, index) => {
                    const r = Math.floor(index / 15);
                    const c = index % 15;
                    const id = `c-${r}-${c}`;
                    
                    let className = 'col';
                    let isSafe = false;
                    let arrowClass = '';

                    if (mainPathCoords.some(coord => coord[0] === r && coord[1] === c)) {
                        className += ' white-path';
                        if (safeSpots.includes(id)) isSafe = true;
                        if(arrowSpots[id]) arrowClass = arrowSpots[id];
                    } else if (homePathsCoords.blue.some(coord => coord[0] === r && coord[1] === c)) className += ' blue-path';
                    else if (homePathsCoords.red.some(coord => coord[0] === r && coord[1] === c)) className += ' red-path';
                    else if (homePathsCoords.green.some(coord => coord[0] === r && coord[1] === c)) className += ' green-path';
                    else if (homePathsCoords.yellow.some(coord => coord[0] === r && coord[1] === c)) className += ' yellow-path';

                    if (r === 0 && c === 0) return <BaseArea key="base-blue" color="blue" cellRefs={cellRefs} />;
                    if (r === 0 && c === 9) return <BaseArea key="base-red" color="red" cellRefs={cellRefs} />;
                    if (r === 9 && c === 0) return <BaseArea key="base-yellow" color="yellow" cellRefs={cellRefs} />;
                    if (r === 9 && c === 9) return <BaseArea key="base-green" color="green" cellRefs={cellRefs} />;
                    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return <div key={id} className='center-triangle' />;

                    if ((r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8)) return null;

                    return (
                        <div key={id} id={id} ref={el => cellRefs.current[id] = el} className={`${className} ${arrowClass}`}>
                            {isSafe && <span className="star-symbol">★</span>}
                        </div>
                    );
                })}
            </div>
            <div className="pieces-container">
                {pieces.map(p => <Piece key={p.id} piece={p} isMovable={movablePieces.some(mp => mp.id === p.id)} onPieceClick={onPieceClick} positionStyle={p.style} />)}
            </div>
        </div>
    );
});

const PlayerStatusBar = React.memo(({ currentPlayerIndex }) => (
    <div className="player-status-bar">
        {playerOrder.map((color, index) => (
            <div key={color} className={`player-status ${currentPlayerIndex === index ? 'active' : ''}`}>
                <div className="player-status-piece">{playerNames[color]}</div>
            </div>
        ))}
    </div>
));

const Controls = React.memo(({ onRoll, diceValue, gameState }) => {
    const isDiceDisabled = gameState !== 'roll';
    const diceClassName = `single-dice ${isDiceDisabled ? 'disabled' : 'active-roll'}`;
    const handleDiceClick = isDiceDisabled ? null : onRoll;

    return (
        <div className="controls-container">
            <div className={diceClassName} onClick={handleDiceClick}>
                {diceValue || '🎲'}
            </div>
        </div>
    );
});

const WinnerOverlay = ({ winner, onNewGame }) => {
    if (!winner) return null;
    const colorClass = `winner-text-${winner}`;
    return (
        <div className="winner-overlay">
            <div className="winner-box">
                <h2 className={`winner-text ${colorClass}`}>{playerNames[winner].toUpperCase()} WINS!</h2>
                <button onClick={onNewGame} className="new-game-button">New Game</button>
            </div>
        </div>
    );
};

export default function App() {
    const [gameState, setGameState] = useState('roll');
    const [pieces, setPieces] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [movablePieces, setMovablePieces] = useState([]);
    const [gameMessage, setGameMessage] = useState({ text: '', type: 'info' });
    const [winner, setWinner] = useState(null);
    const [consecutiveSixes, setConsecutiveSixes] = useState(0);

    const cellRefs = useRef({});
    const boardRef = useRef(null);
    const [cellPositions, setCellPositions] = useState({});

    useEffect(() => {
        const calculatePositions = () => {
            if (!boardRef.current) return;
            
            const boardRect = boardRef.current.getBoundingClientRect();
            const positions = {};
            
            for (const id in cellRefs.current) {
                if (cellRefs.current[id]) {
                    const rect = cellRefs.current[id].getBoundingClientRect();
                    positions[id] = {
                        left: rect.left - boardRect.left + rect.width / 2,
                        top: rect.top - boardRect.top + rect.height / 2,
                        width: rect.width,
                        height: rect.height
                    };
                }
            }
            setCellPositions(positions);
        };
        
        calculatePositions();
        window.addEventListener('resize', calculatePositions);
        return () => window.removeEventListener('resize', calculatePositions);
    }, []);

    const getPiecePositionStyle = useCallback((piece, allPieces) => {
        if (!Object.keys(cellPositions).length) return { opacity: 0 };
        
        let targetId;
        let onPath = false;
        
        if (piece.state === 'base') {
            const pieceNum = parseInt(piece.id.split('-')[1]) - 1;
            targetId = baseSpotsMap[piece.color][pieceNum];
        } else if (piece.state === 'active') {
            const absIndex = (startPositions[piece.color] + piece.pathIndex) % 52;
            const [r, c] = mainPathCoords[absIndex];
            targetId = `c-${r}-${c}`;
            onPath = true;
        } else { // home
            const [r, c] = homePathsCoords[piece.color][piece.homeIndex];
            targetId = `c-${r}-${c}`;
            onPath = true;
        }
        
        const pos = cellPositions[targetId] || { top: 0, left: 0, width: 40, height: 40 };
        const pieceWidth = Math.min(pos.width, pos.height) * 0.7;
        let transformValue = '';

        if (onPath) {
            const piecesOnSameSpot = allPieces.filter(p => {
                if (p.state !== 'active' && p.state !== 'home') return false;
                let pTargetId;
                if (p.state === 'active') {
                    const pAbsIndex = (startPositions[p.color] + p.pathIndex) % 52;
                    const [pr, pc] = mainPathCoords[pAbsIndex];
                    pTargetId = `c-${pr}-${pc}`;
                } else {
                    const [pr, pc] = homePathsCoords[p.color][p.homeIndex];
                    pTargetId = `c-${pr}-${pc}`;
                }
                return pTargetId === targetId;
            });

            const totalOnSpot = piecesOnSameSpot.length;
            const pieceIndexOnSpot = piecesOnSameSpot.findIndex(p => p.id === piece.id);

            if (totalOnSpot > 1) {
                const angle = (pieceIndexOnSpot / totalOnSpot) * 2 * Math.PI;
                const radius = pieceWidth / 2;
                const xOffset = Math.cos(angle) * radius;
                const yOffset = Math.sin(angle) * radius;
                transformValue = `translate(${xOffset}px, ${yOffset}px)`;
            }
        }
        
        return { 
            top: `${pos.top}px`, 
            left: `${pos.left}px`, 
            width: `${pieceWidth}px`, 
            height: `${pieceWidth}px`, 
            transform: `translate(-50%, -50%) ${transformValue}`,
            '--transform-translate': transformValue
        };
    }, [cellPositions]);

    const initializeGame = useCallback(() => {
        const initialPieces = [];
        playerOrder.forEach(color => {
            for (let i = 0; i < 4; i++) {
                initialPieces.push({ id: `${color}-${i + 1}`, color, state: 'base', pathIndex: -1, homeIndex: -1 });
            }
        });
        setPieces(initialPieces);
        setCurrentPlayerIndex(0);
        setDiceValue(null);
        setGameState('roll');
        setMovablePieces([]);
        setWinner(null);
        setGameMessage({ text: `${playerNames.blue}'s turn`, type: 'info' });
    }, []);
    
    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        setPieces(prevPieces => prevPieces.map(p => ({ ...p, style: getPiecePositionStyle(p, prevPieces) })));
    }, [pieces.length, cellPositions, getPiecePositionStyle]);

    const switchPlayer = useCallback((lastRoll) => {
        if (lastRoll === 6 && consecutiveSixes < 3) {
            setGameState('roll');
            setGameMessage({ text: `Rolled a 6, roll again!`, type: 'bonus' });
        } else {
            const nextPlayerIndex = (currentPlayerIndex + 1) % playerOrder.length;
            setCurrentPlayerIndex(nextPlayerIndex);
            setGameState('roll');
            setGameMessage({ text: `${playerNames[playerOrder[nextPlayerIndex]]}'s turn`, type: 'info' });
        }
        setDiceValue(null);
        setMovablePieces([]);
        if (lastRoll !== 6) setConsecutiveSixes(0);
    }, [currentPlayerIndex, consecutiveSixes]);

    const handleRoll = useCallback(() => {
        if (gameState !== 'roll') return;
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(roll);
        const sixes = roll === 6 ? consecutiveSixes + 1 : 0;
        setConsecutiveSixes(sixes);

        if (sixes === 3) {
            setGameMessage({ text: '3 sixes! Turn forfeited.', type: 'capture' });
            setTimeout(() => switchPlayer(roll), 1500);
            return;
        }

        const currentPlayerColor = playerOrder[currentPlayerIndex];
        const possibleMoves = pieces.filter(p => {
            if (p.color !== currentPlayerColor || p.state === 'home') return false;
            if (p.state === 'base') return roll === 6;
            const newPathIndex = p.pathIndex + roll;
            if (newPathIndex > 50) {
                const newHomeIndex = newPathIndex - 51;
                return newHomeIndex < 6;
            }
            return true;
        });

        if (possibleMoves.length === 0) {
            setGameMessage({ text: `Rolled ${roll}, no moves.`, type: 'info' });
            setTimeout(() => switchPlayer(roll), 1500);
        } else {
            setGameState('move');
            setMovablePieces(possibleMoves);
            setGameMessage({ text: 'Select a piece to move.', type: 'info' });
        }
    }, [gameState, consecutiveSixes, currentPlayerIndex, pieces, switchPlayer]);
    
    const handlePieceMove = useCallback((piece) => {
        let newPieces = [...pieces];
        const pieceIndex = newPieces.findIndex(p => p.id === piece.id);
        let movedPiece = { ...newPieces[pieceIndex] };
        let capturedAPiece = false;
        let pieceReachedHome = false;

        if (movedPiece.state === 'base') {
            movedPiece.state = 'active';
            movedPiece.pathIndex = 0;
        } else {
            const newPathIndex = movedPiece.pathIndex + diceValue;
            if (newPathIndex > 50) {
                movedPiece.state = 'home';
                movedPiece.homeIndex = newPathIndex - 51;
                pieceReachedHome = true;
            } else {
                movedPiece.pathIndex = newPathIndex;
            }
        }
        
        newPieces[pieceIndex] = movedPiece;

        if (movedPiece.state === 'active') {
            const movedAbsIndex = (startPositions[movedPiece.color] + movedPiece.pathIndex) % 52;
            const [r, c] = mainPathCoords[movedAbsIndex];
            const movedPathId = `c-${r}-${c}`;
            if (!safeSpots.includes(movedPathId)) {
                newPieces = newPieces.map(p => {
                    if (p.id !== movedPiece.id && p.color !== movedPiece.color && p.state === 'active') {
                        const pAbsIndex = (startPositions[p.color] + p.pathIndex) % 52;
                        if (pAbsIndex === movedAbsIndex) {
                            capturedAPiece = true;
                            return { ...p, state: 'base', pathIndex: -1, homeIndex: -1 };
                        }
                    }
                    return p;
                });
            }
        }
        
        newPieces = newPieces.map(p => ({ ...p, style: getPiecePositionStyle(p, newPieces) }));
        setPieces(newPieces);
        
        setTimeout(() => {
            const homeCount = newPieces.filter(p => p.color === movedPiece.color && p.state === 'home').length;
            if (homeCount === 4) {
                setWinner(movedPiece.color);
                setGameState('over');
                setGameMessage({ text: `${movedPiece.color.toUpperCase()} wins!`, type: 'bonus' });
                return;
            }

            if (diceValue === 6 || capturedAPiece || pieceReachedHome) {
                setGameState('roll');
                setGameMessage({ text: capturedAPiece ? 'Captured a piece!' : 'Bonus turn!', type: capturedAPiece ? 'capture' : 'bonus' });
                setMovablePieces([]);
                setDiceValue(null);
            } else {
                switchPlayer();
            }
        }, 400);
    }, [diceValue, pieces, getPiecePositionStyle, switchPlayer]);

    return (
        <>
            <style>{LudoStyles}</style>
            <div className="ludo-app-container">
                <h1 className="ludo-title">Ludo Game</h1>
                <div className="game-wrapper">
                    <PlayerStatusBar currentPlayerIndex={currentPlayerIndex} />
                    <Board 
                        pieces={pieces} 
                        movablePieces={movablePieces} 
                        onPieceClick={handlePieceMove} 
                        cellRefs={cellRefs} 
                        boardRef={boardRef}
                    />
                    <Controls onRoll={handleRoll} diceValue={diceValue} gameState={gameState} />
                </div>
                <div className={`game-message msg-${gameMessage.type}`}>{gameMessage.text}</div>
                <WinnerOverlay winner={winner} onNewGame={initializeGame} />
            </div>
        </>
    );
}
