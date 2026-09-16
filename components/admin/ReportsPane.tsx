import { reportReasonMeta, type ContentReport, type ReportStatus } from "@/lib/reports";
import { useApp } from "@/lib/store";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

function statusLabel(status: ReportStatus) {
  if (status === "action_taken") return "Action taken";
  if (status === "dismissed") return "Dismissed";
  if (status === "reviewed") return "Reviewed";
  return "Pending";
}

function kindLabel(kind: ContentReport["mediaKind"]) {
  if (kind === "sexy-vault") return "Sexy Vault";
  if (kind === "photo-memory") return "Photo Memory";
  if (kind === "voice") return "Voice note";
  if (kind === "pair") return "Pair / account";
  return "Other";
}

export function ReportsPane() {
  const {
    contentReports,
    allProfiles,
    resolveContentReport,
    refreshCloudAccounts,
    usingCloud,
  } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usingCloud) return;
    void refreshCloudAccounts();
  }, [usingCloud, refreshCloudAccounts]);

  const name = (id: string | null) =>
    allProfiles.find((row) => row.id === id)?.displayName ?? (id ? id.slice(0, 8) : "—");

  const pending = contentReports.filter((row) => row.status === "pending");
  const rest = contentReports.filter((row) => row.status !== "pending");
  const rows = [...pending, ...rest];

  const act = async (id: string, action: "dismiss" | "action_taken") => {
    setBusyId(id);
    setError(null);
    try {
      await resolveContentReport(id, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resolve that report.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>Reports</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 8, lineHeight: 20 }}>
        App Store Guideline 1.2 queue. Review within 24 hours. Action taken bans the
        reported account (not a creator inbox) and ends their pairing.
      </Text>
      {error ? (
        <Text style={{ color: "#FF8A8A", marginTop: 10 }}>{error}</Text>
      ) : null}
      {rows.length === 0 ? (
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 24 }}>
          No reports yet.
        </Text>
      ) : (
        <View style={{ marginTop: 16, gap: 12 }}>
          {rows.map((row) => {
            const meta = reportReasonMeta(row.reason);
            const pendingRow = row.status === "pending";
            const blocked = busyId === row.id;
            return (
              <View
                key={row.id}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: pendingRow
                    ? "rgba(255,0,127,0.45)"
                    : "rgba(255,255,255,0.1)",
                  backgroundColor: pendingRow
                    ? "rgba(255,0,127,0.08)"
                    : "rgba(255,255,255,0.03)",
                  padding: 14,
                }}
              >
                <Text style={{ color: "#FF6B7A", fontWeight: "800", fontSize: 14 }}>
                  {meta.label}
                </Text>
                <Text style={{ color: "#F4F4F6", marginTop: 6, fontSize: 13 }}>
                  {name(row.reporterId)} → {name(row.reportedUserId)} · {kindLabel(row.mediaKind)}
                </Text>
                <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 12 }}>
                  {statusLabel(row.status)} · {row.createdAt.slice(0, 16).replace("T", " ")}
                  {row.mediaId ? ` · ${row.mediaId.slice(0, 8)}` : ""}
                </Text>
                {row.details ? (
                  <Text style={{ color: "rgba(244,244,246,0.7)", marginTop: 8, fontSize: 13 }}>
                    {row.details}
                  </Text>
                ) : null}
                {pendingRow ? (
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <Pressable
                      onPress={() => void act(row.id, "action_taken")}
                      disabled={blocked}
                      style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: "#FF007F",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: blocked ? 0.5 : 1,
                      }}
                    >
                      <Text style={{ color: "#0B0B0E", fontWeight: "800", fontSize: 12 }}>
                        Ban & unpair
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void act(row.id, "dismiss")}
                      disabled={blocked}
                      style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.18)",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: blocked ? 0.5 : 1,
                      }}
                    >
                      <Text style={{ color: "#F4F4F6", fontWeight: "700", fontSize: 12 }}>
                        Dismiss
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
