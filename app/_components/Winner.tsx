import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { translations } from "../_utils/translations";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface WinnerProps {
  winner: string;
  language: "en" | "pt";
  onPlayAgain: () => void;
}

export const Winner: React.FC<WinnerProps> = ({
  winner,
  language = "en",
  onPlayAgain,
}) => {
  const t = translations[language];

  useEffect(() => {
    // Trigger confetti animation when the component mounts
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const [winnerEn, winnerPt] = winner.split("|");
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-green-500">
          {language === "en" ? winnerEn : winnerPt}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          onClick={onPlayAgain}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {t.playAgain}
        </Button>
      </CardContent>
    </Card>
  );
};
