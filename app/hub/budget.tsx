import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { BUDGET_TONE as T, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { formatLongDate, localDateKey } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import {
  BILL_CADENCES,
  BILL_CATEGORIES,
  PAY_CADENCES,
  SPEND_CATEGORIES,
  billShareInPeriod,
  billStatus,
  budgetSnapshot,
  cadenceLabel,
  contributeToGoal,
  defaultPeriodStart,
  formatPeriodRange,
  inRange,
  isGoalReached,
  money,
  parseMoney,
  payInPeriod,
  shiftPeriod,
  sortedBills,
  type Bill,
  type BillCadence,
  type BillCategory,
  type PayCadence,
  type PaySource,
  type Spend,
  type SpendCategory,
  type SpendWho,
} from "@/lib/money";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { createElement, useMemo, useState, type ReactNode } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";

type Sheet = "pay" | "bill" | "spend" | "park" | null;
type PendingDelete =
  | { kind: "pay"; id: string }
  | { kind: "bill"; id: string }
  | { kind: "spend"; id: string }
  | null;

export default function BudgetScreen() {
  const router = useRouter();
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const today = localDateKey();
  const look = useAppLook("budget", T.accent, {
    hideAmounts: false,
    compactBills: false,
  });
  const budget = data.budget;
  const snap = useMemo(() => budgetSnapshot(budget, today), [budget, today]);
  const bills = useMemo(
    () => sortedBills(budget.bills, snap.start, snap.end),
    [budget.bills, snap.end, snap.start]
  );
  const current = inRange(today, snap.start, snap.end);
  const openGoals = data.goals.filter((row) => !isGoalReached(row));

  const [sheet, setSheet] = useState<Sheet>(null);
  const [editPayId, setEditPayId] = useState<string | null>(null);
  const [editBillId, setEditBillId] = useState<string | null>(null);
  const [payLabel, setPayLabel] = useState("");
  const [payAmt, setPayAmt] = useState("");
  const [payCadence, setPayCadence] = useState<PayCadence>("fortnight");
  const [billName, setBillName] = useState("");
  const [billAmt, setBillAmt] = useState("");
  const [billCadence, setBillCadence] = useState<BillCadence>("monthly");
  const [billCat, setBillCat] = useState<BillCategory>("housing");
  const [billDue, setBillDue] = useState(today);
  const [billNote, setBillNote] = useState("");
  const [spendName, setSpendName] = useState("");
  const [spendAmt, setSpendAmt] = useState("");
  const [spendCat, setSpendCat] = useState<SpendCategory>("groceries");
  const [spendDate, setSpendDate] = useState(today);
  const [spendWho, setSpendWho] = useState<SpendWho>("us");
  const [spendNote, setSpendNote] = useState("");
  const [parkGoalId, setParkGoalId] = useState<string | null>(null);
  const [parkAmt, setParkAmt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDelete>(null);

  const me = user?.displayName?.split(" ")[0] || "Me";
  const them = partner?.displayName?.split(" ")[0] || "Them";

  const saveBudget = async (
    fn: (current: typeof budget) => typeof budget
  ) => {
    await patch((state) => ({ ...state, budget: fn(state.budget) }));
  };

  const closeSheet = () => {
    setSheet(null);
    setEditPayId(null);
    setEditBillId(null);
    setError(null);
  };

  const openPay = (row?: PaySource) => {
    setEditPayId(row?.id ?? null);
    setPayLabel(row?.label ?? (data.budget.pays.length === 0 ? me : ""));
    setPayAmt(row ? String(row.amount) : "");
    setPayCadence(row?.cadence ?? budget.cycle);
    setError(null);
    setSheet("pay");
  };

  const openBill = (row?: Bill) => {
    setEditBillId(row?.id ?? null);
    setBillName(row?.name ?? "");
    setBillAmt(row ? String(row.amount) : "");
    setBillCadence(row?.cadence ?? "monthly");
    setBillCat(row?.category ?? "housing");
    setBillDue(row?.dueOn ?? today);
    setBillNote(row?.note ?? "");
    setError(null);
    setSheet("bill");
  };

  const openSpend = () => {
    setSpendName("");
    setSpendAmt("");
    setSpendCat("groceries");
    setSpendDate(inRange(today, snap.start, snap.end) ? today : snap.start);
    setSpendWho("us");
    setSpendNote("");
    setError(null);
    setSheet("spend");
  };

  const openPark = () => {
    setParkGoalId(openGoals[0]?.id ?? null);
    setParkAmt(snap.left > 0 ? String(Math.round(snap.left * 100) / 100) : "");
    setError(null);
    setSheet("park");
  };

  const setCycle = async (cycle: PayCadence) => {
    await saveBudget((current) => ({
      ...current,
      cycle,
      periodStart: defaultPeriodStart(today, cycle),
    }));
  };

  const movePeriod = async (direction: -1 | 1) => {
    await saveBudget((current) => ({
      ...current,
      periodStart: shiftPeriod(snap.start, current.cycle, direction),
    }));
  };

  const jumpCurrent = async () => {
    await saveBudget((current) => ({ ...current, periodStart: "" }));
  };

  const savePay = async () => {
    const n = parseMoney(payAmt);
    if (!payLabel.trim()) {
      setError("Who is this pay from?");
      return;
    }
    if (n == null || n <= 0) {
      setError("Pay needs a number.");
      return;
    }
    setError(null);
    await saveBudget((current) => {
      const next: PaySource = {
        id: editPayId ?? createId(),
        label: payLabel.trim(),
        amount: n,
        cadence: payCadence,
      };
      const pays = editPayId
        ? current.pays.map((row) => (row.id === editPayId ? next : row))
        : [...current.pays, next];
      return { ...current, pays };
    });
    closeSheet();
  };

  const saveBill = async () => {
    const n = parseMoney(billAmt);
    if (!billName.trim()) {
      setError("Name the bill.");
      return;
    }
    if (n == null || n <= 0) {
      setError("A bill needs an amount.");
      return;
    }
    if (!billDue) {
      setError("When is it next due?");
      return;
    }
    setError(null);
    await saveBudget((current) => {
      const next: Bill = {
        id: editBillId ?? createId(),
        name: billName.trim(),
        amount: n,
        cadence: billCadence,
        category: billCat,
        dueOn: billDue,
        note: billNote.trim(),
        paidPeriodStarts: current.bills.find((row) => row.id === editBillId)?.paidPeriodStarts ?? [],
      };
      const billsNext = editBillId
        ? current.bills.map((row) => (row.id === editBillId ? next : row))
        : [...current.bills, next];
      return { ...current, bills: billsNext };
    });
    closeSheet();
  };

  const saveSpend = async () => {
    const n = parseMoney(spendAmt);
    if (!spendName.trim()) {
      setError("What was it?");
      return;
    }
    if (n == null || n <= 0) {
      setError("Spending needs an amount.");
      return;
    }
    setError(null);
    await saveBudget((current) => ({
      ...current,
      spends: [
        {
          id: createId(),
          name: spendName.trim(),
          amount: n,
          category: spendCat,
          date: spendDate || today,
          who: spendWho,
          note: spendNote.trim(),
        },
        ...current.spends,
      ],
    }));
    closeSheet();
  };

  const togglePaid = async (bill: Bill) => {
    const paid = bill.paidPeriodStarts.includes(snap.start);
    await saveBudget((current) => ({
      ...current,
      bills: current.bills.map((row) => {
        if (row.id !== bill.id) return row;
        if (paid) {
          return {
            ...row,
            paidPeriodStarts: row.paidPeriodStarts.filter((key) => key !== snap.start),
          };
        }
        return {
          ...row,
          paidPeriodStarts: [...row.paidPeriodStarts, snap.start],
        };
      }),
    }));
  };

  const park = async () => {
    const goal = data.goals.find((row) => row.id === parkGoalId);
    const n = parseMoney(parkAmt);
    if (!goal) {
      setError("Pick a goal.");
      return;
    }
    if (n == null || n <= 0) {
      setError("How much are you parking?");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      goals: state.goals.map((row) => (row.id === goal.id ? contributeToGoal(row, n) : row)),
      budget: {
        ...state.budget,
        spends: [
          {
            id: createId(),
            name: `Parked: ${goal.title}`,
            amount: n,
            category: "savings" as const,
            date: inRange(today, snap.start, snap.end) ? today : snap.end,
            who: "us" as const,
            note: "",
          },
          ...state.budget.spends,
        ],
      },
    }));
    closeSheet();
  };

  const confirmDelete = async () => {
    if (!pending) return;
    if (pending.kind === "pay") {
      await saveBudget((current) => ({
        ...current,
        pays: current.pays.filter((row) => row.id !== pending.id),
      }));
    } else if (pending.kind === "bill") {
      await saveBudget((current) => ({
        ...current,
        bills: current.bills.filter((row) => row.id !== pending.id),
      }));
    } else {
      await saveBudget((current) => ({
        ...current,
        spends: current.spends.filter((row) => row.id !== pending.id),
      }));
    }
    setPending(null);
  };

  const pendingCopy = (() => {
    if (!pending) return { title: "", body: "" };
    if (pending.kind === "pay") {
      const row = budget.pays.find((item) => item.id === pending.id);
      return {
        title: "Remove this pay?",
        body: row ? `${row.label} will leave the period income.` : "",
      };
    }
    if (pending.kind === "bill") {
      const row = budget.bills.find((item) => item.id === pending.id);
      return {
        title: "Remove this bill?",
        body: row ? `${row.name} comes off the recurring list.` : "",
      };
    }
    const row = budget.spends.find((item) => item.id === pending.id);
    return {
      title: "Remove this spend?",
      body: row ? `${row.name} will drop out of this period.` : "",
    };
  })();

  const incomePct = snap.income > 0 ? Math.min(100, (snap.billShare / snap.income) * 100) : 0;
  const spentPct = snap.income > 0 ? Math.min(100 - incomePct, (snap.spent / snap.income) * 100) : 0;
  const leftPct = Math.max(0, 100 - incomePct - spentPct);

  return (
    <View style={{ flex: 1, backgroundColor: T.background }}>
      <Screen scroll background={T.background} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
        <Stage
          background={T.background}
          fallback={"/hub/home-base" as Href}
          accent={look.accent}
          settingsLabel="Shared budget"
          settings={
            <LookPanel
              look={look}
              ink={T.ink}
              muted={T.muted}
            pageColor={T.background}
              toggles={[
                {
                  key: "hideAmounts",
                  label: "Glance mode",
                  hint: "Hide dollar amounts so the phone isn’t a billboard.",
                },
                {
                  key: "compactBills",
                  label: "Compact bills",
                  hint: "Tighter rows on the ledger.",
                },
              ]}
            />
          }
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              color: T.accent,
            }}
          >
            HOME BASE
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
            Shared budget
          </Text>
          <Text style={{ marginTop: 8, fontSize: 15, lineHeight: 22, color: T.muted }}>
            Put pay in. Add the bills. Log what you actually spent. What’s left is the truth for
            this week or fortnight.
          </Text>
          <Pressable
            onPress={() => router.push("/hub/goals" as Href)}
            style={{ marginTop: 10, alignSelf: "flex-start" }}
          >
            <Text style={{ color: T.gold, fontSize: 14, fontWeight: "700" }}>
              Saving toward something? Shared goals →
            </Text>
          </Pressable>

          {!ready ? (
            <Text style={{ marginTop: 24, color: T.muted }}>Opening the books…</Text>
          ) : (
            <>
              <View style={{ marginTop: 18, flexDirection: "row", gap: 8 }}>
                {PAY_CADENCES.map((row) => (
                  <Pressable
                    key={row.id}
                    onPress={() => void setCycle(row.id)}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: budget.cycle === row.id ? T.accent : T.surface,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "800",
                        color: budget.cycle === row.id ? "#12160F" : T.ink,
                      }}
                    >
                      {row.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View
                style={{
                  marginTop: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Pressable
                  onPress={() => void movePeriod(-1)}
                  hitSlop={10}
                  accessibilityLabel="Previous period"
                >
                  <Ionicons name="chevron-back" size={22} color={T.ink} />
                </Pressable>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontFamily: SERIF, fontSize: 20, color: T.ink }}>
                    {formatPeriodRange(snap.start, snap.end)}
                  </Text>
                  <Text style={{ marginTop: 2, color: T.muted, fontSize: 12 }}>
                    {current ? "This period" : "Looking back"}
                  </Text>
                </View>
                <Pressable
                  onPress={() => void movePeriod(1)}
                  hitSlop={10}
                  accessibilityLabel="Next period"
                >
                  <Ionicons name="chevron-forward" size={22} color={T.ink} />
                </Pressable>
              </View>
              {!current ? (
                <Pressable onPress={() => void jumpCurrent()} style={{ marginTop: 8 }}>
                  <Text style={{ textAlign: "center", color: T.accent, fontWeight: "700" }}>
                    Jump to this period
                  </Text>
                </Pressable>
              ) : null}

              <View
                style={{
                  marginTop: 16,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <Metric label="Pay in" value={money(snap.income)} />
                <Metric label="Bills share" value={money(snap.billShare)} />
                <Metric label="Spent" value={money(snap.spent)} />
                <Metric
                  label="Left"
                  value={money(snap.left)}
                  warn={snap.left < 0}
                />
              </View>

              {snap.income > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <View
                    style={{
                      height: 14,
                      borderRadius: 99,
                      backgroundColor: T.surface,
                      overflow: "hidden",
                      flexDirection: "row",
                    }}
                  >
                    <View style={{ width: `${incomePct}%`, backgroundColor: "#E0896A" }} />
                    <View style={{ width: `${spentPct}%`, backgroundColor: "#8FA8C8" }} />
                    <View style={{ width: `${leftPct}%`, backgroundColor: T.accent }} />
                  </View>
                  <View
                    style={{
                      marginTop: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Legend color="#E0896A" label="Bills" />
                    <Legend color="#8FA8C8" label="Spent" />
                    <Legend color={T.accent} label="Left" />
                  </View>
                </View>
              ) : (
                <EmptyBlock text="Add weekly or fortnight pay to see what’s left after bills and spending." />
              )}

              <Section
                title="Pay"
                action="Add pay"
                onAction={() => openPay()}
              >
                {budget.pays.length === 0 ? (
                  <Text style={{ color: T.muted, lineHeight: 21 }}>
                    Each of you can have a line — weekly or fortnight. Side hustles too.
                  </Text>
                ) : (
                  <View style={{ gap: 8 }}>
                    {budget.pays.map((row) => (
                      <Row
                        key={row.id}
                        title={row.label}
                        meta={`${row.cadence === "weekly" ? "Weekly" : "Fortnight"} · ${money(row.amount)} / ${cadenceLabel(row.cadence)}`}
                        value={money(payInPeriod(row, budget.cycle))}
                        onPress={() => openPay(row)}
                        onRemove={() => setPending({ kind: "pay", id: row.id })}
                      />
                    ))}
                  </View>
                )}
              </Section>

              <Section title="Bills" action="Add bill" onAction={() => openBill()}>
                <Text style={{ color: T.dim, fontSize: 13, lineHeight: 19, marginBottom: 10 }}>
                  Monthly bills are averaged into this {budget.cycle === "weekly" ? "week" : "fortnight"} so rent still counts even when it isn’t due today.
                </Text>
                {bills.length === 0 ? (
                  <Text style={{ color: T.muted, lineHeight: 21 }}>
                    Rent, power, phones, subscriptions — anything that comes back.
                  </Text>
                ) : (
                  <View style={{ gap: 8 }}>
                    {bills.map((row) => {
                      const status = billStatus(row, snap.start, snap.end);
                      return (
                        <View
                          key={row.id}
                          style={card}
                        >
                          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                            <Pressable
                              onPress={() => void togglePaid(row)}
                              accessibilityLabel={
                                status === "paid" ? `Unmark ${row.name} paid` : `Mark ${row.name} paid`
                              }
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 8,
                                marginTop: 2,
                                borderWidth: 1.5,
                                borderColor: status === "paid" ? T.paid : T.border,
                                backgroundColor: status === "paid" ? T.paid : "transparent",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {status === "paid" ? (
                                <Ionicons name="checkmark" size={16} color="#12160F" />
                              ) : null}
                            </Pressable>
                            <Pressable onPress={() => openBill(row)} style={{ flex: 1 }}>
                              <Text style={{ color: T.ink, fontWeight: "700", fontSize: 16 }}>
                                {row.name}
                              </Text>
                              <Text style={{ marginTop: 3, color: T.muted, fontSize: 12 }}>
                                {money(row.amount)} / {cadenceLabel(row.cadence)} · due{" "}
                                {formatLongDate(row.dueOn)}
                              </Text>
                              <Text style={{ marginTop: 2, color: T.dim, fontSize: 12 }}>
                                Share this period {money(billShareInPeriod(row, budget.cycle))}
                                {status === "overdue"
                                  ? " · overdue"
                                  : status === "due"
                                    ? " · due now"
                                    : status === "paid"
                                      ? " · paid"
                                      : ""}
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => setPending({ kind: "bill", id: row.id })}
                              hitSlop={8}
                              accessibilityLabel={`Remove ${row.name}`}
                            >
                              <Ionicons name="trash-outline" size={18} color={T.dim} />
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Section>

              <Section title="Spending" action="Add spend" onAction={openSpend}>
                {snap.spends.length === 0 ? (
                  <Text style={{ color: T.muted, lineHeight: 21 }}>
                    Groceries, fuel, the unexpected. Log it when it leaves the account.
                  </Text>
                ) : (
                  <View style={{ gap: 8 }}>
                    {snap.spends.map((row) => (
                      <Row
                        key={row.id}
                        title={row.name}
                        meta={`${formatLongDate(row.date)} · ${SPEND_CATEGORIES.find((c) => c.id === row.category)?.label ?? row.category} · ${whoLabel(row.who, me, them)}`}
                        value={money(row.amount)}
                        onRemove={() => setPending({ kind: "spend", id: row.id })}
                      />
                    ))}
                  </View>
                )}
              </Section>

              {snap.spendByCategory.length > 0 ? (
                <Section title="Where it went">
                  <View style={{ gap: 8 }}>
                    {snap.spendByCategory.map((row) => (
                      <View
                        key={row.id}
                        style={{ flexDirection: "row", justifyContent: "space-between" }}
                      >
                        <Text style={{ color: T.muted }}>{row.label}</Text>
                        <Text style={{ color: T.ink, fontFamily: "SpaceMono", fontSize: 13 }}>
                          {money(row.total)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Section>
              ) : null}

              {snap.left > 0 && openGoals.length > 0 ? (
                <Pressable
                  onPress={openPark}
                  style={{
                    marginTop: 18,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: T.gold,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#1A1408", fontWeight: "800" }}>
                    Park leftover in a goal
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </Stage>
      </Screen>

      {sheet === "pay" ? (
        <SheetOverlay
          kicker={editPayId ? "EDIT" : "INCOME"}
          title={editPayId ? "Edit pay" : "Add pay"}
          onClose={closeSheet}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={label}>Name</Text>
          <TextInput
            value={payLabel}
            onChangeText={setPayLabel}
            placeholder={`${me}'s payday`}
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Amount each payday</Text>
          <TextInput
            value={payAmt}
            onChangeText={setPayAmt}
            keyboardType="decimal-pad"
            placeholder="1840"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>How often</Text>
          <ChipRow
            items={PAY_CADENCES.map((row) => ({ id: row.id, label: row.label }))}
            value={payCadence}
            onChange={setPayCadence}
          />
          {error ? <Text style={err}>{error}</Text> : null}
          <SaveButton label="Save pay" onPress={() => void savePay()} />
        </SheetOverlay>
      ) : null}

      {sheet === "bill" ? (
        <SheetOverlay
          kicker={editBillId ? "EDIT" : "RECURRING"}
          title={editBillId ? "Edit bill" : "Add bill"}
          onClose={closeSheet}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={label}>Name</Text>
          <TextInput
            value={billName}
            onChangeText={setBillName}
            placeholder="Rent"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Amount</Text>
          <TextInput
            value={billAmt}
            onChangeText={setBillAmt}
            keyboardType="decimal-pad"
            placeholder="1800"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Cadence</Text>
          <ChipRow
            items={BILL_CADENCES}
            value={billCadence}
            onChange={setBillCadence}
          />
          <Text style={[label, { marginTop: 14 }]}>Category</Text>
          <ChipRow items={BILL_CATEGORIES} value={billCat} onChange={setBillCat} />
          <Text style={[label, { marginTop: 14 }]}>Next due</Text>
          <DateKeyField value={billDue} onChange={setBillDue} />
          <Text style={[label, { marginTop: 14 }]}>Note (optional)</Text>
          <TextInput
            value={billNote}
            onChangeText={setBillNote}
            placeholder="Account, reference, who pays"
            placeholderTextColor={T.dim}
            style={field}
          />
          {error ? <Text style={err}>{error}</Text> : null}
          <SaveButton label="Save bill" onPress={() => void saveBill()} />
        </SheetOverlay>
      ) : null}

      {sheet === "spend" ? (
        <SheetOverlay
          kicker="OUT"
          title="Add spending"
          onClose={closeSheet}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={label}>What</Text>
          <TextInput
            value={spendName}
            onChangeText={setSpendName}
            placeholder="Woolworths"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Amount</Text>
          <TextInput
            value={spendAmt}
            onChangeText={setSpendAmt}
            keyboardType="decimal-pad"
            placeholder="86.40"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Category</Text>
          <ChipRow items={SPEND_CATEGORIES} value={spendCat} onChange={setSpendCat} />
          <Text style={[label, { marginTop: 14 }]}>Date</Text>
          <DateKeyField value={spendDate} onChange={setSpendDate} />
          <Text style={[label, { marginTop: 14 }]}>Who paid</Text>
          <ChipRow
            items={[
              { id: "us" as const, label: "Us" },
              { id: "me" as const, label: me },
              { id: "them" as const, label: them },
            ]}
            value={spendWho}
            onChange={setSpendWho}
          />
          <Text style={[label, { marginTop: 14 }]}>Note (optional)</Text>
          <TextInput
            value={spendNote}
            onChangeText={setSpendNote}
            placeholder="Split, card, why"
            placeholderTextColor={T.dim}
            style={field}
          />
          {error ? <Text style={err}>{error}</Text> : null}
          <SaveButton label="Log spending" onPress={() => void saveSpend()} />
        </SheetOverlay>
      ) : null}

      {sheet === "park" ? (
        <SheetOverlay
          kicker="LEFTOVER"
          title="Park in a goal"
          onClose={closeSheet}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={{ color: T.muted, marginBottom: 12, lineHeight: 21 }}>
            Logs as spending so this period’s leftover drops, and the dollars land on the goal.
          </Text>
          <View style={{ gap: 8 }}>
            {openGoals.map((goal) => (
              <Pressable
                key={goal.id}
                onPress={() => setParkGoalId(goal.id)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: parkGoalId === goal.id ? goal.color : T.border,
                  backgroundColor: T.surface,
                }}
              >
                <Text style={{ color: T.ink, fontWeight: "700" }}>{goal.title}</Text>
                <Text style={{ marginTop: 2, color: T.muted, fontSize: 12 }}>
                  {money(goal.saved)} / {money(goal.target)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[label, { marginTop: 14 }]}>Amount</Text>
          <TextInput
            value={parkAmt}
            onChangeText={setParkAmt}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={T.dim}
            style={field}
          />
          {error ? <Text style={err}>{error}</Text> : null}
          <SaveButton label="Park it" onPress={() => void park()} gold />
        </SheetOverlay>
      ) : null}

      <ConfirmDialog
        open={Boolean(pending)}
        title={pendingCopy.title}
        body={pendingCopy.body}
        confirmLabel="Remove"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPending(null)}
      />
    </View>
  );
}

function whoLabel(who: SpendWho, me: string, them: string) {
  if (who === "me") return me;
  if (who === "them") return them;
  return "Us";
}

function Metric({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <View
      style={{
        width: "48%",
        flexGrow: 1,
        padding: 12,
        borderRadius: 14,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderColor: T.border,
      }}
    >
      <Text style={{ fontFamily: "SpaceMono", fontSize: 10, letterSpacing: 1.4, color: T.muted }}>
        {label.toUpperCase()}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontSize: 22,
          color: warn ? T.danger : T.ink,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: color }} />
      <Text style={{ color: T.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <View style={{ marginTop: 22 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text
          style={{
            flex: 1,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: T.muted,
          }}
        >
          {title.toUpperCase()}
        </Text>
        {action && onAction ? (
          <Pressable onPress={onAction}>
            <Text style={{ color: T.accent, fontWeight: "700", fontSize: 13 }}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <View
      style={{
        marginTop: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.surface,
      }}
    >
      <Text style={{ color: T.muted, lineHeight: 21 }}>{text}</Text>
    </View>
  );
}

function Row({
  title,
  meta,
  value,
  onPress,
  onRemove,
}: {
  title: string;
  meta: string;
  value: string;
  onPress?: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={card}>
      <Pressable onPress={onPress} disabled={!onPress} style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: T.ink, fontWeight: "700", fontSize: 16 }}>{title}</Text>
        <Text style={{ marginTop: 3, color: T.muted, fontSize: 12 }}>{meta}</Text>
      </Pressable>
      <Text style={{ color: T.ink, fontFamily: "SpaceMono", fontSize: 13, marginRight: 8 }}>
        {value}
      </Text>
      <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${title}`}>
        <Ionicons name="trash-outline" size={18} color={T.dim} />
      </Pressable>
    </View>
  );
}

function ChipRow<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
      {items.map((row) => {
        const on = row.id === value;
        return (
          <Pressable
            key={row.id}
            onPress={() => onChange(row.id)}
            style={{
              paddingHorizontal: 12,
              height: 36,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: on ? T.accent : T.surface,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 13, color: on ? "#12160F" : T.ink }}>
              {row.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DateKeyField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  if (Platform.OS === "web") {
    return createElement("input", {
      type: "date",
      value,
      onChange: (event: { target: { value: string } }) => onChange(event.target.value),
      style: {
        width: "100%",
        marginTop: 6,
        boxSizing: "border-box",
        borderRadius: 12,
        border: "1px solid rgba(198,226,122,0.22)",
        background: T.surface,
        color: T.ink,
        padding: "12px",
        fontSize: 16,
        outline: "none",
        colorScheme: "dark",
        accentColor: T.accent,
      },
    });
  }
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={T.dim}
      style={field}
    />
  );
}

function SaveButton({
  label,
  onPress,
  gold,
}: {
  label: string;
  onPress: () => void;
  gold?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginTop: 18,
        height: 50,
        borderRadius: 16,
        backgroundColor: gold ? T.gold : T.accent,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontWeight: "800", color: "#12160F" }}>{label}</Text>
    </Pressable>
  );
}

const card = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  padding: 12,
  borderRadius: 14,
  backgroundColor: T.surface,
  borderWidth: 1,
  borderColor: T.border,
};

const label = {
  fontFamily: "SpaceMono" as const,
  fontSize: 11,
  letterSpacing: 1.6,
  color: T.muted,
};

const field = {
  marginTop: 6,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: T.surface,
  color: T.ink,
  fontSize: 16,
} as const;

const err = { marginTop: 12, color: T.danger } as const;
