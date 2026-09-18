import { useApp } from "@/lib/store";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

function whenLabel(iso: string): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return iso;
  return new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FeedbackPane() {
  const { feedbackNotes, allProfiles, refreshCloudAccounts, usingCloud } = useApp();
  const [ready, setReady] = useState(!usingCloud);

  useEffect(() => {
    if (!usingCloud) return;
    void refreshCloudAccounts().finally(() => setReady(true));
  }, [usingCloud, refreshCloudAccounts]);

  const name = (row: (typeof feedbackNotes)[number]) => {
    const profile = allProfiles.find((item) => item.id === row.userId);
    return profile?.displayName?.trim() || row.displayName || "Someone";
  };
  const email = (row: (typeof feedbackNotes)[number]) => {
    const profile = allProfiles.find((item) => item.id === row.userId);
    return profile?.email || row.email;
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>
        Feedback
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 8, lineHeight: 20 }}>
        Help, feedback, and suggestions. Newest first. The app they were in is
        tagged on each note.
      </Text>
      {!ready ? (
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 24 }}>
          Loading…
        </Text>
      ) : feedbackNotes.length === 0 ? (
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 24 }}>
          Nothing sent yet. If you just sent one on the live app, paste SQL 018 in
          the Supabase SQL editor and Run it so the passphrase can read Help →
          Feedback. A note that never reached the cloud will still be empty here.
        </Text>
      ) : (
        <View style={{ marginTop: 16, gap: 12 }}>
          {feedbackNotes.map((row) => (
            <View
              key={row.id}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                backgroundColor: "#14141A",
                padding: 14,
              }}
            >
              <Text style={{ color: "#FF007F", fontFamily: "SpaceMono", fontSize: 11 }}>
                {whenLabel(row.createdAt)}
                {row.source ? ` · ${row.source}` : ""}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  color: "#F4F4F6",
                  fontSize: 16,
                  fontWeight: "800",
                }}
              >
                {name(row)}
              </Text>
              {email(row) ? (
                <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.55)", fontSize: 13 }}>
                  {email(row)}
                </Text>
              ) : null}
              <Text
                style={{
                  marginTop: 10,
                  color: "#F4F4F6",
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                {row.body}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
