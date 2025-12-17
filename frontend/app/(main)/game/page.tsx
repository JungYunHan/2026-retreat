'use client';

import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface Card {
  suit: string;
  rank: string;
}

interface Player {
  name: string;
  words: string[];
}

interface GameState {
  gameId: string;
  players: Player[];
  phase: string;
  currentPlayerIndex: number;
  remainingWords: number;
  currentWord: string | null;
  guessAttempts: number;
  gameOver: boolean;
  mixedWords: string[];
}

export default function GamePage() {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoinedGame, setHasJoinedGame] = useState(false);

  useEffect(() => {
    const tabId = Math.random().toString(36).substr(2, 9);
    console.log(`🚀 [탭 ${tabId}] 게임 페이지 로드`);

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log(`🟢 [탭 ${tabId}] WebSocket 연결 성공`);
        setIsConnected(true);

        // 게임 상태 구독
        client.subscribe('/topic/game', (message) => {
          const newGameState: GameState = JSON.parse(message.body);
          console.log(`📨 [탭 ${tabId}] 게임 상태 수신:`, {
            gameId: newGameState.gameId,
            phase: newGameState.phase,
            players: newGameState.players.map(p => `${p.name}(${p.words.length}단어)`),
            currentPlayer: newGameState.players[newGameState.currentPlayerIndex]?.name,
            remainingWords: newGameState.remainingWords,
            currentWord: newGameState.currentWord,
            guessAttempts: newGameState.guessAttempts,
            gameOver: newGameState.gameOver
          });
          setGameState(newGameState);
        });
      },
      onDisconnect: () => {
        console.log(`🔴 [탭 ${tabId}] WebSocket 연결 끊어짐`);
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error(`❌ [탭 ${tabId}] STOMP 에러:`, frame.headers['message'], frame.body);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      console.log(`🗑️ [탭 ${tabId}] 컴포넌트 언마운트`);
      client.deactivate();
    };
  }, []);

  const startGame = () => {
    if (stompClient && stompClient.connected && playerName.trim() && gameId.trim()) {
      console.log(`🎮 [${playerName}] 게임 시작 요청: gameId=${gameId}, playerName=${playerName}`);
      console.log(`🔍 현재 연결 상태:`, {
        connected: stompClient.connected,
        sessionId: (stompClient as any).sessionId || 'unknown',
        url: 'ws://localhost:8080/ws'
      });
      setHasJoinedGame(true); // 게임 참여 상태 설정
      stompClient.publish({
        destination: '/app/game/start',
        body: JSON.stringify({
          gameId: gameId,
          playerName: playerName
        }),
      });
    } else {
      console.log(`❌ [${playerName}] 게임 시작 실패:`, {
        stompClient: !!stompClient,
        connected: stompClient?.connected,
        playerName: playerName.trim(),
        gameId: gameId.trim()
      });
    }
  };

  const submitWords = (words: string[]) => {
    if (stompClient && stompClient.connected && gameState) {
      stompClient.publish({
        destination: '/app/game/submitWords',
        body: JSON.stringify({
          gameId: gameState.gameId,
          playerName: playerName,
          words: words
        }),
      });
    }
  };

  const startMixing = () => {
    if (stompClient && stompClient.connected && gameState) {
      stompClient.publish({
        destination: '/app/game/startMixing',
        body: JSON.stringify({
          gameId: gameState.gameId,
          playerName: playerName
        }),
      });
    }
  };

  const selectWord = (selectedWord: string) => {
    if (stompClient && stompClient.connected && gameState) {
      stompClient.publish({
        destination: '/app/game/selectWord',
        body: JSON.stringify({
          gameId: gameState.gameId,
          playerName: playerName,
          selectedWord: selectedWord
        }),
      });
    }
  };

  const drawWord = () => {
    if (stompClient && stompClient.connected && gameState) {
      stompClient.publish({
        destination: '/app/game/drawWord',
        body: JSON.stringify({
          gameId: gameState.gameId,
          playerName: playerName
        }),
      });
    }
  };

  const guess = (guessedPlayer: string) => {
    if (stompClient && stompClient.connected && gameState) {
      stompClient.publish({
        destination: '/app/game/guess',
        body: JSON.stringify({
          gameId: gameState.gameId,
          playerName: playerName,
          guessedPlayer: guessedPlayer
        }),
      });
    }
  };

  const calculateScore = (cards: Card[]): number => {
    let score = 0;
    let aceCount = 0;

    for (const card of cards) {
      if (card.rank === 'A') {
        aceCount++;
        score += 11;
      } else if (['K', 'Q', 'J'].includes(card.rank)) {
        score += 10;
      } else {
        score += parseInt(card.rank);
      }
    }

    // 에이스 처리 (21점을 넘지 않도록)
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }

    return score;
  };

  const getCardDisplay = (card: Card, isHidden: boolean = false) => {
    if (isHidden) {
      return '🂠';
    }

    const suitSymbols: { [key: string]: string } = {
      '♠': '♠',
      '♥': '♥',
      '♦': '♦',
      '♣': '♣'
    };

    return card.rank + suitSymbols[card.suit];
  };

  const getWinnerMessage = (winner: string | null) => {
    if (!winner) return '';

    if (winner === 'Draw') {
      return '무승부! 🤝';
    }

    if (winner === 'Dealer') {
      return '딜러 승리! 딜러가 이겼습니다. 😢';
    }

    // 여러 승자가 있을 수 있음
    const winners = winner.split(' ').filter(w => w !== 'Draw');
    const isCurrentPlayerWinner = winners.includes(playerName);

    if (isCurrentPlayerWinner) {
      if (winners.length === 1) {
        return '승리! 🎉';
      } else {
        return `공동 승리! (${winners.join(', ')}) 🎉`;
      }
    } else {
      return `패배! 승자: ${winners.join(', ')} 😢`;
    }
  };

  return (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          셀장 사탕 게임 🍬
        </h1>

        {/* 연결 상태 표시 */}
        <div className="mb-6 text-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? '🟢 서버 연결됨' : '🔴 서버 연결 끊어짐'}
          </span>
        </div>

        {/* 게임 설정 */}
        {!hasJoinedGame && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">게임 시작</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플레이어 이름
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  게임 ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="같은 게임 ID를 입력하세요 (예: testgame)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 같은 게임에 참여하려면 동일한 게임 ID를 입력하세요
                </p>
              </div>
              <button
                onClick={startGame}
                disabled={!isConnected || !playerName.trim() || !gameId.trim()}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-lg font-semibold"
              >
                게임 시작 🎮
              </button>
            </div>
          </div>
        )}

        {/* 게임 진행 */}
        {hasJoinedGame && gameState && (
          <div className="space-y-6">
            {/* 플레이어 목록 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">참여 플레이어</h2>
              <div className="flex flex-wrap gap-2">
                {gameState.players.map((player, index) => (
                  <span
                    key={player.name}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      player.name === playerName
                        ? 'bg-blue-100 text-blue-800'
                        : index === gameState.currentPlayerIndex && gameState.phase === 'GUESSING'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {player.name} {player.name === playerName ? '(나)' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* 게임 단계별 UI */}
            {gameState.phase === 'WRITING_WORDS' && (
              <WordWritingPhase
                gameState={gameState}
                playerName={playerName}
                onSubmitWords={submitWords}
                onStartMixing={startMixing}
              />
            )}

            {gameState.phase === 'GUESSING' && (
              <GuessingPhase
                gameState={gameState}
                playerName={playerName}
                onDrawWord={drawWord}
                onGuess={guess}
                onSelectWord={selectWord}
              />
            )}

            {gameState.gameOver && (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <h3 className="text-3xl font-bold mb-4 text-gray-800">
                  게임 종료! 🎉
                </h3>
                <p className="text-xl text-gray-600">
                  모든 단어를 추측했습니다!
                </p>
              </div>
            )}
          </div>
        )}

        {/* 게임 규칙 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">셀장 사탕 게임 규칙 📚</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold mb-2">기본 규칙:</h4>
              <ul className="space-y-1">
                <li>• 각 플레이어는 자신을 설명하는 5개의 단어를 씀</li>
                <li>• 모든 단어를 한 곳에 모아 섞음</li>
                <li>• 차례대로 단어를 뽑아 누가 썼는지 맞춤</li>
                <li>• 맞추면 사탕을 받고, 틀리면 사탕을 줌</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">게임 진행:</h4>
              <ul className="space-y-1">
                <li>• 단어 작성 단계: 각자 5개 단어 입력</li>
                <li>• 섞기 단계: 모든 단어 무작위로 섞음</li>
                <li>• 추측 단계: 차례대로 단어 뽑아 저자 맞추기</li>
                <li>• 추측 기회: 각 단어마다 3번의 추측 기회</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WordWritingPhaseProps {
  gameState: GameState;
  playerName: string;
  onSubmitWords: (words: string[]) => void;
  onStartMixing: () => void;
}

function WordWritingPhase({ gameState, playerName, onSubmitWords, onStartMixing }: WordWritingPhaseProps) {
  const [words, setWords] = useState<string[]>(['', '', '', '', '']);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleSubmit = () => {
    if (words.every(word => word.trim())) {
      onSubmitWords(words.map(word => word.trim()));
    }
  };

  const currentPlayer = gameState.players.find(p => p.name === playerName);
  const hasSubmitted = currentPlayer && currentPlayer.words.length === 5;
  const allSubmitted = gameState.players.every(p => p.words.length === 5);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">단어 작성 단계 📝</h2>
      <p className="text-gray-600 mb-6">
        자신을 표현하는 5개의 단어를 작성해주세요.
      </p>

      {!hasSubmitted ? (
        <div className="space-y-4">
          {words.map((word, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                단어 {index + 1}
              </label>
              <input
                type="text"
                value={word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`단어 ${index + 1}을 입력하세요`}
              />
            </div>
          ))}
          <button
            onClick={handleSubmit}
            disabled={!words.every(word => word.trim())}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-lg font-semibold"
          >
            단어 제출 ✅
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg text-green-600 mb-4">
            ✅ 단어를 제출했습니다! 다른 플레이어를 기다리고 있습니다...
          </p>
          <div className="space-y-2">
            {words.map((word, index) => (
              <div key={index} className="text-gray-700">
                {index + 1}. {word}
              </div>
            ))}
          </div>
        </div>
      )}

      {allSubmitted && (
        <div className="mt-6 text-center">
          <button
            onClick={onStartMixing}
            className="px-8 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-semibold"
          >
            단어 믹싱 시작 🔄
          </button>
        </div>
      )}
    </div>
  );
}

interface GuessingPhaseProps {
  gameState: GameState;
  playerName: string;
  onDrawWord: () => void;
  onGuess: (guessedPlayer: string) => void;
  onSelectWord: (selectedWord: string) => void;
}

function GuessingPhase({ gameState, playerName, onDrawWord, onGuess, onSelectWord }: GuessingPhaseProps) {
  const [selectedGuess, setSelectedGuess] = useState<string>('');

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer && currentPlayer.name === playerName;

  const handleGuess = () => {
    if (selectedGuess) {
      onGuess(selectedGuess);
      setSelectedGuess('');
    }
  };

  const handleWordSelect = (word: string) => {
    if (isMyTurn && !gameState.currentWord) {
      onSelectWord(word);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">추측 단계 🤔</h2>

      {!gameState.currentWord ? (
        <div className="text-center">
          {isMyTurn ? (
            <div>
              <p className="text-lg text-gray-600 mb-4">
                당신의 차례입니다! 단어를 선택하세요.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {gameState.mixedWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleWordSelect(word)}
                    className="group relative p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 rounded-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl text-white text-xl font-bold backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <span className="text-center leading-tight drop-shadow-lg">
                        {word}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-lg text-gray-600">
              {currentPlayer?.name}님이 단어를 선택하고 있습니다...
            </p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              "{gameState.currentWord}"
            </h3>
            <p className="text-gray-600">
              이 단어를 누가 썼을까요? (남은 기회: {gameState.guessAttempts})
            </p>
          </div>

          {isMyTurn ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추측할 플레이어 선택
                </label>
                <select
                  value={selectedGuess}
                  onChange={(e) => setSelectedGuess(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">플레이어를 선택하세요</option>
                  {gameState.players
                    .filter(player => player.name !== playerName) // 자신 제외
                    .map(player => (
                    <option key={player.name} value={player.name}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGuess}
                disabled={!selectedGuess}
                className="px-8 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-lg font-semibold"
              >
                추측하기 🎯
              </button>
            </div>
          ) : (
            <p className="text-lg text-gray-600">
              {currentPlayer?.name}님이 추측하고 있습니다...
            </p>
          )}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        남은 단어: {gameState.remainingWords}개
      </div>
    </div>
  );
}