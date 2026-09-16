import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { reloadMiniFromDisk, useMiniApps } from "@/lib/mini-apps";
import {
  newPadNote,
  noteCardCopy,
  noteLiveBy,
  noteWhen,
  pinPadNote,
  removePadNote,
  sortPadNotes,
  upsertPadNote,
  type PadNote,
} from "@/lib/notepad";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type TextStyle,
} from "react-native";

const C = {
  bg: "#241810",
  paper: "#FFF6E4",
  paperShadow: "#C9B48A",
  rule: "#C9D7EA",
  margin: "#E45B5B",
  ink: "#1C140C",
  muted: "rgba(28,20,12,0.55)",
  faint: "rgba(28,20,12,0.32)",
  pin: "#C9A24A",
} as const;

const LINE = 32;
const SAVE_MS = 200;

export default function NotepadScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const look = useAppLook("notepad", "#E8B86D", {
    linedPaper: true,
    handwriting: true,
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef({ id: null as string | null, title: "", body: "" });
  const savedRef = useRef({ id: "", title: "", body: "" });
  const userId = user?.id ?? "";

  const notes = useMemo(() => sortPadNotes(data.padNotes), [data.padNotes]);
  const openNote = notes.find((row) => row.id === openId) ?? null;
  const them = partner?.displayName || "They";
  const theyLive = openNote ? noteLiveBy(openNote, partner?.id, now) : false;
  const fontFamily = look.prefs.handwriting ? HANDWRITING : SERIF;
  const lined = look.prefs.linedPaper;

  draftRef.current = { id: openId, title, body };

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!openId) return;
    const note = data.padNotes.find((row) => row.id === openId);
    if (!note) {
      setOpenId(null);
      return;
    }
    if (note.updatedBy && note.updatedBy === userId) return;
    savedRef.current = { id: note.id, title: note.title, body: note.body };
    setTitle((current) => (current === note.title ? current : note.title));
    setBody((current) => (current === note.body ? current : note.body));
  }, [data.padNotes, openId, userId]);

  const withFresh = useCallback(
    async (fn: (notes: PadNote[]) => PadNote[]) => {
      await reloadMiniFromDisk();
      return patch((state) => ({ ...state, padNotes: fn(state.padNotes) }));
    },
    [patch]
  );

  const persistDraft = useCallback(
    async (id: string, nextTitle: string, nextBody: string) => {
      const saved = savedRef.current;
      if (
        saved.id === id &&
        saved.title === nextTitle &&
        saved.body === nextBody
      ) {
        return;
      }
      savedRef.current = { id, title: nextTitle, body: nextBody };
      await withFresh((notes) =>
        upsertPadNote(notes, id, { title: nextTitle, body: nextBody }, userId)
      );
    },
    [userId, withFresh]
  );

  const flush = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const draft = draftRef.current;
    if (!draft.id) return;
    await persistDraft(draft.id, draft.title, draft.body);
  }, [persistDraft]);

  const scheduleSave = (nextTitle: string, nextBody: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      const id = draftRef.current.id;
      if (!id) return;
      void persistDraft(id, nextTitle, nextBody);
    }, SAVE_MS);
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const draft = draftRef.current;
      if (!draft.id) return;
      const saved = savedRef.current;
      if (
        saved.id === draft.id &&
        saved.title === draft.title &&
        saved.body === draft.body
      ) {
        return;
      }
      void reloadMiniFromDisk().then(() =>
        patch((state) => ({
          ...state,
          padNotes: upsertPadNote(
            state.padNotes,
            draft.id!,
            { title: draft.title, body: draft.body },
            userId
          ),
        }))
      );
    };
  }, [patch, userId]);

  const open = (note: PadNote) => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    savedRef.current = { id: note.id, title: note.title, body: note.body };
    setOpenId(note.id);
    setTitle(note.title);
    setBody(note.body);
  };

  const closeEditor = async () => {
    await flush();
    setOpenId(null);
    setTitle("");
    setBody("");
  };

  const addNote = async () => {
    await flush();
    const note = newPadNote(userId);
    await withFresh((notes) => [note, ...notes]);
    savedRef.current = { id: note.id, title: "", body: "" };
    setOpenId(note.id);
    setTitle("");
    setBody("");
  };

  const togglePin = async (id: string) => {
    await flush();
    await withFresh((notes) => pinPadNote(notes, id));
  };

  const confirmRemove = async () => {
    if (!removeId) return;
    const id = removeId;
    setRemoveId(null);
    if (openId === id) {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      setOpenId(null);
      setTitle("");
      setBody("");
    }
    await withFresh((notes) => removePadNote(notes, id));
  };

  const settings = (
    <LookPanel
      look={look}
      ink="#F6EEDC"
      muted="rgba(246,238,220,0.62)"
      toggles={[
        {
          key: "linedPaper",
          label: "Lined paper",
          hint: "Blue rules on the page, like a real pad.",
        },
        {
          key: "handwriting",
          label: "Handwriting",
          hint: "Script on the page. Off for plain type.",
        },
      ]}
    />
  );

  if (openNote) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Screen scroll background={C.bg} density={look.prefs.density} typeface={look.prefs.typeface} accent={look.wash}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Stage
              background={C.bg}
              fallback={"/" as Href}
              accent={look.accent}
              settingsLabel="Notepad"
              settings={settings}
            >
              <Pressable
                onPress={() => void closeEditor()}
                accessibilityRole="button"
                accessibilityLabel="Back to all notes"
                style={{
                  alignSelf: "flex-start",
                  marginBottom: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: look.accent,
                  }}
                >
                  ← All notes
                </Text>
              </Pressable>

              <PadSheet lined={lined}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingLeft: 36,
                    paddingRight: 10,
                    paddingTop: 10,
                  }}
                >
                  <TextInput
                    value={title}
                    onChangeText={(value) => {
                      setTitle(value);
                      scheduleSave(value, body);
                    }}
                    placeholder="Title — if you want one"
                    placeholderTextColor={C.faint}
                    autoCorrect
                    style={{
                      flex: 1,
                      fontFamily: SERIF,
                      fontSize: Math.max(18, look.look.title - 10),
                      color: C.ink,
                      paddingVertical: 6,
                      ...webInput,
                    }}
                  />
                  <IconHit
                    label={openNote.pinned ? "Unpin note" : "Pin to top"}
                    icon={openNote.pinned ? "pin" : "pin-outline"}
                    color={openNote.pinned ? C.pin : C.muted}
                    onPress={() => void togglePin(openNote.id)}
                  />
                  <IconHit
                    label="Remove note"
                    icon="trash-outline"
                    color={C.margin}
                    onPress={() => setRemoveId(openNote.id)}
                  />
                </View>
                {theyLive ? (
                  <Text
                    style={{
                      paddingLeft: 36,
                      paddingRight: 14,
                      marginTop: 2,
                      fontSize: 12,
                      color: C.muted,
                    }}
                  >
                    {them} is typing on this page…
                  </Text>
                ) : null}
                <TextInput
                  value={body}
                  onChangeText={(value) => {
                    setBody(value);
                    scheduleSave(title, value);
                  }}
                  placeholder="Write anything. They can type here too."
                  placeholderTextColor={C.faint}
                  multiline
                  textAlignVertical="top"
                  scrollEnabled={false}
                  style={{
                    marginTop: 4,
                    paddingLeft: 36,
                    paddingRight: 14,
                    paddingTop: lined ? 6 : 10,
                    paddingBottom: 28,
                    minHeight: LINE * 14,
                    fontFamily,
                    fontSize: look.prefs.handwriting ? 20 : look.look.body + 2,
                    lineHeight: LINE,
                    color: C.ink,
                    ...webInput,
                  }}
                />
              </PadSheet>
            </Stage>
          </KeyboardAvoidingView>
        </Screen>
        <ConfirmDialog
          open={Boolean(removeId)}
          title="Remove this note?"
          body="It leaves both of your pads. You cannot get the words back."
          confirmLabel="Remove"
          cancelLabel="Keep it"
          onConfirm={() => void confirmRemove()}
          onCancel={() => setRemoveId(null)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Screen scroll background={C.bg} density={look.prefs.density} typeface={look.prefs.typeface} accent={look.wash}>
        <Stage
          background={C.bg}
          fallback={"/" as Href}
          accent={look.accent}
          settingsLabel="Notepad"
          settings={settings}
        >
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: look.look.title,
              lineHeight: look.look.titleLine,
              color: "#F6EEDC",
            }}
          >
            Notepad
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: look.look.body,
              lineHeight: look.look.bodyLine,
              color: "rgba(246,238,220,0.68)",
            }}
          >
            Shared pages. Newest sits up top. Pin one. You can both type the same
            note at once.
          </Text>

          <Pressable
            onPress={() => void addNote()}
            accessibilityRole="button"
            accessibilityLabel="New note"
            style={{
              marginTop: 18,
              height: 48,
              borderRadius: 16,
              backgroundColor: look.accent,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Ionicons name="add" size={20} color="#1A120C" />
            <Text style={{ fontWeight: "800", color: "#1A120C", fontSize: 16 }}>
              New note
            </Text>
          </Pressable>

          {!ready ? (
            <Text
              style={{
                marginTop: 28,
                fontFamily: SERIF,
                color: "rgba(246,238,220,0.5)",
              }}
            >
              Opening the pad…
            </Text>
          ) : notes.length === 0 ? (
            <PadSheet lined={lined}>
              <View
                style={{
                  minHeight: LINE * 5,
                  paddingLeft: 36,
                  paddingRight: 16,
                  paddingTop: 18,
                  paddingBottom: 22,
                }}
              >
                <Text
                  style={{
                    fontFamily,
                    fontSize: 22,
                    lineHeight: LINE,
                    color: C.ink,
                  }}
                >
                  Nothing on the pad yet.
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    fontFamily: SERIF,
                    fontSize: 15,
                    lineHeight: 22,
                    color: C.muted,
                  }}
                >
                  Tap New note and start writing. The first line shows on the
                  list so you can peek before you open it.
                </Text>
              </View>
            </PadSheet>
          ) : (
            <View style={{ marginTop: 18, gap: 12 }}>
              {notes.map((note) => {
                const copy = noteCardCopy(note);
                const live = noteLiveBy(note, partner?.id, now);
                return (
                  <View
                    key={note.id}
                    style={{
                      borderRadius: 4,
                      backgroundColor: C.paper,
                      borderWidth: 1,
                      borderColor: "rgba(28,20,12,0.12)",
                      paddingVertical: 12,
                      paddingLeft: 14,
                      paddingRight: 8,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 8,
                      shadowColor: "#000",
                      shadowOpacity: 0.18,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                    }}
                  >
                    <View
                      style={{
                        width: 3,
                        alignSelf: "stretch",
                        backgroundColor: note.pinned ? C.pin : C.margin,
                        borderRadius: 2,
                        marginTop: 2,
                        marginBottom: 2,
                      }}
                    />
                    <Pressable
                      onPress={() => open(note)}
                      accessibilityRole="button"
                      accessibilityLabel={copy.heading}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {note.pinned ? (
                          <Ionicons name="pin" size={13} color={C.pin} />
                        ) : null}
                        <Text
                          numberOfLines={1}
                          style={{
                            flex: 1,
                            fontFamily: SERIF,
                            fontSize: 17,
                            fontWeight: "700",
                            color: C.ink,
                          }}
                        >
                          {copy.heading}
                        </Text>
                      </View>
                      {copy.preview ? (
                        <Text
                          numberOfLines={1}
                          style={{
                            marginTop: 4,
                            fontFamily,
                            fontSize: look.prefs.handwriting ? 18 : 15,
                            color: C.muted,
                          }}
                        >
                          {copy.preview}
                        </Text>
                      ) : null}
                      <Text
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          letterSpacing: 0.4,
                          color: C.faint,
                        }}
                      >
                        {live
                          ? `${them} is typing`
                          : noteWhen(note.updatedAt, now)}
                      </Text>
                    </Pressable>
                    <IconHit
                      label={note.pinned ? "Unpin note" : "Pin to top"}
                      icon={note.pinned ? "pin" : "pin-outline"}
                      color={note.pinned ? C.pin : C.muted}
                      onPress={() => void togglePin(note.id)}
                    />
                    <IconHit
                      label="Remove note"
                      icon="close"
                      color={C.muted}
                      onPress={() => setRemoveId(note.id)}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </Stage>
      </Screen>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Remove this note?"
        body="It leaves both of your pads. You cannot get the words back."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}

const webInput = (
  Platform.OS === "web" ? { outlineStyle: "none" as const } : {}
) as TextStyle;

function PadSheet({
  children,
  lined,
}: {
  children: ReactNode;
  lined: boolean;
}) {
  return (
    <View style={{ marginTop: 16 }}>
      <View
        style={{
          position: "absolute",
          left: 10,
          right: -6,
          top: 8,
          bottom: -8,
          backgroundColor: C.paperShadow,
          borderRadius: 4,
        }}
      />
      <View
        style={{
          backgroundColor: C.paper,
          borderRadius: 4,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(28,20,12,0.12)",
        }}
      >
        {lined
          ? Array.from({ length: 18 }).map((_, index) => (
              <View
                key={index}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 52 + index * LINE,
                  height: 1,
                  backgroundColor: C.rule,
                }}
              />
            ))
          : null}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 28,
            top: 0,
            bottom: 0,
            width: 1.5,
            backgroundColor: C.margin,
          }}
        />
        {children}
      </View>
    </View>
  );
}

function IconHit({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={18} color={color} />
    </Pressable>
  );
}
