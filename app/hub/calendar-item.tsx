import { ageLabel, birthdayById, formatBirthdayDate } from "@/lib/birthdays";
import { curiosityQuestionById } from "@/lib/curiosityQuestions";
import {
  clockTimeValue,
  formatClockTime,
  formatLongDate,
  isoFromDateAndTime,
} from "@/lib/dates";
import { holidaysAround } from "@/lib/holidays";
import { HUB_TONES } from "@/lib/app-themes";
import { ItemReminders } from "@/components/hub/ReminderLeads";
import { useMiniApps } from "@/lib/mini-apps";
import { categoryById, questionById } from "@/lib/talk";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/ui/Screen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { createElement, useState, type ReactNode } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";

const T = HUB_TONES.calendar;

function Back() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
    >
      <Ionicons name="chevron-back" size={20} color={T.accent} />
      <Text style={{ fontSize: 15, color: T.accent, fontWeight: "600" }}>
        Back
      </Text>
    </Pressable>
  );
}

function Block({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <View style={{ paddingTop: 8, paddingBottom: 32 }}>
      <Back />
      <Text
        style={{
          marginTop: 18,
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          color: T.kicker,
        }}
      >
        {kicker}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontSize: 28,
          fontWeight: "700",
          color: T.ink,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Meta({ children }: { children: ReactNode }) {
  return (
    <Text style={{ marginTop: 8, fontSize: 15, color: T.muted }}>{children}</Text>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        marginTop: 18,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderColor: "rgba(22,24,29,0.1)",
        padding: 16,
        gap: 8,
      }}
    >
      {children}
    </View>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ fontSize: 14, color: T.ink, lineHeight: 20 }}>
      <Text style={{ fontWeight: "700" }}>{label}: </Text>
      {value}
    </Text>
  );
}

