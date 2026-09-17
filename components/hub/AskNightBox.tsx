import { CalendarDateField } from "@/components/ui/CalendarDateField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { formatLongDate, localDateKey } from "@/lib/dates";
import { nightAskHint } from "@/lib/play-items";
import { Text, View } from "react-native";

export function AskNightBox({
  dateKey,
  onChangeDate,
  partnerName,
  sending,
  onSend,
  accent,
  ink,
  muted,
  background,
}: {
  dateKey: string;
  onChangeDate: (value: string) => void;
  partnerName: string;
  sending?: boolean;
  onSend: () => void;
  accent: string;
  ink: string;
  muted: string;
  background: string;
}) {
  const night = /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : localDateKey();
  return (
    <View>
      <CalendarDateField
        label="Night you want"
        value={night}
        onChange={(next) => onChangeDate(next || localDateKey())}
        accent={accent}
        ink={ink}
        muted={muted}
        background={background}
        allowClear={false}
        minDate={localDateKey()}
      />
      <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 19, color: muted }}>
        {nightAskHint(night)}
      </Text>
      <View style={{ marginTop: 12 }}>
        <PrimaryButton
          label={`Ask ${partnerName} for ${formatLongDate(night)}`}
          tone="crimson"
          loading={sending}
          onPress={onSend}
        />
      </View>
    </View>
  );
}
