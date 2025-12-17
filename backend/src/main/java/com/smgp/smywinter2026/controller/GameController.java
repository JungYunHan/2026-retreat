package com.smgp.smywinter2026.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

import java.util.*;

@Controller
public class GameController {

    // 게임 상태 저장 (실제로는 DB나 Redis 사용 권장)
    private Map<String, CandyGame> games = new HashMap<>();

    @MessageMapping("/chat")
    @SendTo("/topic/chat")
    public ChatMessage chat(ChatMessage message) throws Exception {
        // XSS 방지를 위해 HTML 이스케이프
        message.setContent(HtmlUtils.htmlEscape(message.getContent()));
        message.setSender(HtmlUtils.htmlEscape(message.getSender()));
        return message;
    }

    @MessageMapping("/game/start")
    @SendTo("/topic/game")
    public GameState startGame(GameStartRequest request) {
        String gameId = request.getGameId();
        String playerName = HtmlUtils.htmlEscape(request.getPlayerName());

        System.out.println("🎮 게임 시작 요청: gameId=" + gameId + ", playerName=" + playerName);

        CandyGame game = games.get(gameId);
        if (game == null) {
            game = new CandyGame(gameId);
            games.put(gameId, game);
            System.out.println("🆕 새 게임 생성: " + gameId);
        } else {
            System.out.println("📋 기존 게임 참여: " + gameId + ", 현재 플레이어 수: " + game.getGameState().getPlayers().size());
        }

        // 플레이어 추가
        game.addPlayer(playerName);
        System.out.println("👤 플레이어 추가 완료: " + playerName + ", 총 플레이어 수: " + game.getGameState().getPlayers().size());

        return game.getGameState();
    }

    @MessageMapping("/game/submitWords")
    @SendTo("/topic/game")
    public GameState submitWords(GameActionRequest request) {
        CandyGame game = games.get(request.getGameId());
        if (game != null && request.getWords() != null) {
            game.submitWords(request.getPlayerName(), request.getWords());
            return game.getGameState();
        }
        return null;
    }

    @MessageMapping("/game/drawWord")
    @SendTo("/topic/game")
    public GameState drawWord(GameActionRequest request) {
        CandyGame game = games.get(request.getGameId());
        if (game != null) {
            game.drawWord(request.getPlayerName());
            return game.getGameState();
        }
        return null;
    }

    @MessageMapping("/game/selectWord")
    @SendTo("/topic/game")
    public GameState selectWord(GameActionRequest request) {
        CandyGame game = games.get(request.getGameId());
        if (game != null && request.getSelectedWord() != null) {
            game.selectWord(request.getPlayerName(), request.getSelectedWord());
            return game.getGameState();
        }
        return null;
    }

    @MessageMapping("/game/guess")
    @SendTo("/topic/game")
    public GameState guess(GameActionRequest request) {
        CandyGame game = games.get(request.getGameId());
        if (game != null && request.getGuessedPlayer() != null) {
            game.guess(request.getPlayerName(), request.getGuessedPlayer());
            return game.getGameState();
        }
        return null;
    }

    @MessageMapping("/game/startMixing")
    @SendTo("/topic/game")
    public GameState startMixing(GameActionRequest request) {
        CandyGame game = games.get(request.getGameId());
        if (game != null) {
            game.startMixing();
            return game.getGameState();
        }
        return null;
    }

    // 셀장 사탕 게임 클래스
    public static class CandyGame {
        private String gameId;
        private List<Player> players;
        private int currentPlayerIndex;
        private GamePhase phase;
        private List<Word> mixedWords;
        private Word currentWord;
        private int guessAttempts;
        private boolean gameOver;

        public enum GamePhase {
            WAITING,  // 플레이어 기다림
            WRITING_WORDS,  // 단어 작성
            MIXING,  // 단어 믹싱
            GUESSING  // 추측 단계
        }

        public CandyGame(String gameId) {
            this.gameId = gameId;
            this.players = new ArrayList<>();
            this.currentPlayerIndex = 0;
            this.phase = GamePhase.WAITING;
            this.mixedWords = new ArrayList<>();
            this.guessAttempts = 0;
            this.gameOver = false;
        }

        public void addPlayer(String playerName) {
            for (Player player : players) {
                if (player.getName().equals(playerName)) {
                    return; // 이미 존재
                }
            }
            players.add(new Player(playerName));

            // 첫 번째 플레이어가 참여하면 단어 작성 단계 시작
            if (players.size() == 1) {
                phase = GamePhase.WRITING_WORDS;
            }
        }

        public void submitWords(String playerName, List<String> words) {
            if (phase != GamePhase.WRITING_WORDS) return;

            Player player = getPlayerByName(playerName);
            if (player != null && words.size() == 5) {
                for (String word : words) {
                    player.addWord(word);
                }

                // 모든 플레이어가 단어를 제출했는지 확인
                boolean allSubmitted = players.stream().allMatch(p -> p.getWords().size() == 5);
                if (allSubmitted && players.size() >= 2) {
                    startMixing();
                }
            }
        }

        public void startMixing() {
            if (phase != GamePhase.WRITING_WORDS) return;

            // 모든 플레이어의 단어 수집
            mixedWords.clear();
            for (Player player : players) {
                for (String word : player.getWords()) {
                    mixedWords.add(new Word(word, player.getName()));
                }
            }

            // 섞기
            Collections.shuffle(mixedWords);
            phase = GamePhase.GUESSING;
        }

