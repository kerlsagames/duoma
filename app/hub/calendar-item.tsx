import { birthdayById, formatBirthdayDate } from "@/lib/birthdays";
import { curiosityQuestionById } from "@/lib/curiosityQuestions";
import { formatClockTime, formatLongDate } from "@/lib/dates";
import { HUB_TONES } from "@/lib/app-themes";
import { RITUALS } from "@/lib/hub";
import { useMiniApps } from "@/lib/mini-apps";
import { categoryById, questionById } from "@/lib/talk";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/ui/Screen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
    ritualChecks,
    talkDraws,
    listEntries,
    coupleLists,
    spicyDares,
    coupons,
    jarNotes,
    curiosityAnswers,
    scratches,
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

  if (kind === "ritual") {
    const row = ritualChecks.find((item) => item.id === id);
    const ritual = RITUALS.find((item) => item.id === row?.ritualId);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Ritual" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker="Ritual" title={ritual?.title ?? "Ritual"}>
          <Meta>{`${formatLongDate(row.date)} · checked by ${nameFor(row.userId)} · ${formatClockTime(row.createdAt)}`}</Meta>
          {ritual?.detail ? (
            <Panel>
              <Text style={{ fontSize: 15, color: T.muted, lineHeight: 22 }}>{ritual.detail}</Text>
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
    const question = curiosityQuestionById(answers[0]?.questionId ?? "");
    return (
      <Screen scroll background={T.background}>
        <Block kicker="Curiosity" title={question?.question ?? "Curiosity question"}>
          <Meta>{formatLongDate(id)}</Meta>
          <Panel>
            {answers.length === 0 ? (
              <Text style={{ color: T.muted }}>No answers saved.</Text>
            ) : (
              answers.map((answer) => (
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
              ))
            )}
          </Panel>
        </Block>
      </Screen>
    );
  }

  if (kind === "scratch") {
    const row = scratches.find((item) => item.id === id);
    if (!row) {
      return (
        <Screen scroll background={T.background}>
          <Block kicker="Scratch" title="Not found" />
        </Screen>
      );
    }
    return (
      <Screen scroll background={T.background}>
        <Block kicker={`Scratch · ${row.kind}`} title={row.title}>
          <Meta>{formatClockTime(row.createdAt)}</Meta>
          <Panel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: T.ink }}>{row.body}</Text>
          </Panel>
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
    return (
      <Screen scroll background={T.background}>
        <Block
          kicker={row.circle === "family" ? "Family birthday" : "Friends birthday"}
          title={row.name}
        >
          <Meta>{formatBirthdayDate(row.month, row.day)} · every year</Meta>
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
          <View style={{ marginTop: 22 }}>
            <PrimaryButton
              label="Open Travel"
              onPress={() => router.push("/hub/travel" as Href)}
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
  };
  onSave: (input: {
    title: string;
    notes?: string;
    date: string;
    happenedAt?: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(event.title);
  const [notes, setNotes] = useState(event.notes);
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
        happenedAt: event.happenedAt,
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
          {formatLongDate(event.date)} · {formatClockTime(event.happenedAt)}
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
