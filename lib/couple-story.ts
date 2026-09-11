export type StoryChoice = {
  id: string;
  label: string;
  continuation: string;
};

export type StoryTrunk = {
  id: string;
  title: string;
  kicker: string;
  opening: string;
  choices: StoryChoice[];
};

export const STORY_TRUNKS: StoryTrunk[] = [
  {
    id: "rain-station",
    title: "The last train",
    kicker: "Rain · city · almost",
    opening:
      "The station clock jumped a minute without asking. Rain made the platform look varnished. You were both holding coffees you didn't want, waiting for a train that might already have decided against you. Somewhere a violin case opened. Neither of you looked away first.",
    choices: [
      {
        id: "miss-it",
        label: "Miss the train on purpose",
        continuation:
          "The train sighed in and out. You let it. In the leftover quiet, one of you said, 'Walk?' like it was a dare. The city had that washed-coin smell. Every doorway looked like a secret.",
      },
      {
        id: "run",
        label: "Run for the closing doors",
        continuation:
          "You made it with a laugh that was mostly lungs. The carriage was empty except for a man asleep on his own reflection. Between stations, the lights flickered, and for three seconds you were the only two people in the world who were awake.",
      },
      {
        id: "note",
        label: "Leave a note on the bench",
        continuation:
          "One of you wrote a single line on a receipt and pinned it with a coffee lid: If you find this, we went looking for the night. An hour later you circled back. The note was gone. In its place, a ticket stub to somewhere neither of you had mentioned.",
      },
    ],
  },
  {
    id: "cabin-key",
    title: "The key under the mat",
    kicker: "Woods · storm · one bed",
    opening:
      "The listing photos had lied in a charming way. The cabin was smaller, the trees taller, the key exactly where the host promised: under a stone shaped like an argument. Inside: one lamp, one kettle, one bed that had opinions. Thunder rehearsed in the valley.",
    choices: [
      {
        id: "storm",
        label: "Invite the storm in",
        continuation:
          "You opened the porch door a sliver so the rain could gossip. The kettle screamed. Someone found a dusty radio that only knew one slow song. You danced badly on purpose, then less badly, then not at all because the song had other ideas.",
      },
      {
        id: "map",
        label: "Follow the hand-drawn map",
        continuation:
          "In a drawer: a map labeled 'if you get bored of each other.' It led to a lookout twenty minutes through wet ferns. At the top the whole valley blinked. You stood close enough that jackets became a technicality.",
      },
      {
        id: "truth",
        label: "Play the drawer game",
        continuation:
          "Rule: each closed drawer holds a question you have to answer. The first was easy. The third was not. By the fifth, the storm had moved inside your ribs, and nobody was pretending this was still a joke.",
      },
    ],
  },
  {
    id: "hotel-one",
    title: "One key, two names",
    kicker: "Hotel · midnight · alias",
    opening:
      "The clerk didn't blink at the alias. The elevator took its time. The hallway smelled like someone else's perfume and cold marble. Inside the room: a window that made the city look like it was performing, and a note from the hotel that said, in tiny type, Enjoy the view. You took that personally.",
    choices: [
      {
        id: "rooftop",
        label: "Find the rooftop that's closed",
        continuation:
          "The stairwell door was 'alarmed' in theory. The roof was empty and windy and slightly illegal. You passed a bottle back and forth. Below, taxis drew gold lines. One of you said a sentence that could ruin a friendship or start a decade.",
      },
      {
        id: "room-service",
        label: "Order the most extra thing",
        continuation:
          "Fries, champagne, and a dessert that arrived with a sparkler like it knew you. You ate on the floor because the bed felt like a stage. At some point the sparkler died and neither of you turned the overhead lights on.",
      },
      {
        id: "wrong-door",
        label: "Knock on the wrong door first",
        continuation:
          "You had the floor right and the number wrong. A stranger in a robe considered you, then smiled like they'd been expecting a plot twist. 'Not tonight,' they said, and handed you a matchbook with a bar name. The right room could wait ten minutes.",
      },
    ],
  },
];

export function storyById(id: string): StoryTrunk | null {
  return STORY_TRUNKS.find((row) => row.id === id) ?? null;
}
