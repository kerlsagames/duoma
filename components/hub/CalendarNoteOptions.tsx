import { HUB_TONES } from "@/lib/app-themes";
import {
  giftKidsAsCalendar,
  mergeCalendarKids,
  toggleAffectsPerson,
} from "@/lib/calendar-people";
import {
  CALENDAR_REPEAT_OPTIONS,
  repeatHint,
} from "@/lib/calendar-repeat";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { CalendarRepeat } from "@/lib/types";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const T = HUB_TONES.calendar;

export function CalendarNoteOptions({
  date,
  repeat,
  onRepeat,
  affectsAll,
  affectsUserIds,
  affectsKidIds,
  onAffects,
}: {
  date: string;
  repeat: CalendarRepeat;
  onRepeat: (value: CalendarRepeat) => void;
  affectsAll: boolean;
  affectsUserIds: string[];
  affectsKidIds: string[];
  onAffects: (next: {
    affectsAll: boolean;
    affectsUserIds: string[];
    affectsKidIds: string[];
  }) => void;
}) {
  const { user, partner } = useApp();
  const { data, patch } = useMiniApps();
  const [kidName, setKidName] = useState("");
  const kids = useMemo(
    () => mergeCalendarKids(data.calendarKids, giftKidsAsCalendar(data.giftPeople)),
    [data.calendarKids, data.giftPeople]
  );
  const people = useMemo(() => {
    const rows: { id: string; name: string; kind: "user" | "kid" }[] = [];
    if (user) rows.push({ id: user.id, name: user.displayName, kind: "user" });
    if (partner) {
      rows.push({ id: partner.id, name: partner.displayName, kind: "user" });
    }
    for (const kid of kids) {
      rows.push({ id: kid.id, name: kid.name, kind: "kid" });
    }
    return rows;
  }, [user, partner, kids]);

  const hint = repeatHint(repeat, date);
  const selected = (id: string, kind: "user" | "kid") => {
    if (affectsAll) return false;
    return kind === "user"
      ? affectsUserIds.includes(id)
      : affectsKidIds.includes(id);
  };

  const addKid = () => {
    const name = kidName.trim();
    if (!name) return;
    const existing = kids.find(
      (row) => row.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      onAffects({
        affectsAll: false,
        affectsUserIds,
        affectsKidIds: affectsKidIds.includes(existing.id)
          ? affectsKidIds
          : [...affectsKidIds, existing.id],
      });
      setKidName("");
      return;
    }
    const row = { id: createId(), name, createdAt: nowIso() };
    void patch((state) => ({
      ...state,
      calendarKids: state.calendarKids.some((item) => item.id === row.id)
        ? state.calendarKids
        : [...state.calendarKids, row],
    }));
    onAffects({
      affectsAll: false,
      affectsUserIds,
      affectsKidIds: [...affectsKidIds, row.id],
    });
    setKidName("");
  };

  return (
    <>
      <FieldLabel>Repeats</FieldLabel>
      <Text style={{ marginTop: 6, fontSize: 13, color: T.muted, lineHeight: 18 }}>
        Weekly or every two weeks keeps the weekday you picked — so a Sunday
        start becomes every second Sunday.
      </Text>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {CALENDAR_REPEAT_OPTIONS.map((row) => {
          const on = repeat === row.id;
          return (
            <Pressable
              key={row.id}
              onPress={() => onRepeat(row.id)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: on ? "#C23B55" : "rgba(22,24,29,0.12)",
                backgroundColor: on ? "rgba(194,59,85,0.08)" : "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: on ? "#C23B55" : "#16181D",
                }}
              >
                {row.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {hint ? (
        <Text style={{ marginTop: 8, fontSize: 13, color: T.muted }}>{hint}</Text>
      ) : null}

      <FieldLabel>Who it covers</FieldLabel>
      <Text style={{ marginTop: 6, fontSize: 13, color: T.muted, lineHeight: 18 }}>
        {people.length
          ? `Everyone is the whole house. Or pick ${people
              .map((row) => row.name)
              .slice(0, 4)
              .join(", ")}${people.length > 4 ? ", …" : ""} — add a kid if they are missing.`
          : "Everyone is the whole house. Add the kids’ names so a note can be just for them."}
      </Text>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Chip
          label="Everyone"
          on={affectsAll}
          onPress={() =>
            onAffects({
              affectsAll: true,
              affectsUserIds: [],
              affectsKidIds: [],
            })
          }
        />
        {people.map((person) => (
          <Chip
            key={`${person.kind}:${person.id}`}
            label={person.name}
            on={selected(person.id, person.kind)}
            onPress={() =>
              onAffects(
                toggleAffectsPerson(
                  { affectsAll, affectsUserIds, affectsKidIds },
                  person
                )
              )
            }
          />
        ))}
      </View>
      <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
        <TextInput
          value={kidName}
          onChangeText={setKidName}
          placeholder="Add a kid's name"
          placeholderTextColor="rgba(22,24,29,0.35)"
          onSubmitEditing={addKid}
          style={{
            flex: 1,
            height: 48,
            borderWidth: 1,
            borderColor: "rgba(22,24,29,0.14)",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
            fontSize: 16,
            color: T.ink,
          }}
        />
        <Pressable
          onPress={addKid}
          style={{
            paddingHorizontal: 16,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: kidName.trim() ? "#C23B55" : "rgba(22,24,29,0.08)",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: kidName.trim() ? "#FFFFFF" : "rgba(22,24,29,0.35)",
            }}
          >
            Add
          </Text>
        </Pressable>
      </View>
    </>
  );
}

function Chip({
  label,
  on,
  onPress,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: on ? "#C23B55" : "rgba(22,24,29,0.12)",
        backgroundColor: on ? "rgba(194,59,85,0.08)" : "#FFFFFF",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: on ? "#C23B55" : "#16181D",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        marginTop: 18,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 2,
        textTransform: "uppercase",
        color: "rgba(22,24,29,0.4)",
      }}
    >
      {children}
    </Text>
  );
}