export default function CalendarItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string; id?: string }>();
  const kind = typeof params.kind === "string" ? params.kind : "";
  const id = typeof params.id === "string" ? params.id : "";

  const {
    checkIns,
    milestones,
    bucketItems,
    talkDraws,
    listEntries,
    coupleLists,
    spicyDares,
    coupons,
    jarNotes,
    curiosityAnswers,
    calendarEvents,
    listEntryRatings,
    partner,
    user,
    updateCalendarEvent,
    removeCalendarEvent,
  } = useApp();
  const { data: mini } = useMiniApps();

  const nameFor = (userId: string) => {
    if (user && userId === user.id) return user.displayName;
    if (partner && userId === partner.id) return partner.displayName;
    return "Partner";
  };

  if (kind === "check_in") {
    const row = checkIns.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Check-in" title="Not found">
            <Meta>This check-in is no longer in history.</Meta>
          </Block>
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker="Check-in" title={formatLongDate(row.date)}>
          <Meta>{`Logged by ${nameFor(row.userId)} · ${formatClockTime(row.createdAt)}`}</Meta>
          <Panel>
            {row.energy != null ? <Line label="Energy" value={String(row.energy)} /> : null}
            {row.mood ? <Line label="Mood" value={row.mood} /> : null}
            {row.loveTank != null ? <Line label="Love tank" value={String(row.loveTank)} /> : null}
            {row.socialBattery ? <Line label="Social battery" value={row.socialBattery} /> : null}
            {row.todayNeed ? <Line label="Today need" value={row.todayNeed} /> : null}
            {row.desireGauge ? <Line label="Desire" value={row.desireGauge} /> : null}
            {row.tonight ? <Line label="Tonight" value={row.tonight} /> : null}
          </Panel>
        </Block>
      </Screen>
    );
  }

  if (kind === "milestone") {
    const row = milestones.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Milestone" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker={`Milestone · ${row.kind}`} title={row.title}>
          <Meta>{formatLongDate(row.date)}</Meta>
        </Block>
      </Screen>
    );
  }

  if (kind === "bucket") {
    const row = bucketItems.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Date night" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker={`Bucket · ${row.kind}`} title={row.title}>
          {row.scheduledOn ? <Meta>{`Planned ${formatLongDate(row.scheduledOn)}`}</Meta> : null}
          {row.doneAt ? <Meta>{`Done ${formatClockTime(row.doneAt)}`}</Meta> : null}
          {row.notes ? (
            <Panel>
              <Text style={{ fontSize: 15, color: T.ink, lineHeight: 22 }}>{row.notes}</Text>
            </Panel>
          ) : null}
        </Block>
      </Screen>
    );
  }

  if (kind === "talk") {
    const row = talkDraws.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Talk to Me" title="Not found" />
        </Screen>
      );
    }
    const question = questionById(row.categoryId, row.questionId);
    let categoryName = "Talk to Me";
    try {
      categoryName = categoryById(row.categoryId).name;
    } catch {
      /* ignore */
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker={categoryName} title={question?.text ?? "Question"}>
          <Meta>
            {row.answeredAt
              ? `Answered ${formatLongDate(row.date)} · ${formatClockTime(row.answeredAt)}`
              : `Drawn ${formatLongDate(row.date)}`}
            {` · ${nameFor(row.userId)}`}
          </Meta>
        </Block>
      </Screen>
    );
  }

  if (kind === "list") {
    const row = listEntries.find((item) => item.id === id);
    const list = coupleLists.find((item) => item.id === row?.listId);
    const scores = listEntryRatings.filter((item) => item.entryId === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="List item" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker={list ? `${list.emoji} ${list.title}` : "List item"} title={row.title}>
          {row.completedAt ? (
            <Meta>{`Completed ${formatClockTime(row.completedAt)}${row.completedBy ? ` · ${nameFor(row.completedBy)}` : ""}`}</Meta>
          ) : null}
          {scores.length ? (
            <Panel>
              {scores.map((score) => (
                <Line
                  key={score.id}
                  label={nameFor(score.userId)}
                  value={`${score.stars.toFixed(1)} / 10`}
                />
              ))}
            </Panel>
          ) : null}
          {list ? (
            <Pressable
              onPress={() => router.push(`/hub/list/${list.id}` as Href)}
              style={{ marginTop: 18 }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: T.accent }}>
                Open list →
              </Text>
            </Pressable>
          ) : null}
        </Block>
      </Screen>
    );
  }

  if (kind === "dare") {
    const row = spicyDares.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Spicy dare" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker={`Dare · ${row.status}`} title={row.text}>
          <Meta>{`From ${nameFor(row.fromUserId)} → ${nameFor(row.toUserId)}`}</Meta>
          {row.completedAt ? <Meta>{`Done ${formatClockTime(row.completedAt)}`}</Meta> : null}
          {row.answeredAt && !row.completedAt ? (
            <Meta>{`Answered ${formatClockTime(row.answeredAt)}`}</Meta>
          ) : null}
        </Block>
      </Screen>
    );
  }

  if (kind === "coupon") {
    const row = coupons.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Coupon" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker={`Coupon · ${row.status}`} title={row.title}>
          {row.body ? <Meta>{row.body}</Meta> : null}
          {row.redeemedAt ? <Meta>{`Redeemed ${formatClockTime(row.redeemedAt)}`}</Meta> : null}
          {row.acceptedAt && !row.redeemedAt ? (
            <Meta>{`Accepted ${formatClockTime(row.acceptedAt)}`}</Meta>
          ) : null}
        </Block>
      </Screen>
    );
  }

  if (kind === "jar") {
    const row = jarNotes.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Jar note" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker="Jar note" title={`From ${nameFor(row.fromUserId)}`}>
          {row.openedAt ? <Meta>{`Opened ${formatClockTime(row.openedAt)}`}</Meta> : null}
          <Panel>
            <Text style={{ fontSize: 16, lineHeight: 24, color: T.ink }}>{row.body}</Text>
          </Panel>
        </Block>
      </Screen>
    );
  }

  if (kind === "curiosity") {
    const answers = curiosityAnswers.filter((item) => item.date === id);
    const byQuestion = new Map<string, typeof answers>();
    for (const answer of answers) {
      const list = byQuestion.get(answer.questionId) ?? [];
      list.push(answer);
      byQuestion.set(answer.questionId, list);
    }
    const groups = [...byQuestion.entries()];
    const headline =
      groups.length === 1
        ? curiosityQuestionById(groups[0]![0])?.question ?? "Flirtatious findings"
        : `${groups.length} Flirtatious findings cards`;
    return (
      <Screen scroll background={T.background}>
        <Block kicker="Flirtatious findings" title={headline}>
          <Meta>{formatLongDate(id)}</Meta>
          {groups.length === 0 ? (
            <Panel>
              <Text style={{ color: T.muted }}>No answers saved.</Text>
            </Panel>
          ) : (
            groups.map(([questionId, rows]) => {
              const question = curiosityQuestionById(questionId);
              return (
                <Panel key={questionId}>
                  {groups.length > 1 ? (
                    <Text
                      style={{
                        fontWeight: "700",
                        color: T.ink,
                        marginBottom: 8,
                        fontSize: 16,
                        lineHeight: 22,
                      }}
                    >
                      {question?.question ?? "Flirtatious findings card"}
                    </Text>
                  ) : null}
                  {rows.map((answer) => (
                    <View key={answer.id} style={{ gap: 4, marginBottom: 8 }}>
                      <Text style={{ fontWeight: "700", color: T.ink }}>
                        {nameFor(answer.userId)}
                      </Text>
                      <Text style={{ color: T.muted }}>
                        {answer.body ||
                          (answer.answerIndex != null && question
                            ? question.options[answer.answerIndex]
                            : "Answered")}
                      </Text>
                      <Text style={{ fontSize: 12, color: "rgba(22,24,29,0.45)" }}>
                        {formatClockTime(answer.createdAt)}
                      </Text>
                    </View>
                  ))}
                </Panel>
              );
            })
          )}
        </Block>
      </Screen>
    );
  }

  if (kind === "holiday") {
    const row = holidaysAround().find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Holiday" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker="Holiday" title={row.title}>
          <Meta>{formatLongDate(row.dateKey)} · every year</Meta>
        </Block>
      </Screen>
    );
  }

  if (kind === "birthday") {
    const row = birthdayById(mini.birthdays, id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Birthday" title="Not found" />
        </Screen>
      );
    }
    const age = ageLabel(row.year, row.month, row.day);
    return (
      <Screen scroll background={T.background}>
        <Block
          kicker={row.circle === "family" ? "Family birthday" : "Friends birthday"}
          title={row.name}
        >
          <Meta>
            {formatBirthdayDate(row.month, row.day, row.year)}
            {age ? ` · ${age}` : " · every year"}
          </Meta>
          <ItemReminders kind="birthday" id={row.id} allDay />
          <View style={{ marginTop: 22 }}>
            <PrimaryButton
              label="Open Birthdays"
              onPress={() => router.push("/hub/birthdays" as Href)}
            />
          </View>
        </Block>
      </Screen>
    );
  }

  if (kind === "trip") {
    const row = mini.trips.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Trip" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker="Trip" title={row.title}>
          <Meta>{row.where}</Meta>
          {row.start ? <Meta>{`Departs ${row.start}`}</Meta> : null}
          {row.end ? <Meta>{`Returns ${row.end}`}</Meta> : null}
          <ItemReminders kind="trip" id={row.id} allDay />
          <View style={{ marginTop: 22 }}>
            <PrimaryButton
              label="Open trip plan"
              onPress={() => router.push(`/hub/travel/${row.id}` as Href)}
            />
          </View>
        </Block>
      </Screen>
    );
  }

  if (kind === "job") {
    const row = mini.maintenance.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Job" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker="Job to do" title={row.label}>
          <Meta>{`Every ${row.everyDays} days`}</Meta>
          {row.lastDone ? <Meta>{`Last done ${row.lastDone}`}</Meta> : <Meta>Not done yet</Meta>}
          <ItemReminders kind="job" id={row.id} allDay />
          <View style={{ marginTop: 22 }}>
            <PrimaryButton
              label="Open Household Maintenance"
              onPress={() => router.push("/hub/maintenance" as Href)}
            />
          </View>
        </Block>
      </Screen>
    );
  }

  if (kind === "custom") {
    const row = calendarEvents.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Your entry" title="Not found" />
        </Screen>
      );
    }
    return (
      <CustomEventEditor
        event={row}
        onSave={async (input) => {
          await updateCalendarEvent(row.id, input);
        }}
        onDelete={async () => {
          await removeCalendarEvent(row.id);
          router.back();
        }}
      />
    );
  }

  return (
    <Screen scroll background={T.background}>
      <Block kicker="Calendar" title="Unknown entry">
        <Meta>This activity type is not supported yet.</Meta>
      </Block>
    </Screen>
  );
}

