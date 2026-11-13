import { GIFTS_TONE as T, HANDWRITING, SERIF } from "@/lib/app-themes";
import { formatGiftDate, formatGiftPrice, occasionMeta, type GiftItem } from "@/lib/gifts";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const LINE = 40;

function priceDigits(price: string | null | undefined): string {
  return (price ?? "").trim().replace(/^\$/, "");
}

const PRICE_GREEN = "#2F7A4A";

export function PriceBox({
  value,
  onChangeText,
  onSubmit,
  editable,
  autoFocus,
}: {
  value: string;
  onChangeText?: (next: string) => void;
  onSubmit?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
}) {
  const digits = priceDigits(value);
  const filled = Boolean(digits);
  return (
    <View
      style={{
        width: 72,
        height: 32,
        flexGrow: 0,
        flexShrink: 0,
        paddingHorizontal: 6,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: filled ? PRICE_GREEN : T.ribbon,
        backgroundColor: filled ? "rgba(86,160,108,0.22)" : "rgba(196,60,74,0.14)",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontFamily: SERIF,
          fontSize: 16,
          fontWeight: "800",
          color: filled ? PRICE_GREEN : T.ribbon,
          marginRight: 2,
        }}
      >
        $
      </Text>
      {editable ? (
        <TextInput
          value={digits}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="0"
          placeholderTextColor="rgba(42,28,18,0.38)"
          keyboardType="numeric"
          autoFocus={autoFocus}
          accessibilityLabel="Price"
          style={{
            width: 40,
            height: 30,
            fontFamily: SERIF,
            fontSize: 16,
            fontWeight: "800",
            color: T.paperInk,
            padding: 0,
          }}
        />
      ) : (
        <Text
          style={{
            width: 40,
            fontFamily: SERIF,
            fontSize: 16,
            fontWeight: "800",
            color: digits ? T.paperInk : "rgba(42,28,18,0.38)",
          }}
          numberOfLines={1}
        >
          {digits || " "}
        </Text>
      )}
    </View>
  );
}

const NAME_COL = 108;
const writeStyle = {
  height: LINE - 8,
  fontFamily: HANDWRITING,
  fontSize: 20,
  color: T.paperInk,
  padding: 0,
} as const;

