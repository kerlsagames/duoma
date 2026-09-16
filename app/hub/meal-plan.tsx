import { RestoreDefaultsButton } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, MEAL_PLAN_TONE as T, SERIF } from "@/lib/app-themes";
import {
  addIdea,
  addMealWeek,
  addRegular,
  clearMealNotes,
  ideasInCategory,
  NOTE_PALETTES,
  NOTE_SIZES,
  noteHeading,
  notePaper,
  noteSize,
  noteTilt,
  pickLuckyIdea,
  removeIdea,
  removeRegular,
  setNoteMeal,
  toggleNoteEaten,
  updateIdea,
  type MealPlanIdea,
  type MealPlanNote,
  type MealPlanPalette,
  type MealPlanSize,
  type MealPlanView,
  type MealRegular,
} from "@/lib/meal-plan";
import { MEAL_CATEGORIES, mealCategoryMeta, type MealCategoryId } from "@/lib/meals";
import { useMiniApps } from "@/lib/mini-apps";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Panel = "board" | "settings";
type SettingsTab = "look" | "regulars" | "ideas";
type IdeaFilter = "all" | MealCategoryId;

export default function MealPlanScreen() {
  const { data, patch } = useMiniApps();
  const plan = data.mealPlan;
  const look = noteSize(plan.size);

  const [panel, setPanel] = useState<Panel>("board");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("look");
  const [composeId, setComposeId] = useState<string | null>(null);
  const [composeText, setComposeText] = useState("");
  const [regularsFor, setRegularsFor] = useState<string | null>(null);
  const [luckyFor, setLuckyFor] = useState<string | null>(null);
  const [luckyPick, setLuckyPick] = useState<MealPlanIdea | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [removeRegularId, setRemoveRegularId] = useState<string | null>(null);
  const [removeIdeaId, setRemoveIdeaId] = useState<string | null>(null);
  const [ideaFilter, setIdeaFilter] = useState<IdeaFilter>("all");
  const [draftRegular, setDraftRegular] = useState("");
  const [draftIdea, setDraftIdea] = useState("");
  const [draftIdeaCat, setDraftIdeaCat] = useState<MealCategoryId>("easy");
  const [editIdeaId, setEditIdeaId] = useState<string | null>(null);
  const [editIdeaTitle, setEditIdeaTitle] = useState("");
  const [regularError, setRegularError] = useState<string | null>(null);
  const [ideaError, setIdeaError] = useState<string | null>(null);

  const composeNote = plan.notes.find((row) => row.id === composeId) ?? null;
  const regularsNote = plan.notes.find((row) => row.id === regularsFor) ?? null;
  const luckyNote = plan.notes.find((row) => row.id === luckyFor) ?? null;
  const pendingRegular =
    plan.regulars.find((row) => row.id === removeRegularId) ?? null;
  const pendingIdea = plan.ideas.find((row) => row.id === removeIdeaId) ?? null;

  const filteredIdeas = useMemo(
    () => ideasInCategory(plan.ideas, ideaFilter),
    [ideaFilter, plan.ideas]
  );

  const updatePlan = (
    fn: (current: typeof plan) => typeof plan
  ) => patch((state) => ({ ...state, mealPlan: fn(state.mealPlan) }));

  const openCompose = (note: MealPlanNote) => {
    setComposeText(note.title);
    setComposeId(note.id);
  };

  const saveCompose = async () => {
    if (!composeId) return;
    const title = composeText.trim();
    await updatePlan((current) => ({
      ...current,
      notes: setNoteMeal(current.notes, composeId, title, title ? "typed" : null),
    }));
    setComposeId(null);
    setComposeText("");
  };

  const pickRegular = async (regular: MealRegular) => {
    if (!regularsFor) return;
    await updatePlan((current) => ({
      ...current,
      notes: setNoteMeal(current.notes, regularsFor, regular.title, "regular"),
    }));
    setRegularsFor(null);
  };

  const openLucky = (note: MealPlanNote) => {
    setLuckyPick(pickLuckyIdea(plan.ideas));
    setLuckyFor(note.id);
  };

  const spinAgain = () => {
    setLuckyPick(pickLuckyIdea(plan.ideas, luckyPick?.id));
  };

  const acceptLucky = async () => {
    if (!luckyFor || !luckyPick) return;
    await updatePlan((current) => ({
      ...current,
      notes: setNoteMeal(current.notes, luckyFor, luckyPick.title, "lucky"),
    }));
    setLuckyFor(null);
    setLuckyPick(null);
  };

  const markEaten = async (note: MealPlanNote) => {
    if (!note.title.trim()) return;
    await updatePlan((current) => ({
      ...current,
      notes: toggleNoteEaten(current.notes, note.id),
    }));
  };

  const addWeek = async () => {
    await updatePlan((current) => ({
      ...current,
      notes: addMealWeek(current.notes),
    }));
  };

  const confirmClear = async () => {
    setClearOpen(false);
    await updatePlan((current) => ({
      ...current,
      notes: clearMealNotes(),
    }));
  };

  const saveRegular = async () => {
    const title = draftRegular.trim();
    if (!title) {
      setRegularError("Type a dinner you make on repeat.");
      return;
    }
    setRegularError(null);
    await updatePlan((current) => ({
      ...current,
      regulars: addRegular(current.regulars, title),
    }));
    setDraftRegular("");
  };

  const confirmRemoveRegular = async () => {
    if (!removeRegularId) return;
    const id = removeRegularId;
    setRemoveRegularId(null);
    await updatePlan((current) => ({
      ...current,
      regulars: removeRegular(current.regulars, id),
    }));
  };

  const saveIdea = async () => {
    const title = draftIdea.trim();
    if (!title) {
      setIdeaError("Give the idea a name.");
      return;
    }
    setIdeaError(null);
    await updatePlan((current) => ({
      ...current,
      ideas: addIdea(current.ideas, title, draftIdeaCat),
    }));
    setDraftIdea("");
  };

  const saveIdeaEdit = async () => {
    if (!editIdeaId) return;
    const title = editIdeaTitle.trim();
    if (!title) return;
    await updatePlan((current) => ({
      ...current,
      ideas: updateIdea(current.ideas, editIdeaId, { title }),
    }));
    setEditIdeaId(null);
    setEditIdeaTitle("");
  };

  const confirmRemoveIdea = async () => {
    if (!removeIdeaId) return;
    const id = removeIdeaId;
    setRemoveIdeaId(null);
    await updatePlan((current) => ({
      ...current,
      ideas: removeIdea(current.ideas, id),
    }));
  };

  return (
    <Screen scroll background={T.background}>
      <Stage background={T.background} fallback={"/hub/home-base" as Href} accent={T.accent}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: T.accent,
              }}
            >
              Home Base · Kitchen
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
              {panel === "settings" ? "Settings" : "Meal Plan"}
            </Text>
            {panel === "settings" ? (
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: SERIF,
                  fontSize: 15,
                  lineHeight: 22,
                  color: T.muted,
                }}
              >
                How the board looks, plus regulars and lucky ideas.
              </Text>
            ) : null}
          </View>
          <View style={{ alignItems: "flex-end", gap: 8 }}>
            {panel === "board" ? (
              <Pressable
                onPress={() => setClearOpen(true)}
                accessibilityLabel="Clear all notes"
                style={{
                  height: 36,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: T.surfaceRaised,
                  borderWidth: 1,
                  borderColor: T.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "SpaceMono", fontSize: 11, color: T.ink }}>
                  Clear all
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setPanel("board")}
                accessibilityLabel="Back to the board"
                style={{
                  height: 36,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: T.surfaceRaised,
                  borderWidth: 1,
                  borderColor: T.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "SpaceMono", fontSize: 11, color: T.ink }}>
                  Board
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setPanel((prev) => (prev === "settings" ? "board" : "settings"))}
              accessibilityLabel="Meal plan settings"
              style={{
                height: 44,
                width: 44,
                borderRadius: 16,
                backgroundColor: T.surfaceRaised,
                borderWidth: 1,
                borderColor: T.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={panel === "settings" ? "close" : "settings-outline"}
                size={20}
                color={T.accent}
              />
            </Pressable>
          </View>
        </View>

        {panel === "board" ? (
          <>
            <View
              style={{
                marginTop: 18,
                padding: plan.view === "list" ? 10 : 12,
                borderRadius: 18,
                backgroundColor: T.cork,
                borderWidth: 2,
                borderColor: T.corkLight,
              }}
            >
              <View
                style={{
                  flexDirection: plan.view === "list" ? "column" : "row",
                  flexWrap: plan.view === "list" ? "nowrap" : "wrap",
                  justifyContent: "space-between",
                  rowGap: plan.view === "list" ? 8 : 12,
                }}
              >
                {plan.notes.map((note, index) => (
                  <View
                    key={note.id}
                    style={{
                      width: plan.view === "list" ? "100%" : "48%",
                    }}
                  >
                    <PostIt
                      note={note}
                      paper={notePaper(index, plan.palette)}
                      tilt={plan.view === "list" ? 0 : noteTilt(index)}
                      list={plan.view === "list"}
                      minHeight={look.minHeight}
                      titleSize={look.title}
                      titleLine={look.titleLine}
                      onType={() => openCompose(note)}
                      onRegulars={() => setRegularsFor(note.id)}
                      onLucky={() => openLucky(note)}
                      onEaten={() => markEaten(note)}
                    />
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              onPress={addWeek}
              accessibilityLabel="Add more post-it notes"
              style={{
                marginTop: 16,
                height: 52,
                borderRadius: 16,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: "rgba(246,239,226,0.35)",
                backgroundColor: T.surface,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Ionicons name="add" size={20} color={T.accent} />
              <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
                More post-it notes
              </Text>
            </Pressable>
            <Text
              style={{
                marginTop: 8,
                fontFamily: SERIF,
                fontSize: 13,
                color: T.muted,
                textAlign: "center",
              }}
            >
              Adds another week — handy for a fortnight plan.
            </Text>
          </>
        ) : (
          <SettingsPanel
            tab={settingsTab}
            onTab={setSettingsTab}
            view={plan.view}
            size={plan.size}
            palette={plan.palette}
            onView={(view) => void updatePlan((current) => ({ ...current, view }))}
            onSize={(size) => void updatePlan((current) => ({ ...current, size }))}
            onPalette={(palette) =>
              void updatePlan((current) => ({ ...current, palette }))
            }
            onRestoreLook={() =>
              void updatePlan((current) => ({
                ...current,
                view: "board",
                size: "m",
                palette: "mix",
              }))
            }
            regulars={plan.regulars}
            ideas={filteredIdeas}
            ideaTotal={plan.ideas.length}
            ideaFilter={ideaFilter}
            onFilter={setIdeaFilter}
            draftRegular={draftRegular}
            onDraftRegular={setDraftRegular}
            regularError={regularError}
            onAddRegular={saveRegular}
            onRemoveRegular={setRemoveRegularId}
            draftIdea={draftIdea}
            onDraftIdea={setDraftIdea}
            draftIdeaCat={draftIdeaCat}
            onDraftIdeaCat={setDraftIdeaCat}
            ideaError={ideaError}
            onAddIdea={saveIdea}
            editIdeaId={editIdeaId}
            editIdeaTitle={editIdeaTitle}
            onEditIdea={(idea) => {
              setEditIdeaId(idea.id);
              setEditIdeaTitle(idea.title);
            }}
            onEditTitle={setEditIdeaTitle}
            onSaveEdit={saveIdeaEdit}
            onCancelEdit={() => {
              setEditIdeaId(null);
              setEditIdeaTitle("");
            }}
            onRemoveIdea={setRemoveIdeaId}
          />
        )}
      </Stage>

      <Modal
        visible={Boolean(composeNote)}
        transparent
        animationType="fade"
        onRequestClose={() => setComposeId(null)}
      >
        <View style={modalWrap}>
          <View style={modalCard}>
            <Text style={modalKicker}>Write dinner</Text>
            <Text style={modalTitle}>
              {composeNote ? noteHeading(composeNote) : "Dinner"}
            </Text>
            <TextInput
              value={composeText}
              onChangeText={setComposeText}
              placeholder="What’s for dinner?"
              placeholderTextColor="rgba(42,33,22,0.4)"
              autoFocus
              style={modalInput}
            />
            <View style={{ marginTop: 16, gap: 8 }}>
              <Pressable onPress={saveCompose} style={modalPrimary}>
                <Text style={modalPrimaryText}>Stick it</Text>
              </Pressable>
              <Pressable onPress={() => setComposeId(null)} style={modalGhost}>
                <Text style={modalGhostText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(regularsNote)}
        transparent
        animationType="fade"
        onRequestClose={() => setRegularsFor(null)}
      >
        <View style={modalWrap}>
          <View style={modalCard}>
            <Text style={modalKicker}>Regulars</Text>
            <Text style={modalTitle}>
              {regularsNote ? noteHeading(regularsNote) : "Pick a regular"}
            </Text>
            {plan.regulars.length === 0 ? (
              <Text style={{ marginTop: 12, fontFamily: SERIF, fontSize: 15, color: T.paperMuted }}>
                No regulars yet. Add them in the cog.
              </Text>
            ) : (
              <ScrollView style={{ marginTop: 12, maxHeight: 280 }}>
                {plan.regulars.map((row) => (
                  <Pressable
                    key={row.id}
                    onPress={() => pickRegular(row)}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(42,33,22,0.08)",
                    }}
                  >
                    <Text style={{ fontFamily: SERIF, fontSize: 17, color: T.paperInk }}>
                      {row.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Pressable
              onPress={() => setRegularsFor(null)}
              style={[modalGhost, { marginTop: 14 }]}
            >
              <Text style={modalGhostText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(luckyNote)}
        transparent
        animationType="fade"
        onRequestClose={() => setLuckyFor(null)}
      >
        <View style={modalWrap}>
          <View style={[modalCard, { backgroundColor: "#FFE566" }]}>
            <Text style={modalKicker}>Feeling lucky</Text>
            {luckyPick ? (
              <>
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: HANDWRITING,
                    fontSize: 30,
                    lineHeight: 36,
                    color: T.paperInk,
                  }}
                >
                  {luckyPick.title}
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: T.paperMuted,
                  }}
                >
                  {mealCategoryMeta(luckyPick.category).label}
                </Text>
              </>
            ) : (
              <Text style={{ marginTop: 12, fontFamily: SERIF, fontSize: 15, color: T.paperMuted }}>
                Add some food ideas in settings first.
              </Text>
            )}
            <View style={{ marginTop: 18, gap: 8 }}>
              {luckyPick ? (
                <Pressable onPress={acceptLucky} style={modalPrimary}>
                  <Text style={modalPrimaryText}>Yep, that’s dinner</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={spinAgain} style={modalGhost}>
                <Text style={modalGhostText}>
                  {luckyPick ? "Spin again" : "Try again"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setLuckyFor(null);
                  setLuckyPick(null);
                }}
                style={modalGhost}
              >
                <Text style={modalGhostText}>Not now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        open={clearOpen}
        title="Clear the board?"
        body="Every post-it goes back to a blank week. Regulars and food ideas stay put."
        confirmLabel="Clear all"
        cancelLabel="Keep them"
        onConfirm={confirmClear}
        onCancel={() => setClearOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(pendingRegular)}
        title="Remove this regular?"
        body={
          pendingRegular
            ? `${pendingRegular.title} leaves the dropdown. You can add it again later.`
            : ""
        }
        confirmLabel="Remove"
        cancelLabel="Keep it"
        onConfirm={confirmRemoveRegular}
        onCancel={() => setRemoveRegularId(null)}
      />
      <ConfirmDialog
        open={Boolean(pendingIdea)}
        title="Remove this idea?"
        body={
          pendingIdea
            ? `${pendingIdea.title} leaves the randomiser.`
            : ""
        }
        confirmLabel="Remove"
        cancelLabel="Keep it"
        onConfirm={confirmRemoveIdea}
        onCancel={() => setRemoveIdeaId(null)}
      />
    </Screen>
  );
}

function PostIt({
  note,
  paper,
  tilt,
  list,
  minHeight,
  titleSize,
  titleLine,
  onType,
  onRegulars,
  onLucky,
  onEaten,
}: {
  note: MealPlanNote;
  paper: string;
  tilt: number;
  list: boolean;
  minHeight: number;
  titleSize: number;
  titleLine: number;
  onType: () => void;
  onRegulars: () => void;
  onLucky: () => void;
  onEaten: () => void;
}) {
  const empty = !note.title.trim();
  return (
    <View
      style={{
        width: "100%",
        minHeight: list ? Math.min(minHeight, 108) : minHeight,
        backgroundColor: paper,
        paddingHorizontal: 12,
        paddingTop: 14,
        paddingBottom: 10,
        transform: [{ rotate: `${tilt}deg` }],
        shadowColor: "#1A1008",
        shadowOpacity: 0.22,
        shadowRadius: 6,
        shadowOffset: { width: 1, height: 3 },
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 6,
          left: "50%",
          marginLeft: -6,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: T.pin,
          borderWidth: 1,
          borderColor: "rgba(42,33,22,0.2)",
        }}
      />
      <Text
        style={{
          marginTop: 4,
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: T.paperMuted,
        }}
      >
        {noteHeading(note)}
      </Text>
      <Text
        style={{
          marginTop: 8,
          flex: 1,
          fontFamily: HANDWRITING,
          fontSize: empty ? Math.max(16, titleSize - 4) : titleSize,
          lineHeight: empty ? titleLine : titleLine,
          color: empty ? T.paperMuted : T.paperInk,
          textDecorationLine: note.eaten ? "line-through" : "none",
        }}
      >
        {empty ? "Dinner?" : note.title}
      </Text>
      <View
        style={{
          marginTop: 8,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <NoteAction icon="add" label="Type dinner" onPress={onType} />
        <NoteAction icon="chevron-down" label="Pick a regular" onPress={onRegulars} />
        <NoteAction icon="sparkles" label="Feeling lucky" onPress={onLucky} />
        <NoteAction icon="close" label="Mark as eaten" onPress={onEaten} dim={empty} />
      </View>
    </View>
  );
}

function NoteAction({
  icon,
  label,
  onPress,
  dim,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  dim?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(42,33,22,0.08)",
        opacity: dim ? 0.35 : 1,
      }}
    >
      <Ionicons name={icon} size={15} color={T.paperInk} />
    </Pressable>
  );
}

function SettingsPanel({
  tab,
  onTab,
  view,
  size,
  palette,
  onView,
  onSize,
  onPalette,
  onRestoreLook,
  regulars,
  ideas,
  ideaTotal,
  ideaFilter,
  onFilter,
  draftRegular,
  onDraftRegular,
  regularError,
  onAddRegular,
  onRemoveRegular,
  draftIdea,
  onDraftIdea,
  draftIdeaCat,
  onDraftIdeaCat,
  ideaError,
  onAddIdea,
  editIdeaId,
  editIdeaTitle,
  onEditIdea,
  onEditTitle,
  onSaveEdit,
  onCancelEdit,
  onRemoveIdea,
}: {
  tab: SettingsTab;
  onTab: (tab: SettingsTab) => void;
  view: MealPlanView;
  size: MealPlanSize;
  palette: MealPlanPalette;
  onView: (view: MealPlanView) => void;
  onSize: (size: MealPlanSize) => void;
  onPalette: (palette: MealPlanPalette) => void;
  onRestoreLook: () => void;
  regulars: MealRegular[];
  ideas: MealPlanIdea[];
  ideaTotal: number;
  ideaFilter: IdeaFilter;
  onFilter: (filter: IdeaFilter) => void;
  draftRegular: string;
  onDraftRegular: (value: string) => void;
  regularError: string | null;
  onAddRegular: () => void;
  onRemoveRegular: (id: string) => void;
  draftIdea: string;
  onDraftIdea: (value: string) => void;
  draftIdeaCat: MealCategoryId;
  onDraftIdeaCat: (id: MealCategoryId) => void;
  ideaError: string | null;
  onAddIdea: () => void;
  editIdeaId: string | null;
  editIdeaTitle: string;
  onEditIdea: (idea: MealPlanIdea) => void;
  onEditTitle: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemoveIdea: (id: string) => void;
}) {
  return (
    <View style={{ marginTop: 20 }}>
      <View
        style={{
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
            { id: "look" as const, label: "Look" },
            { id: "regulars" as const, label: "Regulars" },
            { id: "ideas" as const, label: "Ideas" },
          ] as const
        ).map((item) => {
          const on = tab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onTab(item.id)}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? T.surfaceRaised : "transparent",
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 0.6,
                  color: on ? T.accent : T.muted,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "look" ? (
        <View style={{ marginTop: 18, gap: 16 }}>
          <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
            Two post-its side by side, or a simple list.
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(
              [
                { id: "board" as const, label: "Post-its" },
                { id: "list" as const, label: "List" },
              ] as const
            ).map((item) => {
              const on = view === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onView(item.id)}
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: on ? T.accent : T.surfaceRaised,
                    borderWidth: 1,
                    borderColor: on ? T.accent : T.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 12,
                      color: on ? T.paperInk : T.ink,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ fontFamily: SERIF, fontSize: 15, color: T.muted }}>
            Note size
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {NOTE_SIZES.map((item) => {
              const on = size === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSize(item.id)}
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: on ? T.accent : T.surfaceRaised,
                    borderWidth: 1,
                    borderColor: on ? T.accent : T.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 12,
                      color: on ? T.paperInk : T.ink,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ fontFamily: SERIF, fontSize: 15, color: T.muted }}>
            Colours
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {NOTE_PALETTES.map((item) => {
              const on = palette === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onPalette(item.id)}
                  style={{
                    width: "31%",
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: on ? T.surfaceRaised : T.surface,
                    borderWidth: 1,
                    borderColor: on ? T.accent : T.border,
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {item.papers.slice(0, 3).map((color) => (
                      <View
                        key={color}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 4,
                          backgroundColor: color,
                        }}
                      />
                    ))}
                  </View>
                  <Text
                    style={{
                      marginTop: 6,
                      fontFamily: "SpaceMono",
                      fontSize: 10,
                      color: T.ink,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <RestoreDefaultsButton
            ink={T.ink}
            muted={T.muted}
            onReset={onRestoreLook}
          />
        </View>
      ) : tab === "regulars" ? (
        <View style={{ marginTop: 18 }}>
          <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
            Dinners you actually cook on repeat. These show in the dropdown on each note.
          </Text>
          <View style={{ marginTop: 14, flexDirection: "row", gap: 8 }}>
            <TextInput
              value={draftRegular}
              onChangeText={onDraftRegular}
              placeholder="Add a regular"
              placeholderTextColor="rgba(246,239,226,0.4)"
              onSubmitEditing={onAddRegular}
              style={settingsInput}
            />
            <Pressable onPress={onAddRegular} style={settingsAdd}>
              <Ionicons name="add" size={20} color={T.paperInk} />
            </Pressable>
          </View>
          {regularError ? <ErrorText text={regularError} /> : null}
          {regulars.length === 0 ? (
            <EmptyHint text="No regulars yet. Add the dinners you default to." />
          ) : (
            <View style={{ marginTop: 14, gap: 8 }}>
              {regulars.map((row) => (
                <View key={row.id} style={settingsRow}>
                  <Text style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.ink }}>
                    {row.title}
                  </Text>
                  <Pressable
                    onPress={() => onRemoveRegular(row.id)}
                    accessibilityLabel={`Remove ${row.title}`}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={18} color={T.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={{ marginTop: 18 }}>
          <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
            Feeling lucky pulls from this list. Sort by kind, add your own, drop the ones you never want.
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: "SpaceMono",
              fontSize: 11,
              color: T.muted,
            }}
          >
            {ideaFilter === "all"
              ? `${ideaTotal} ideas`
              : `${ideas.length} in ${mealCategoryMeta(ideaFilter).label}`}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12 }}
            contentContainerStyle={{ gap: 8 }}
          >
            <FilterChip
              label="All"
              on={ideaFilter === "all"}
              onPress={() => onFilter("all")}
            />
            {MEAL_CATEGORIES.filter((item) => item.id !== "staple").map((item) => (
              <FilterChip
                key={item.id}
                label={item.label}
                on={ideaFilter === item.id}
                onPress={() => onFilter(item.id)}
              />
            ))}
          </ScrollView>
          <View style={{ marginTop: 14, flexDirection: "row", gap: 8 }}>
            <TextInput
              value={draftIdea}
              onChangeText={onDraftIdea}
              placeholder="Add a food idea"
              placeholderTextColor="rgba(246,239,226,0.4)"
              onSubmitEditing={onAddIdea}
              style={settingsInput}
            />
            <Pressable onPress={onAddIdea} style={settingsAdd}>
              <Ionicons name="add" size={20} color={T.paperInk} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {MEAL_CATEGORIES.filter((item) => item.id !== "staple").map((item) => (
              <FilterChip
                key={item.id}
                label={item.label}
                on={draftIdeaCat === item.id}
                onPress={() => onDraftIdeaCat(item.id)}
              />
            ))}
          </ScrollView>
          {ideaError ? <ErrorText text={ideaError} /> : null}
          {ideas.length === 0 ? (
            <EmptyHint text="Nothing in this sort. Add one, or switch category." />
          ) : (
            <View style={{ marginTop: 14, gap: 8 }}>
              {ideas.map((row) => (
                <View key={row.id} style={settingsRow}>
                  <View style={{ flex: 1 }}>
                    {editIdeaId === row.id ? (
                      <TextInput
                        value={editIdeaTitle}
                        onChangeText={onEditTitle}
                        onSubmitEditing={onSaveEdit}
                        autoFocus
                        style={{
                          fontFamily: SERIF,
                          fontSize: 16,
                          color: T.ink,
                          padding: 0,
                        }}
                      />
                    ) : (
                      <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
                        {row.title}
                      </Text>
                    )}
                    <Text
                      style={{
                        marginTop: 2,
                        fontFamily: "SpaceMono",
                        fontSize: 10,
                        color: T.muted,
                      }}
                    >
                      {mealCategoryMeta(row.category).label}
                    </Text>
                  </View>
                  {editIdeaId === row.id ? (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Pressable onPress={onSaveEdit} hitSlop={8}>
                        <Ionicons name="checkmark" size={18} color={T.accent} />
                      </Pressable>
                      <Pressable onPress={onCancelEdit} hitSlop={8}>
                        <Ionicons name="close" size={18} color={T.muted} />
                      </Pressable>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Pressable
                        onPress={() => onEditIdea(row)}
                        accessibilityLabel={`Edit ${row.title}`}
                        hitSlop={8}
                      >
                        <Ionicons name="pencil" size={16} color={T.muted} />
                      </Pressable>
                      <Pressable
                        onPress={() => onRemoveIdea(row.id)}
                        accessibilityLabel={`Remove ${row.title}`}
                        hitSlop={8}
                      >
                        <Ionicons name="close" size={18} color={T.muted} />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function FilterChip({
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
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: on ? T.accent : T.surfaceRaised,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          color: on ? T.paperInk : T.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ErrorText({ text }: { text: string }) {
  return (
    <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 14, color: "#FFB4A8" }}>
      {text}
    </Text>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <Text style={{ marginTop: 16, fontFamily: SERIF, fontSize: 15, color: T.muted }}>
      {text}
    </Text>
  );
}

const modalWrap = {
  flex: 1,
  backgroundColor: "rgba(20,12,8,0.72)",
  alignItems: "center" as const,
  justifyContent: "center" as const,
  padding: 24,
};

const modalCard = {
  width: "100%" as const,
  maxWidth: 380,
  borderRadius: 22,
  backgroundColor: "#FFF6E8",
  padding: 22,
};

const modalKicker = {
  fontFamily: "SpaceMono",
  fontSize: 11,
  letterSpacing: 1.8,
  textTransform: "uppercase" as const,
  color: T.paperMuted,
};

const modalTitle = {
  marginTop: 6,
  fontFamily: SERIF,
  fontSize: 24,
  color: T.paperInk,
};

const modalInput = {
  marginTop: 14,
  height: 48,
  borderRadius: 12,
  paddingHorizontal: 14,
  backgroundColor: "rgba(42,33,22,0.06)",
  fontFamily: SERIF,
  fontSize: 17,
  color: T.paperInk,
};

const modalPrimary = {
  height: 48,
  borderRadius: 14,
  backgroundColor: T.paperInk,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const modalPrimaryText = {
  fontFamily: SERIF,
  fontSize: 16,
  fontWeight: "700" as const,
  color: "#FFF6E8",
};

const modalGhost = {
  height: 44,
  borderRadius: 14,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const modalGhostText = {
  fontFamily: SERIF,
  fontSize: 15,
  color: T.paperMuted,
};

const settingsInput = {
  flex: 1,
  height: 46,
  borderRadius: 12,
  paddingHorizontal: 14,
  backgroundColor: T.surfaceRaised,
  borderWidth: 1,
  borderColor: T.border,
  fontFamily: SERIF,
  fontSize: 16,
  color: T.ink,
};

const settingsAdd = {
  width: 46,
  height: 46,
  borderRadius: 12,
  backgroundColor: T.accent,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const settingsRow = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 10,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 14,
  backgroundColor: T.surface,
  borderWidth: 1,
  borderColor: T.border,
};
