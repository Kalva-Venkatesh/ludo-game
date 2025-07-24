import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// --- IMPORTANT ---
// Placeholder images are used. Replace these with your actual image paths.
const pieceImages = {
    red: 'https://placehold.co/100x100/D32F2F/FFFFFF?text=R',
    green: 'https://placehold.co/100x100/388E3C/FFFFFF?text=G',
    yellow: 'https://placehold.co/100x100/FBC02D/000000?text=Y',
    blue: 'https://placehold.co/100x100/1976D2/FFFFFF?text=B',
};
const profileImage = 'https://placehold.co/60x60/FFFFFF/000000?text=P';

// --- CSS Styles ---
const LudoStyles = `
    .ludo-app-container {
        background-color: #0c1a3e;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        gap: 1rem;
        font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }
    .ludo-title {
        font-size: 3rem;
        font-weight: bold;
        letter-spacing: 0.05em;
        color: white;
    }
    .container_game {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 30px;
    }
    .control-1, .control-3 {
        display: flex;
        flex-direction: column;
        gap: 30px;
        width: 160px;
    }
    .dashboard {
        background: linear-gradient(145deg, #1e293b, #0f172a);
        border-radius: 12px;
        padding: 15px;
        text-align: center;
        color: white;
        border: 3px solid #475569;
        transition: all 0.3s ease;
    }
    .dashboard.active {
        border-color: #f59e0b;
        box-shadow: 0 0 20px #f59e0b;
    }
    .profile_pic {
        width: 60px; height: 60px;
        border-radius: 50%;
        border: 2px solid white;
        margin: 8px auto;
        object-fit: cover;
    }
    .de {
        width: 80px; height: 80px;
        background-color: white;
        border-radius: 10px;
        margin: 15px auto 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        font-weight: bold;
        color: #1f2937;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .de:hover { transform: scale(1.05); }
    .de.disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
    }

    .control-2 {
        width: 600px; height: 600px;
        position: relative;
    }
    .board-grid {
        width: 100%; height: 100%;
        display: grid;
        grid-template-columns: repeat(15, 1fr);
        grid-template-rows: repeat(15, 1fr);
    }
    .pieces-container {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
    }
    .col {
        box-sizing: border-box;
        border: 1px solid #999;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .blue { background-color: #1976D2; }
    .red { background-color: #D32F2F; }
    .green { background-color: #388E3C; }
    .yellow { background-color: #FBC02D; }
    .white-path { background-color: #fff; }
    
    .caracter {
        width: 32px; height: 32px;
        transition: all 0.4s ease-in-out;
        cursor: pointer;
        position: absolute;
        pointer-events: all;
        z-index: 10;
    }
    .abletomove {
        animation: pulse 1.5s infinite;
        border-radius: 50%;
        box-shadow: 0 0 15px 5px white;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    .star-symbol {
        position: absolute;
        font-size: 24px;
        color: rgba(0, 0, 0, 0.3);
        z-index: 0;
    }
    
    .winner-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        z-index: 50; display: flex; align-items: center; justify-content: center;
        background-color: rgba(0, 0, 0, 0.8);
    }
    .winner-box {
        padding: 2.5rem; text-align: center; background-color: #1f2937;
        border-radius: 0.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .winner-text { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
    .winner-text-red { color: #ef4444; }
    .winner-text-green { color: #22c55e; }
    .winner-text-yellow { color: #eab308; }
    .winner-text-blue { color: #3b82f6; }
    .new-game-button {
        padding: 0.75rem 1.5rem; margin-top: 1rem; font-size: 1.25rem; font-weight: bold;
        color: white; background-color: #16a34a; border-radius: 0.5rem;
        border: none; cursor: pointer;
    }
    .new-game-button:hover { background-color: #15803d; }
    .game-message {
        height: 2rem; font-size: 1.125rem; font-weight: 600;
        display: flex; align-items: center; justify-content: center;
        transition: color 0.3s;
        color: white;
    }
    .msg-bonus { color: #22c55e; }
    .msg-capture { color: #ef4444; }
    .msg-info { color: #eab308; }
`;

// --- Configuration Constants ---
const playerOrder = ['blue', 'red', 'green', 'yellow'];
const playerNames = { blue: 'Player 1', red: 'Player 2', green: 'Player 3', yellow: 'Player 4' };

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
// FIX: Corrected and complete list of all 8 safe spots by their cell ID.
const safeSpots = ['c-6-1', 'c-1-8', 'c-8-13', 'c-13-6', 'c-2-6', 'c-6-12', 'c-12-8', 'c-8-2'];

const Piece = React.memo(({ piece, isMovable, onPieceClick, positionStyle }) => (
    <img
        style={positionStyle}
        className={`caracter ${isMovable ? "abletomove" : ""}`}
        src={pieceImages[piece.color]}
        onClick={() => isMovable && onPieceClick(piece)}
        alt={`${piece.color} piece`}
    />
));