export function GiftNotepad({
  items,
  empty,
  onAdd,
  onToggle,
  onRemove,
  onEdit,
  onMove,
  onSecret,
  people,
  oneOff = false,
  hideCosts = false,
}: {
  items: GiftItem[];
  empty: string;
  onAdd: (title: string, price?: string, forName?: string) => void;
  onToggle: (item: GiftItem) => void;
  onRemove: (id: string) => void;
  onEdit?: (item: GiftItem, next: { title: string; price: string; forName?: string }) => void;
  onMove?: (item: GiftItem, personId: string) => void;
  onSecret?: (item: GiftItem) => void;
  people?: { id: string; name: string }[];
  oneOff?: boolean;
  hideCosts?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<"title" | "price">("title");
  const [editTitle, setEditTitle] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const submit = () => {
    const title = draft.trim();
    const forName = draftName.trim();
    if (oneOff) {
      if (!title || !forName) return;
      onAdd(title, draftPrice.trim(), forName);
    } else {
      if (!title) return;
      onAdd(title, draftPrice.trim());
    }
    setDraft("");
    setDraftName("");
    setDraftPrice("");
  };

  const startEdit = (item: GiftItem, field: "title" | "price" = "title") => {
    if (!onEdit) return;
    setEditingId(item.id);
    setEditField(field);
    setEditTitle(item.title);
    setEditName(item.forName);
    setEditPrice(item.price);
  };

  const saveEdit = () => {
    if (!editingId || !onEdit) return;
    const item = items.find((row) => row.id === editingId);
    if (item) onEdit(item, { title: editTitle, price: editPrice, forName: editName });
    setEditingId(null);
  };

  return (
    <View
      style={{
        marginTop: 14,
        backgroundColor: T.paper,
        borderRadius: 3,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(42,28,18,0.12)",
      }}
    >
      {items.length === 0 ? (
        <View
          style={{
            minHeight: LINE * 2,
            paddingLeft: 40,
            paddingRight: 12,
            justifyContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(42,28,18,0.1)",
          }}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 14, color: T.paperMuted }}>
            {empty}
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            style={{
              minHeight: LINE,
              paddingLeft: 12,
              paddingRight: 8,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(42,28,18,0.1)",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => onToggle(item)}
              hitSlop={8}
              accessibilityLabel={`Mark ${item.title} bought`}
              style={{
                width: 18,
                height: 18,
                flexGrow: 0,
                flexShrink: 0,
                borderRadius: 4,
                borderWidth: 1.5,
                borderColor: T.ribbon,
              }}
            />
            {editingId === item.id ? (
              <View style={{ flex: 1, minWidth: 0, gap: 6, paddingVertical: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {oneOff && editField === "title" ? (
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      onSubmitEditing={saveEdit}
                      autoFocus
                      placeholder="Who?"
                      placeholderTextColor="rgba(42,28,18,0.32)"
                      style={{
                        ...writeStyle,
                        width: NAME_COL,
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                    />
                  ) : oneOff ? (
                    <Text
                      style={{
                        ...writeStyle,
                        width: NAME_COL,
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      numberOfLines={1}
                    >
                      {editName || item.forName}
                    </Text>
                  ) : null}
                  {editField === "title" ? (
                    <TextInput
                      value={editTitle}
                      onChangeText={setEditTitle}
                      onSubmitEditing={saveEdit}
                      autoFocus={!oneOff}
                      placeholder={oneOff ? "Present" : undefined}
                      placeholderTextColor="rgba(42,28,18,0.32)"
                      style={{
                        ...writeStyle,
                        flex: 1,
                        minWidth: 0,
                      }}
                    />
                  ) : (
                    <Text
                      style={{
                        ...writeStyle,
                        flex: 1,
                        minWidth: 0,
                      }}
                      numberOfLines={1}
                    >
                      {editTitle || item.title}
                    </Text>
                  )}
                  {hideCosts ? null : (
                    <PriceBox
                      value={editPrice}
                      onChangeText={setEditPrice}
                      onSubmit={saveEdit}
                      editable
                      autoFocus={editField === "price"}
                    />
                  )}
                  <Pressable onPress={saveEdit} hitSlop={6} style={{ flexShrink: 0 }}>
                    <Text style={{ fontSize: 12, fontWeight: "800", color: T.ribbon }}>
                      Save
                    </Text>
                  </Pressable>
                </View>
                {onMove && people && people.length > 1 ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {people.map((person) => {
                      const on = person.id === item.personId;
                      return (
                        <Pressable
                          key={person.id}
                          onPress={() => {
                            onMove(item, person.id);
                            setEditingId(null);
                          }}
                          style={{
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            backgroundColor: on ? T.gold : "rgba(42,28,18,0.06)",
                            borderWidth: 1,
                            borderColor: on ? T.gold : "rgba(42,28,18,0.16)",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "800",
                              color: on ? "#1A1408" : T.paperInk,
                            }}
                          >
                            {person.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            ) : (
              <>
                {oneOff ? (
                  <Pressable
                    onPress={() => startEdit(item)}
                    style={{
                      width: NAME_COL,
                      flexGrow: 0,
                      flexShrink: 0,
                      justifyContent: "center",
                      minHeight: LINE - 8,
                    }}
                    accessibilityLabel={`Edit ${item.forName || "name"}`}
                  >
                    <Text
                      style={{
                        fontFamily: HANDWRITING,
                        fontSize: 20,
                        color: T.paperInk,
                      }}
                      numberOfLines={1}
                    >
                      {item.forName || " "}
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => startEdit(item)}
                  style={{ flex: 1, minWidth: 0, justifyContent: "center", minHeight: LINE - 8 }}
                  accessibilityLabel={`Edit ${item.title}`}
                >
                  <Text
                    style={{
                      fontFamily: HANDWRITING,
                      fontSize: 20,
                      color: T.paperInk,
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                    {!oneOff && item.notes ? `  · ${item.notes}` : ""}
                  </Text>
                </Pressable>
                {hideCosts ? null : (
                  <Pressable
                    onPress={() => startEdit(item, "price")}
                    hitSlop={6}
                    style={{ flexGrow: 0, flexShrink: 0 }}
                    accessibilityLabel={`Edit price for ${item.title}`}
                  >
                    <PriceBox value={item.price} />
                  </Pressable>
                )}
              </>
            )}
            {onSecret ? (
              <Pressable
                onPress={() => onSecret(item)}
                hitSlop={6}
                accessibilityLabel={`Send ${item.title} to secret list`}
                style={{ flexGrow: 0, flexShrink: 0 }}
              >
                <Ionicons name="lock-closed-outline" size={16} color={T.ribbon} />
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => onRemove(item.id)}
              hitSlop={8}
              accessibilityLabel={`Remove ${item.title}`}
              style={{
                width: 28,
                height: 28,
                flexGrow: 0,
                flexShrink: 0,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(196,60,74,0.16)",
              }}
            >
              <Ionicons name="close" size={16} color={T.ribbon} />
            </Pressable>
          </View>
        ))
      )}
      <View
        style={{
          minHeight: LINE,
          paddingLeft: 12,
          paddingRight: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(42,28,18,0.1)",
        }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            flexGrow: 0,
            flexShrink: 0,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: T.ribbon,
            opacity: 0.45,
          }}
        />
        {oneOff ? (
          <>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              onSubmitEditing={submit}
              placeholder="Who?"
              placeholderTextColor="rgba(42,28,18,0.32)"
              returnKeyType="next"
              style={{
                ...writeStyle,
                width: NAME_COL,
                flexGrow: 0,
                flexShrink: 0,
                height: LINE,
              }}
            />
          </>
        ) : null}
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder={oneOff ? "Present" : items.length ? "Add another gift…" : "Write a gift…"}
          placeholderTextColor="rgba(42,28,18,0.42)"
          returnKeyType="done"
          style={{
            ...writeStyle,
            flex: 1,
            minWidth: 0,
            height: LINE,
          }}
        />
        {hideCosts ? null : (
          <PriceBox
            value={draftPrice}
            onChangeText={setDraftPrice}
            onSubmit={submit}
            editable
          />
        )}
        <Pressable
          onPress={submit}
          hitSlop={6}
          accessibilityLabel="Add gift"
          style={{
            flexGrow: 0,
            flexShrink: 0,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: T.gold,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#1A1408" }}>Add</Text>
        </Pressable>
      </View>
      {Array.from({ length: Math.max(1, 6 - items.length) }).map((_, index) => (
        <View
          key={`blank-${index}`}
          style={{
            minHeight: LINE,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(42,28,18,0.08)",
          }}
        />
      ))}
    </View>
  );
}

export function GiftModeToggle({
  classic,
  onChange,
}: {
  classic: boolean;
  onChange: (classic: boolean) => void;
}) {
  return (
    <View
      style={{
        marginTop: 16,
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
          [true, "Classic", "Notepad with checkboxes"],
          [false, "New", "People, wishes, gift book"],
        ] as const
      ).map(([value, label]) => {
        const on = classic === value;
        return (
          <Pressable
            key={label}
            onPress={() => onChange(value)}
            style={{
              flex: 1,
              alignItems: "center",
              borderRadius: 12,
              paddingVertical: 10,
              backgroundColor: on ? T.gold : "transparent",
            }}
          >
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 15,
                fontWeight: "700",
                color: on ? "#1A1408" : T.muted,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function BoughtList({
  items,
  onGive,
  onRemove,
  onAdd,
  onEdit,
  hideCosts = false,
}: {
  items: GiftItem[];
  onGive: (item: GiftItem) => void;
  onRemove: (id: string) => void;
  /** Add a bought present without putting it on the wishlist first. */
  onAdd?: (title: string, price?: string) => void;
  onEdit?: (item: GiftItem, next: { title: string; price: string; forName?: string }) => void;
  hideCosts?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const submit = () => {
    const title = draft.trim();
    if (!title || !onAdd) return;
    onAdd(title, draftPrice.trim());
    setDraft("");
    setDraftPrice("");
  };

  const savePrice = (item: GiftItem) => {
    if (!onEdit) return;
    onEdit(item, { title: item.title, price: editPrice, forName: item.forName });
    setEditingId(null);
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: T.gold,
        }}
      >
        Bought
      </Text>
      <Text
        style={{
          marginTop: 4,
          fontFamily: SERIF,
          fontSize: 13,
          lineHeight: 18,
          color: T.muted,
        }}
      >
        Already wrapped, or bought without a wish. Tap $ to add what it cost, then Give it into the gift book.
      </Text>
      <View
        style={{
          marginTop: 10,
          backgroundColor: T.paper,
          borderRadius: 3,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(42,28,18,0.12)",
        }}
      >
        {items.map((item) => (
          <View
            key={item.id}
            style={{
              minHeight: LINE,
              paddingLeft: 12,
              paddingRight: 8,
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(42,28,18,0.1)",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="bag-check-outline" size={16} color={PRICE_GREEN} />
            <Text
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: T.paperInk,
              }}
              numberOfLines={1}
            >
              {item.forName ? `${item.forName}  ·  ${item.title}` : item.title}
            </Text>
            {hideCosts ? null : editingId === item.id ? (
              <>
                <PriceBox
                  value={editPrice}
                  onChangeText={setEditPrice}
                  onSubmit={() => savePrice(item)}
                  editable
                  autoFocus
                />
                <Pressable onPress={() => savePrice(item)} hitSlop={6} style={{ flexShrink: 0 }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: T.ribbon }}>
                    Save
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => {
                  if (!onEdit) return;
                  setEditingId(item.id);
                  setEditPrice(item.price);
                }}
                hitSlop={6}
                accessibilityLabel={`Edit price for ${item.title}`}
                style={{ flexGrow: 0, flexShrink: 0 }}
              >
                <PriceBox value={item.price} />
              </Pressable>
            )}
            <Pressable
              onPress={() => onGive(item)}
              hitSlop={6}
              accessibilityLabel={`Give ${item.title}`}
              style={{
                flexGrow: 0,
                flexShrink: 0,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: T.gold,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#1A1408" }}>
                Give
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onRemove(item.id)}
              hitSlop={8}
              accessibilityLabel={`Remove ${item.title} from list`}
              style={{
                width: 28,
                height: 28,
                flexGrow: 0,
                flexShrink: 0,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(196,60,74,0.16)",
              }}
            >
              <Ionicons name="close" size={16} color={T.ribbon} />
            </Pressable>
          </View>
        ))}
        {onAdd ? (
          <View
            style={{
              minHeight: LINE,
              paddingLeft: 12,
              paddingRight: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="add" size={16} color={T.ribbon} />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={submit}
              placeholder="Add a bought gift…"
              placeholderTextColor="rgba(42,28,18,0.42)"
              returnKeyType="done"
              style={{
                flex: 1,
                minWidth: 0,
                height: LINE,
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: T.paperInk,
              }}
            />
            {hideCosts ? null : (
              <PriceBox
                value={draftPrice}
                onChangeText={setDraftPrice}
                onSubmit={submit}
                editable
              />
            )}
            <Pressable
              onPress={submit}
              hitSlop={6}
              style={{
                flexGrow: 0,
                flexShrink: 0,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: T.gold,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#1A1408" }}>Add</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={{ minHeight: LINE, paddingLeft: 12, justifyContent: "center" }}>
            <Text style={{ fontFamily: SERIF, fontSize: 13, color: T.paperMuted }}>
              Nothing bought yet.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function GiftBookList({
  items,
  onLog,
  hideCosts = false,
}: {
  items: GiftItem[];
  onLog?: () => void;
  hideCosts?: boolean;
}) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: T.gold,
        }}
      >
        Gift book
      </Text>
      <Text
        style={{
          marginTop: 4,
          fontFamily: SERIF,
          fontSize: 13,
          lineHeight: 18,
          color: T.muted,
        }}
      >
        What they actually received. Log one here without a wishlist.
      </Text>
      <View
        style={{
          marginTop: 10,
          backgroundColor: T.paper,
          borderRadius: 3,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(42,28,18,0.12)",
        }}
      >
        {items.map((item) => (
          <View
            key={item.id}
            style={{
              minHeight: LINE,
              paddingLeft: 12,
              paddingRight: 12,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(42,28,18,0.1)",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: T.paperInk,
              }}
              numberOfLines={1}
            >
              {item.forName ? `${item.forName}  ·  ${item.title}` : item.title}
            </Text>
            {hideCosts || !formatGiftPrice(item.price) ? null : (
              <Text
                style={{
                  flexShrink: 0,
                  fontFamily: SERIF,
                  fontSize: 16,
                  fontWeight: "800",
                  color: PRICE_GREEN,
                }}
              >
                {formatGiftPrice(item.price)}
              </Text>
            )}
            <Text style={{ fontSize: 11, color: T.paperMuted }} numberOfLines={1}>
              {occasionMeta(item.occasion).short}
              {` · ${formatGiftDate(item.dateKey, item.year)}`}
            </Text>
          </View>
        ))}
        {items.length === 0 ? (
          <View style={{ minHeight: LINE, paddingLeft: 12, justifyContent: "center" }}>
            <Text style={{ fontFamily: SERIF, fontSize: 13, color: T.paperMuted }}>
              Empty book.
            </Text>
          </View>
        ) : null}
      </View>
      {onLog ? (
        <Pressable
          onPress={onLog}
          style={{
            marginTop: 10,
            height: 44,
            borderRadius: 22,
            backgroundColor: T.gold,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A1408", fontWeight: "800", fontSize: 14 }}>
            Log a gift in the book
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
