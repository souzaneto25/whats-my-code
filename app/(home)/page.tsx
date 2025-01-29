"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../_components/ui/card";
import { Input } from "../_components/ui/input";
import { Button } from "../_components/ui/button";
import { socket } from "../_lib/socketClient";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../_components/ui/input-otp";
import { REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS } from "input-otp";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../_components/ui/select";
import { SelectItem } from "@radix-ui/react-select";
import { translations } from "../_utils/translations";
import { GameHistory } from "../_components/GameHistory";
import { DraftCode } from "../_components/DraftCode";
import { Winner } from "../_components/Winner";

interface DraftData {
  [key: number]: string;
}
const Home = () => {
  const [language, setLanguage] = useState<keyof typeof translations>("en");
  const t = translations[language];
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joined, setJoined] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [playerCode, setPlayerCode] = useState("");
  const [draftCode, setDraftCode] = useState<DraftData>({
    0: "",
    1: "",
    2: "",
    3: "",
  });
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [opponentCodeReady, setOpponentCodeReady] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [guess, setGuess] = useState("");
  const [guessHistory, setGuessHistory] = useState<
    Array<{ guess: string; result: number }>
  >([]);
  const [opponentHistory, setOpponentHistory] = useState<
    Array<{ guess: string; result: number }>
  >([]);
  const [winner, setWinner] = useState("");
  const ROOM_CODE_PATTERN = /^[a-z]{3}-[a-z]{3}$/;

  const generateRoomName = (): string => {
    const randomSegment = () => {
      let segment = "";
      while (segment.length < 3) {
        const char = Math.random()
          .toString(36)
          .charAt(Math.floor(Math.random() * 36));
        if (char >= "a" && char <= "z") {
          segment += char;
        }
      }
      return segment;
    };

    const roomName = `${randomSegment()}-${randomSegment()}`;

    return ROOM_CODE_PATTERN.test(roomName) ? roomName : generateRoomName();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return alert("Please enter a username");
    if (!roomName) return alert("Please enter a room code");
    const roomNameLowercase = roomName.toLowerCase();
    const roomNameFormated = `${roomNameLowercase.slice(0, 3)}-${roomNameLowercase.slice(3)}`;
    if (!ROOM_CODE_PATTERN.test(roomNameFormated)) {
      alert("Please enter a valid room name");
      return;
    }
    console.log("Joining room:", { username, roomName: roomNameFormated });
    socket.emit("join-room", { room: roomNameFormated, username });
    setRoomName(roomNameFormated);
    setJoined(true);
  };

  const handleCreateRoom = () => {
    if (!username) return alert("Please enter a username");
    const newRoomName = generateRoomName();
    console.log("Joining room:", { username, roomName: newRoomName });
    socket.emit("join-room", { room: newRoomName, username });
    setRoomName(newRoomName);
    setJoined(true);
  };

  const handleSubmitCode = () => {
    if (playerCode.length !== 4) {
      alert("The code must be 4 digits!");
      return;
    }
    socket.emit("submit-code", { room: roomName, code: playerCode });
    setCodeSubmitted(true);
  };

  const handleMakeGuess = () => {
    if (guess.length !== 4) {
      alert("Your guess must be 4 digits!");
      return;
    }
    socket.emit("make-guess", { room: roomName, guess });
    setGuess("");
  };

  const handleOTPChange = (index: number, otp: string) => {
    setDraftCode((prevDraft) => ({
      ...prevDraft,
      [index]: otp,
    }));
  };

  const handleClearDraft = () => {
    setDraftCode({
      0: "",
      1: "",
      2: "",
      3: "",
    });
  };

  useEffect(() => {
    socket.on("waiting-players", (players) => {
      if (players.length < 2) {
        setWaiting(true);
      } else {
        setWaiting(false);
      }
    });

    socket.on("codes-ready", () => {
      setOpponentCodeReady(true);
    });

    socket.on("your-turn", () => {
      setIsMyTurn(true);
    });

    const handleRoomFull = (message: string) => {
      alert(message);
      setJoined(false);
    };

    socket.on("room-full", handleRoomFull);

    socket.on("guess-result", ({ guess, correctDigits }) => {
      setGuessHistory((prev) => [...prev, { guess, result: correctDigits }]);
      setIsMyTurn(false);
    });

    socket.on("opponent-guess", ({ guess, correctDigits }) => {
      setOpponentHistory((prev) => [...prev, { guess, result: correctDigits }]);
    });

    socket.on("game-restarted", () => {
      console.log("Game restarted");
      setWinner("");
      setGuess("");
      setGuessHistory([]);
      setOpponentHistory([]);
      setIsMyTurn(false);
      setPlayerCode("");
      setCodeSubmitted(false);
      setOpponentCodeReady(false);
    });

    socket.on("waiting-for-codes", () => {});

    socket.on("game-over", (message) => {
      setWinner(message);
    });

    socket.on("player-left", () => {
      setWaiting(true);
      setGuess("");
      setGuessHistory([]);
      setOpponentHistory([]);
      setIsMyTurn(false);
      setPlayerCode("");
      setCodeSubmitted(false);
      setOpponentCodeReady(false);
    });

    return () => {
      socket.off("waiting-players");
      socket.off("codes-ready");
      socket.off("your-turn");
      socket.off("guess-result");
      socket.off("game-restarted");
      socket.off("waiting-for-codes");
      socket.off("room-full", handleRoomFull);
      socket.off("opponent-guess");
      socket.off("game-over");
      socket.off("player-left");
    };
  }, []);

  useEffect(() => {
    if (language === "en") {
      document.documentElement.setAttribute("lang", "en");
    } else {
      document.documentElement.setAttribute("lang", "pt-BR");
    }
  }, [language]);

  if (!joined) {
    return (
      <div className="flex min-h-screen flex-col items-center overflow-y-auto bg-background p-4">
        <div className="w-full max-w-md">
          <div className="mb-4 flex justify-end">
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as "en" | "pt")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  {language === "en" ? "English" : "Português"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                {t.joinRoomTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label>{t.usernamePlaceholder}</label>
                  <Input
                    type="text"
                    placeholder={t.usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label>{t.roomNamePlaceholder}</label>
                  <InputOTP
                    maxLength={9}
                    inputMode="text"
                    pattern={REGEXP_ONLY_CHARS}
                    value={roomName}
                    onChange={setRoomName}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {t.joinButton}
                </Button>
                <p className="text-center text-sm text-muted-foreground">Ou</p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  type="button"
                  onClick={handleCreateRoom}
                >
                  Criar uma sala
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                {t.howToPlayTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
                {t.howToPlaySteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex-col bg-background">
      <div className="h-screen flex-1 overflow-y-auto pb-[120px] sm:pb-32">
        <div className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
          <h1 className="mb-6 text-center text-xl font-bold sm:text-2xl">
            {t.room}: {roomName}
          </h1>
          <div className="space-y-6">
            {winner ? (
              <Winner
                winner={winner}
                language={language}
                onPlayAgain={() =>
                  socket.emit("restart-game", { room: roomName })
                }
              />
            ) : waiting ? (
              <Card>
                <CardContent className="py-6">
                  <p className="text-center text-base sm:text-lg">
                    {t.waitingMessage}
                  </p>
                </CardContent>
              </Card>
            ) : !opponentCodeReady ? (
              <Card>
                <CardContent className="space-y-4 py-6">
                  <p className="text-center text-base font-semibold sm:text-lg">
                    {t.chooseCode}
                  </p>
                  <div className="flex w-full justify-center">
                    <InputOTP
                      maxLength={4}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={playerCode}
                      onChange={setPlayerCode}
                      disabled={codeSubmitted}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button
                    onClick={handleSubmitCode}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={codeSubmitted}
                  >
                    {t.submitCodeButton}
                  </Button>
                  {playerCode.length === 4 && codeSubmitted && (
                    <p className="text-center text-sm text-muted-foreground">
                      {t.codeConfirmation} <strong>{playerCode}</strong>
                      <br />
                      {t.waitingForPlayer}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="space-y-6 py-6">
                  <h2 className="text-center text-lg font-semibold sm:text-xl">
                    {isMyTurn ? t.yourTurn : t.waitingForOpponent}
                  </h2>
                  <p className="text-center text-sm text-muted-foreground">
                    {t.codeConfirmation} <strong>{playerCode}</strong>
                  </p>
                  {isMyTurn && (
                    <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
                      <p className="text-center text-base font-semibold sm:text-lg">
                        {t.enterGuess}
                      </p>
                      <div className="flex w-full items-center justify-center">
                        <InputOTP
                          maxLength={4}
                          pattern={REGEXP_ONLY_DIGITS}
                          value={guess}
                          onChange={setGuess}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button
                        onClick={handleMakeGuess}
                        className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
                      >
                        {t.guessButton}
                      </Button>
                    </div>
                  )}
                  <GameHistory
                    guessHistory={guessHistory}
                    opponentHistory={opponentHistory}
                    language={language}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <DraftCode
        draftCode={draftCode}
        handleOTPChange={handleOTPChange}
        handleClearDraft={handleClearDraft}
        language={language}
      />
    </div>
  );
};

export default Home;
