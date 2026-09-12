import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { BIRTHDAYS_TONE as T, SERIF } from "@/lib/app-themes";
import {
  addBirthday,
  BIRTHDAY_MONTHS,
  birthdayById,
  clampBirthdayDay,
  daysInMonth,
  formatBirthdayDate,
  nextBirthdayKey,
  removeBirthday,
  upcomingInDays,
  type Birthday,
  type BirthdayCircle,
} from "@/lib/birthdays";
import { addMonths, formatLongDate, monthGrid } from "@/lib/dates";
import { useMiniApps } from "@/lib/mini-apps";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type DateMode = "calendar" | "scroll";

const ROW = 40;

export default function BirthdaysScreen() {
  const { data, ready, patch } = useMiniApps();
  const [circle, setCircle] = useState<BirthdayCircle>("family");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<DateMode>("calendar");
  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [day, setDay] = useState(now.getDate());
  const [error, setError] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const list = useMemo(
    () => data.birthdays.filter((row) => row.circle === circle),
    [circle, data.birthdays]
  );
  const cells = useMemo(
    () => monthGrid(cursor.year, cursor.month),
    [cursor.month, cursor.year]
  );
  const selectedDay = clampBirthdayDay(cursor.month, day);
  const nextKey = nextBirthdayKey(cursor.month, selectedDay);
  const removeRow = removeId ? birthdayById(data.birthdays, removeId) : null;

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Add a name.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      birthdays: addBirthday(state.birthdays, {
        name: trimmed,
        circle,
        month: cursor.month,
        day: selectedDay,
      }),
    }));
    setName("");
    setAdding(false);
  };

  const confirmRemove = async () => {
    if (!removeId) return;
    const id = removeId;
    setRemoveId(null);
    await patch((state) => ({
      ...state,
      birthdays: removeBirthday(state.birthdays, id),
    }));
  };

  return (
    <Screen scroll background={T.background}>
      <Stage background={T.background} fallback={"/hub/home-base" as Href} accent={T.accent}>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Home Base · Birthdays
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 34,
            lineHeight: 40,
            color: T.ink,
          }}
        >
          Who to remember
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 15,
            lineHeight: 22,
            color: T.muted,
          }}
        >
          Family or friends. Pick a date. It shows up on the home calendar every year.
        </Text>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            padding: 4,
            borderRadius: 16,
            backgroundColor: T.surface,
            borderWidth: 1,
            borderColor: T.border,
          }}
        >
          {(
            [
              ["family", "Family"],
              ["friends", "Friends"],
            ] as const
          ).map(([id, label]) => {
            const on = circle === id;
            return (
              <Pressable
                key={id}
                onPress={() => {
                  setCircle(id);
                  setAdding(false);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 10,
                  backgroundColor: on
                    ? id === "family"
                      ? T.family
                      : T.friends
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 14,
                    color: on ? "#1A120E" : T.muted,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!ready ? (
          <Text style={{ marginTop: 22, color: T.muted, fontFamily: SERIF }}>
            Opening the book…
          </Text>
        ) : list.length === 0 && !adding ? (
          <Text
            style={{
              marginTop: 22,
              fontFamily: SERIF,
              fontSize: 16,
              color: T.muted,
            }}
          >
            No {circle} birthdays yet. Add the first one.
          </Text>
        ) : (
          <View style={{ marginTop: 18, gap: 10 }}>
            {list.map((row) => (
              <BirthdayRow
                key={row.id}
                row={row}
                onRemove={() => setRemoveId(row.id)}
              />
            ))}
          </View>
        )}

        {adding ? (
          <View
            style={{
              marginTop: 20,
              borderRadius: 22,
              backgroundColor: T.paper,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: T.paperMuted,
              }}
            >
              New {circle === "family" ? "family" : "friend"}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="rgba(42,33,22,0.35)"
              style={{
                marginTop: 10,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(42,33,22,0.16)",
                paddingVertical: 10,
                fontFamily: SERIF,
                fontSize: 20,
                color: T.paperInk,
              }}
            />

            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                padding: 3,
                borderRadius: 12,
                backgroundColor: "rgba(42,33,22,0.06)",
              }}
            >
              {(
                [
                  ["calendar", "Calendar"],
                  ["scroll", "Scroll dates"],
                ] as const
              ).map(([id, label]) => {
                const on = mode === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setMode(id)}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      borderRadius: 10,
                      paddingVertical: 8,
                      backgroundColor: on ? T.paper : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: on ? T.paperInk : T.paperMuted,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === "calendar" ? (
              <View style={{ marginTop: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Pressable
                    onPress={() =>
                      setCursor(addMonths(cursor.year, cursor.month, -1))
                    }
                    hitSlop={10}
                  >
                    <Ionicons name="chevron-back" size={20} color={T.paperInk} />
                  </Pressable>
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 17,
                      color: T.paperInk,
                    }}
                  >
                    {BIRTHDAY_MONTHS[cursor.month]}
                  </Text>
                  <Pressable
                    onPress={() =>
                      setCursor(addMonths(cursor.year, cursor.month, 1))
                    }
                    hitSlop={10}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={T.paperInk}
                    />
                  </Pressable>
                </View>
                <View style={{ flexDirection: "row" }}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((label, i) => (
                    <Text
                      key={`${label}-${i}`}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: 11,
                        fontWeight: "700",
                        color: T.paperMuted,
                        paddingBottom: 6,
                      }}
                    >
                      {label}
                    </Text>
                  ))}
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {cells.map((cell, index) => (
                    <Pressable
                      key={cell ? cell.date : `empty-${index}`}
                      disabled={!cell}
                      onPress={() => cell && setDay(cell.day)}
                      style={{
                        width: "14.28%",
                        height: 36,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        backgroundColor:
                          cell && cell.day === selectedDay
                            ? circle === "family"
                              ? T.family
                              : T.friends
                            : "transparent",
                      }}
                    >
                      {cell ? (
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: cell.day === selectedDay ? "700" : "500",
                            color:
                              cell.day === selectedDay ? "#1A120E" : T.paperInk,
                          }}
                        >
                          {cell.day}
                        </Text>
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View
                style={{
                  marginTop: 14,
                  flexDirection: "row",
                  height: ROW * 4,
                  gap: 10,
                }}
              >
                <ScrollView
                  style={{ flex: 1.4 }}
                  snapToInterval={ROW}
                  decelerationRate="fast"
                  showsVerticalScrollIndicator={false}
                >
                  {BIRTHDAY_MONTHS.map((label, index) => {
                    const on = index === cursor.month;
                    return (
                      <Pressable
                        key={label}
                        onPress={() => {
                          setCursor((c) => ({ ...c, month: index }));
                          setDay((d) => clampBirthdayDay(index, d));
                        }}
                        style={{
                          height: ROW,
                          justifyContent: "center",
                          paddingHorizontal: 8,
                          borderRadius: 10,
                          backgroundColor: on
                            ? "rgba(42,33,22,0.08)"
                            : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: SERIF,
                            fontSize: 16,
                            color: on ? T.paperInk : T.paperMuted,
                            fontWeight: on ? "700" : "500",
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <ScrollView
                  style={{ flex: 0.8 }}
                  snapToInterval={ROW}
                  decelerationRate="fast"
                  showsVerticalScrollIndicator={false}
                >
                  {Array.from(
                    { length: daysInMonth(cursor.month) },
                    (_, i) => i + 1
                  ).map((n) => {
                    const on = n === selectedDay;
                    return (
                      <Pressable
                        key={n}
                        onPress={() => setDay(n)}
                        style={{
                          height: ROW,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 10,
                          backgroundColor: on
                            ? "rgba(42,33,22,0.08)"
                            : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: SERIF,
                            fontSize: 18,
                            color: on ? T.paperInk : T.paperMuted,
                            fontWeight: on ? "700" : "500",
                          }}
                        >
                          {n}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <Text
              style={{
                marginTop: 12,
                fontFamily: SERIF,
                fontSize: 14,
                color: T.paperMuted,
              }}
            >
              Next: {formatLongDate(nextKey)}
            </Text>

            {error ? (
              <Text style={{ marginTop: 8, color: T.family, fontSize: 14 }}>
                {error}
              </Text>
            ) : null}

            <View style={{ marginTop: 14, flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => {
                  setAdding(false);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(42,33,22,0.16)",
                }}
              >
                <Text style={{ fontWeight: "700", color: T.paperMuted }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void save()}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: T.paperInk,
                }}
              >
                <Text style={{ fontWeight: "700", color: T.paper }}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              setAdding(true);
              setError(null);
              setCursor({ year: now.getFullYear(), month: now.getMonth() });
              setDay(now.getDate());
            }}
            style={{
              marginTop: 22,
              alignItems: "center",
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: T.accent,
            }}
          >
            <Text style={{ fontWeight: "700", color: "#1A120E", fontSize: 15 }}>
              Add a {circle === "family" ? "family" : "friend"} birthday
            </Text>
          </Pressable>
        )}
      </Stage>

      <ConfirmDialog
        open={Boolean(removeRow)}
        title="Remove this birthday?"
        body={
          removeRow
            ? `${removeRow.name} · ${formatBirthdayDate(removeRow.month, removeRow.day)} comes off the book and the calendar.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveId(null)}
      />
    </Screen>
  );
}

function BirthdayRow({
  row,
  onRemove,
}: {
  row: Birthday;
  onRemove: () => void;
}) {
  const days = upcomingInDays(row.month, row.day);
  const when =
    days === 0
      ? "Today"
      : days === 1
        ? "Tomorrow"
        : `In ${days} days`;
  return (
    <View
      style={{
        borderRadius: 18,
        backgroundColor: T.surfaceRaised,
        borderWidth: 1,
        borderColor: T.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            color: T.ink,
          }}
        >
          {row.name}
        </Text>
        <Text style={{ marginTop: 3, fontSize: 13, color: T.muted }}>
          {formatBirthdayDate(row.month, row.day)} · {when}
        </Text>
      </View>
      <Pressable onPress={onRemove} hitSlop={10} accessibilityLabel="Remove">
        <Ionicons name="close" size={20} color={T.muted} />
      </Pressable>
    </View>
  );
}
