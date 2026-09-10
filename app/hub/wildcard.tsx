import { HubScreen } from "@/components/hub/HubScreen";
import { SpicyDarePanel } from "@/components/hub/SpicyDarePanel";

export default function WildcardScreen() {
  return (
    <HubScreen
      kicker="Wildcard"
      title="Challenges & Dares"
      body="Browse spicy prompts, tweak the wording, then choose who does it and when. I'll do this to you — or you do this to me, if you're up for it."
    >
      <SpicyDarePanel mode="page" />
    </HubScreen>
  );
}
