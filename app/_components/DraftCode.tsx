import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { InputOTP, InputOTPSlot } from "./ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { translations } from "../_utils/translations";

interface DraftCodeProps {
  draftCode: { [key: number]: string };
  handleOTPChange: (index: number, otp: string) => void;
  handleClearDraft: () => void;
  language: "en" | "pt";
}

export const DraftCode: React.FC<DraftCodeProps> = ({
  draftCode,
  handleOTPChange,
  handleClearDraft,
  language = "en",
}) => {
  const t = translations[language];
  return (
    <Card className="fixed bottom-0 left-0 w-full">
      <CardHeader>
        <CardTitle className="text-right">{t.draft}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-end space-x-2">
          {[0, 1, 2, 3].map((index) => (
            <InputOTP
              key={index}
              maxLength={1}
              pattern={REGEXP_ONLY_DIGITS}
              value={draftCode[index]}
              onChange={(otp) => handleOTPChange(index, otp)}
            >
              <InputOTPSlot index={0} />
            </InputOTP>
          ))}
          <Button onClick={handleClearDraft} variant="outline" size="sm">
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
