import { translations } from "../_utils/translations";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface GameHistoryProps {
  guessHistory: Array<{ guess: string; result: number }>;
  opponentHistory: Array<{ guess: string; result: number }>;
  language: "en" | "pt";
}

const spanBgColorByResult = (result: number) => {
  if (result === 4) {
    return "text-green-500";
  } else if (result === 3) {
    return "text-green-500";
  } else if (result === 1 || result === 2) {
    return "text-yellow-500";
  } else {
    return "text-gray-500";
  }
};
export const GameHistory: React.FC<GameHistoryProps> = ({
  guessHistory,
  opponentHistory,
  language = "en",
}) => {
  const t = translations[language];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t.yourGuessHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          {guessHistory.map((g, idx) => (
            <p key={idx}>
              {t.guess}: {g.guess} | {t.correctDigits}:{" "}
              <span className={spanBgColorByResult(g.result)}>{g.result}</span>
            </p>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t.opponentGuessHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          {opponentHistory.map((g, idx) => (
            <p key={idx}>
              {t.guess}: {g.guess} | {t.correctDigits}:{" "}
              <span className={spanBgColorByResult(g.result)}>{g.result}</span>
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
