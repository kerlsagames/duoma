export const TALK_PACKS = [
  {
    id: "heat",
    label: "Heat",
    prompts: [
      "What is one thing I did recently that made you want me?",
      "Where do you want my hands first tonight?",
      "What should we stop treating as 'too much' in bed?",
      "Describe a night with me you still replay.",
      "What outfit of mine should I wear again on purpose?",
      "If we had a free hour with a locked door, what happens?",
    ],
  },
  {
    id: "us",
    label: "Us",
    prompts: [
      "When did you last feel chosen by me?",
      "What is a small luxury we should stop calling extra?",
      "What should we say no to this month?",
      "What is one quiet thing I do that you actually notice?",
      "If this week had a soundtrack, what song is ours?",
      "What would make tomorrow feel 10% easier?",
    ],
  },
  {
    id: "dare",
    label: "Dare",
    prompts: [
      "Tell me a secret you've been saving for a better moment.",
      "What is a yes you wish I would offer without being asked?",
      "What apology is still sitting between us?",
      "What are you quietly excited about that I missed?",
      "If we cancelled every plan this Saturday, how do we spend it?",
      "What do you want more of in our evenings — be specific.",
    ],
  },
] as const;

export type TalkPackId = (typeof TALK_PACKS)[number]["id"];