const Board = React.memo(({ pieces, movablePieces, onPieceClick, cellRefs }) => {
    return (
        <div className="control-2">
            <div className="board-grid">
                {Array.from({ length: 15 * 15 }).map((_, index) => {
                    const r = Math.floor(index / 15);
                    const c = index % 15;
                    const id = `c-${r}-${c}`;
                    
                    let className = 'col';
                    let isSafe = false;
                    if ((r < 6 && c < 6)) className += ' blue';
                    else if ((r < 6 && c > 8)) className += ' red';
                    else if ((r > 8 && c < 6)) className += ' yellow';
                    else if ((r > 8 && c > 8)) className += ' green';
                    else if (mainPathCoords.some(coord => coord[0] === r && coord[1] === c)) {
                        className += ' white-path';
                        if (safeSpots.includes(id)) isSafe = true;
                    } else if (homePathsCoords.blue.some(coord => coord[0] === r && coord[1] === c)) className += ' blue';
                    else if (homePathsCoords.red.some(coord => coord[0] === r && coord[1] === c)) className += ' red';
                    else if (homePathsCoords.green.some(coord => coord[0] === r && coord[1] === c)) className += ' green';
                    else if (homePathsCoords.yellow.some(coord => coord[0] === r && coord[1] === c)) className += ' yellow';

                    return (
                        <div key={id} id={id} ref={el => cellRefs.current[id] = el} className={className}>
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

const PlayerControl = React.memo(({ name, score, isCurrentPlayer, diceValue, onRoll, gameState }) => (
    <div className={`dashboard ${isCurrentPlayer ? 'active' : ''}`}>
        <div className="profile">
            {name} <br />
            <img src={profileImage} alt="profile" className="profile_pic" /> <br />
            Score: {score}%
        </div>
        <div className={`de ${!isCurrentPlayer || gameState !== 'roll' ? 'disabled' : ''}`} onClick={isCurrentPlayer && gameState === 'roll' ? onRoll : null}>
            {isCurrentPlayer ? (diceValue || '🎲') : ' '}
        </div>
    </div>
));

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
    const [scores, setScores] = useState({ blue: 0, red: 0, green: 0, yellow: 0 });

    const cellRefs = useRef({});
    const [cellPositions, setCellPositions] = useState({});

    useEffect(() => {
        const positions = {};
        for (const id in cellRefs.current) {
            if (cellRefs.current[id]) {
                positions[id] = {
                    left: cellRefs.current[id].offsetLeft,
                    top: cellRefs.current[id].offsetTop,
                };
            }
        }
        setCellPositions(positions);
    }, []);

    const getPiecePositionStyle = useCallback((piece) => {
        if (!Object.keys(cellPositions).length) return { opacity: 0 };
        
        let targetId;
        if (piece.state === 'base') {
            const color = piece.color;
            const pieceNum = parseInt(piece.id.split('-')[1]) - 1;
            targetId = baseSpotsMap[color][pieceNum];
        } else if (piece.state === 'active') {
            const absIndex = (startPositions[piece.color] + piece.pathIndex) % 52;
            const [r, c] = mainPathCoords[absIndex];
            targetId = `c-${r}-${c}`;
        } else { // home
            const [r, c] = homePathsCoords[piece.color][piece.homeIndex];
            targetId = `c-${r}-${c}`;
        }
        
        const pos = cellPositions[targetId] || { top: 0, left: 0 };
        return { top: `${pos.top + 4}px`, left: `${pos.left + 4}px` };
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
        setScores({ blue: 0, red: 0, green: 0, yellow: 0 });
        setGameMessage({ text: `${playerNames.blue}'s turn`, type: 'info' });
    }, []);
    
    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        setPieces(prevPieces => prevPieces.map(p => ({ ...p, style: getPiecePositionStyle(p) })));
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
            // FIX: Corrected logic for entering home path
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
        
        newPieces = newPieces.map(p => ({ ...p, style: getPiecePositionStyle(p) }));
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
                <h1 className="ludo-title">Ludo King</h1>
                <div className="container_game">
                    <div className="control-1">
                        <PlayerControl name={playerNames.blue} score={scores.blue} isCurrentPlayer={currentPlayerIndex === 0} diceValue={diceValue} onRoll={handleRoll} gameState={gameState} />
                        <PlayerControl name={playerNames.yellow} score={scores.yellow} isCurrentPlayer={currentPlayerIndex === 3} diceValue={diceValue} onRoll={handleRoll} gameState={gameState} />
                    </div>
                    <Board 
                        pieces={pieces} 
                        movablePieces={movablePieces} 
                        onPieceClick={handlePieceMove} 
                        cellRefs={cellRefs} 
                    />
                    <div className="control-3">
                        <PlayerControl name={playerNames.red} score={scores.red} isCurrentPlayer={currentPlayerIndex === 1} diceValue={diceValue} onRoll={handleRoll} gameState={gameState} />
                        <PlayerControl name={playerNames.green} score={scores.green} isCurrentPlayer={currentPlayerIndex === 2} diceValue={diceValue} onRoll={handleRoll} gameState={gameState} />
                    </div>
                </div>
                <div className={`game-message msg-${gameMessage.type}`}>{gameMessage.text}</div>
                <WinnerOverlay winner={winner} onNewGame={initializeGame} />
            </div>
        </>
    );
}