function CustomEventEditor({
  event,
  onSave,
  onDelete,
}: {
  event: {
    id: string;
    title: string;
    notes: string;
    date: string;
    happenedAt: string;
    allDay: boolean;
  };
  onSave: (input: {
    title: string;
    notes?: string;
    date: string;
    happenedAt?: string;
    allDay?: boolean;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(event.title);
  const [notes, setNotes] = useState(event.notes);
  const [allDay, setAllDay] = useState(event.allDay !== false);
  const [time, setTime] = useState(
    clockTimeValue(event.happenedAt) || "09:00"
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave({
        title,
        notes,
        date: event.date,
        allDay,
        happenedAt: allDay
          ? event.happenedAt
          : isoFromDateAndTime(event.date, time),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll background={T.background}>
      <View style={{ paddingTop: 8, paddingBottom: 32 }}>
        <Back />
        <Text
          style={{
            marginTop: 18,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: T.kicker,
          }}
        >
          Your entry
        </Text>
        <Text style={{ marginTop: 8, fontSize: 15, color: T.muted }}>
          {formatLongDate(event.date)}
          {allDay ? " · all day" : ` · ${time}`}
        </Text>

        <Text
          style={{
            marginTop: 24,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(22,24,29,0.4)",
          }}
        >
          Title
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={{
            marginTop: 8,
            height: 48,
            borderWidth: 1,
            borderColor: "rgba(22,24,29,0.14)",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
            fontSize: 16,
            color: T.ink,
          }}
        />

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
          Notes
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{
            marginTop: 8,
            minHeight: 110,
            borderWidth: 1,
            borderColor: "rgba(22,24,29,0.14)",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
            paddingTop: 12,
            fontSize: 16,
            color: T.ink,
            textAlignVertical: "top",
          }}
        />

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
          When
        </Text>
        <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
          {(
            [
              { id: true, label: "All day" },
              { id: false, label: "Set a time" },
            ] as const
          ).map((row) => {
            const on = allDay === row.id;
            return (
              <Pressable
                key={String(row.id)}
                onPress={() => setAllDay(row.id)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: on ? "#C23B55" : "rgba(22,24,29,0.12)",
                  backgroundColor: on ? "rgba(194,59,85,0.08)" : "#FFFFFF",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
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
        {allDay ? null : (
          Platform.OS === "web" ? (
            createElement("input", {
              type: "time",
              value: time,
              onChange: (event: { target: { value: string } }) =>
                setTime(event.target.value || "09:00"),
              style: {
                marginTop: 8,
                height: 48,
                width: "100%",
                boxSizing: "border-box",
                borderWidth: 1,
                border: "1px solid rgba(22,24,29,0.14)",
                background: "#FFFFFF",
                paddingLeft: 14,
                paddingRight: 14,
                fontSize: 16,
                color: T.ink,
                outline: "none",
                colorScheme: "light",
              },
            })
          ) : (
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="09:00"
              placeholderTextColor="rgba(22,24,29,0.35)"
              style={{
                marginTop: 8,
                height: 48,
                borderWidth: 1,
                borderColor: "rgba(22,24,29,0.14)",
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 14,
                fontSize: 16,
                color: T.ink,
              }}
            />
          )
        )}

        <ItemReminders kind="custom" id={event.id} allDay={allDay} />

        {error ? (
          <Text style={{ marginTop: 12, fontSize: 14, color: T.accent }}>{error}</Text>
        ) : null}

        <View style={{ marginTop: 24, gap: 10 }}>
          <PrimaryButton
            label={saving ? "Saving…" : "Save changes"}
            onPress={() => void save()}
            disabled={saving}
          />
          <PrimaryButton
            label="Delete entry"
            tone="danger"
            onPress={() => void onDelete()}
          />
        </View>
      </View>
    </Screen>
  );
}
