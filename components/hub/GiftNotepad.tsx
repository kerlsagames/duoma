import { GIFTS_TONE as T, HANDWRITING, SERIF } from "@/lib/app-themes";
import { formatGiftDate, occasionMeta, type GiftItem } from "@/lib/gifts";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const LINE = 36;

export function GiftNotepad({
  items,
  empty,
  onAdd,
  onToggle,
  onRemove,
  onSecret,
}: {
  items: GiftItem[];
  empty: string;
  onAdd: (title: string) => void;
  onToggle: (item: GiftItem) => void;
  onRemove: (id: string) => void;
  onSecret?: (item: GiftItem) => void;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const title = draft.trim();
    if (!title) return;
    onAdd(title);
    setDraft("");
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
                borderRadius: 4,
                borderWidth: 1.5,
                borderColor: T.ribbon,
              }}
            />
            <Text
              style={{
                flex: 1,
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: T.paperInk,
              }}
              numberOfLines={1}
            >
              {item.title}
              {item.notes ? `  · ${item.notes}` : ""}
            </Text>
            <Text style={{ fontSize: 10, color: T.paperMuted }}>
              {occasionMeta(item.occasion).short}
            </Text>
            {onSecret ? (
              <Pressable
                onPress={() => onSecret(item)}
                hitSlop={6}
                accessibilityLabel={`Send ${item.title} to secret list`}
              >
                <Ionicons name="lock-closed-outline" size={14} color={T.ribbon} />
              </Pressable>
            ) : null}
            <Pressable onPress={() => onRemove(item.id)} hitSlop={6}>
              <Ionicons name="close" size={14} color={T.paperMuted} />
            </Pressable>
          </View>
        ))
      )}
      <View
        style={{
          minHeight: LINE,
          paddingLeft: 40,
          paddingRight: 10,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(42,28,18,0.1)",
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder="Write a gift…"
          placeholderTextColor="rgba(42,28,18,0.32)"
          returnKeyType="done"
          style={{
            flex: 1,
            height: LINE,
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: T.paperInk,
          }}
        />
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
}: {
  items: GiftItem[];
  onGive: (item: GiftItem) => void;
  onRemove: (id: string) => void;
  /** Add a bought present without putting it on the wishlist first. */
  onAdd?: (title: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const title = draft.trim();
    if (!title || !onAdd) return;
    onAdd(title);
    setDraft("");
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
        Already wrapped, or bought without a wish. Give it to land it in the gift book.
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
              borderBottomWidth: 1,
              borderBottomColor: "rgba(42,28,18,0.1)",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="bag-check-outline" size={16} color={T.ribbon} />
            <Text
              style={{
                flex: 1,
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: T.paperInk,
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Pressable
              onPress={() => onRemove(item.id)}
              hitSlop={6}
              accessibilityLabel={`Remove ${item.title} from list`}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(42,28,18,0.16)",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: T.paperMuted }}>
                Remove
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onGive(item)}
              hitSlop={6}
              accessibilityLabel={`Give ${item.title}`}
              style={{
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
              placeholderTextColor="rgba(42,28,18,0.32)"
              returnKeyType="done"
              style={{
                flex: 1,
                height: LINE,
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: T.paperInk,
              }}
            />
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
}: {
  items: GiftItem[];
  onLog?: () => void;
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
              {item.title}
            </Text>
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