        public Word selectWord(String playerName, String selectedWord) {
            if (phase != GamePhase.GUESSING || !isCurrentPlayer(playerName)) return null;

            // 선택한 단어를 찾음
            for (Word word : mixedWords) {
                if (word.getWord().equals(selectedWord)) {
                    currentWord = word;
                    mixedWords.remove(word);
                    guessAttempts = 2;
                    return currentWord;
                }
            }
            return null;
        }

        public Word drawWord(String playerName) {
            if (phase != GamePhase.GUESSING || !isCurrentPlayer(playerName)) return null;

            if (!mixedWords.isEmpty()) {
                currentWord = mixedWords.remove(0);
                guessAttempts = 2;
                return currentWord;
            }
            return null;
        }

        public boolean guess(String playerName, String guessedPlayer) {
            if (phase != GamePhase.GUESSING || !isCurrentPlayer(playerName) || currentWord == null) return false;

            guessAttempts--;
            boolean correct = currentWord.getAuthor().equals(guessedPlayer);

            if (correct || guessAttempts <= 0) {
                // 추측 끝남 - 다음 플레이어로
                nextTurn();
            }

            return correct;
        }

        private void nextTurn() {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
            currentWord = null;
            guessAttempts = 0;

            if (mixedWords.isEmpty()) {
                gameOver = true;
            }
        }

        private Player getPlayerByName(String name) {
            return players.stream().filter(p -> p.getName().equals(name)).findFirst().orElse(null);
        }

        private boolean isCurrentPlayer(String name) {
            return players.get(currentPlayerIndex).getName().equals(name);
        }

        public GameState getGameState() {
            return new GameState(
                gameId,
                players,
                phase.name(),
                currentPlayerIndex,
                mixedWords.size(),
                currentWord != null ? currentWord.getWord() : null,
                guessAttempts,
                gameOver,
                mixedWords.stream().map(Word::getWord).collect(java.util.stream.Collectors.toList())
            );
        }
    }

    // 플레이어 클래스
    public static class Player {
        private String name;
        private List<String> words;

        public Player(String name) {
            this.name = name;
            this.words = new ArrayList<>();
        }

        public void addWord(String word) {
            words.add(word);
        }

        public String getName() { return name; }
        public List<String> getWords() { return words; }
    }

    // 단어 클래스
    public static class Word {
        private String word;
        private String author;

        public Word(String word, String author) {
            this.word = word;
            this.author = author;
        }

        public String getWord() { return word; }
        public String getAuthor() { return author; }
    }

    // 게임 상태 클래스
    public static class GameState {
        private String gameId;
        private List<Player> players;
        private String phase;
        private int currentPlayerIndex;
        private int remainingWords;
        private String currentWord;
        private int guessAttempts;
        private boolean gameOver;
        private List<String> mixedWords;

        public GameState(String gameId, List<Player> players, String phase,
                        int currentPlayerIndex, int remainingWords, String currentWord,
                        int guessAttempts, boolean gameOver, List<String> mixedWords) {
            this.gameId = gameId;
            this.players = players;
            this.phase = phase;
            this.currentPlayerIndex = currentPlayerIndex;
            this.remainingWords = remainingWords;
            this.currentWord = currentWord;
            this.guessAttempts = guessAttempts;
            this.gameOver = gameOver;
            this.mixedWords = mixedWords;
        }

        // Getters
        public String getGameId() { return gameId; }
        public List<Player> getPlayers() { return players; }
        public String getPhase() { return phase; }
        public int getCurrentPlayerIndex() { return currentPlayerIndex; }
        public int getRemainingWords() { return remainingWords; }
        public String getCurrentWord() { return currentWord; }
        public int getGuessAttempts() { return guessAttempts; }
        public boolean isGameOver() { return gameOver; }
        public List<String> getMixedWords() { return mixedWords; }
    }

    // 요청 클래스들
    public static class GameStartRequest {
        private String gameId;
        private String playerName;

        public String getGameId() { return gameId; }
        public void setGameId(String gameId) { this.gameId = gameId; }
        public String getPlayerName() { return playerName; }
        public void setPlayerName(String playerName) { this.playerName = playerName; }
    }

    public static class GameActionRequest {
        private String gameId;
        private String playerName;
        private List<String> words;
        private String guessedPlayer;
        private String selectedWord;

        public String getGameId() { return gameId; }
        public void setGameId(String gameId) { this.gameId = gameId; }
        public String getPlayerName() { return playerName; }
        public void setPlayerName(String playerName) { this.playerName = playerName; }
        public List<String> getWords() { return words; }
        public void setWords(List<String> words) { this.words = words; }
        public String getGuessedPlayer() { return guessedPlayer; }
        public void setGuessedPlayer(String guessedPlayer) { this.guessedPlayer = guessedPlayer; }
        public String getSelectedWord() { return selectedWord; }
        public void setSelectedWord(String selectedWord) { this.selectedWord = selectedWord; }
    }

    public static class ChatMessage {
        private String sender;
        private String content;
        private long timestamp;

        public ChatMessage() {
            this.timestamp = System.currentTimeMillis();
        }

        public ChatMessage(String sender, String content) {
            this.sender = sender;
            this.content = content;
            this.timestamp = System.currentTimeMillis();
        }

        public String getSender() {
            return sender;
        }

        public void setSender(String sender) {
            this.sender = sender;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
    }
}