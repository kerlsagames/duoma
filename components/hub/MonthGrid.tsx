import { Pressable, Text, View } from "react-native";

type Cell = { date: string; day: number } | null;

type Props = {
  cells: Cell[];
  marks: Record<string, string[]>;
  selected: string | null;
  onSelect: (date: string) => void;
};

export function MonthGrid({ cells, marks, selected, onSelect }: Props) {
  return (
    <View>
      <View className="mb-2 flex-row">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <Text
            key={`${label}-${index}`}
            className="flex-1 text-center text-[11px] font-semibold text-mist/40"
          >
            {label}
          </Text>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {cells.map((cell, index) => {
          if (!cell) {
            return <View key={`empty-${index}`} className="mb-1 h-12 w-[14.28%]" />;
          }
          const kinds = marks[cell.date] ?? [];
          const on = selected === cell.date;
          return (
            <Pressable
              key={cell.date}
              onPress={() => onSelect(cell.date)}
              className="mb-1 w-[14.28%] items-center"
            >
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  on ? "bg-neon" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-[14px] font-semibold ${
                    on ? "text-night" : "text-mist"
                  }`}
                >
                  {cell.day}
                </Text>
              </View>
              <View className="mt-0.5 h-1.5 flex-row gap-0.5">
                {kinds.slice(0, 3).map((kind) => (
                  <View
                    key={kind}
                    className={`h-1.5 w-1.5 rounded-full ${
                      kind === "play"
                        ? "bg-crimson"
                        : kind === "date"
                          ? "bg-neon"
                          : "bg-mist/70"
                    }`}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
