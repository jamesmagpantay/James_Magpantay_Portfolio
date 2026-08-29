import type { Hobby } from "./types";

/**
 * ⚠️  PLACEHOLDER CONTENT — NEEDS JAMES'S INPUT
 *
 * Nothing here is real yet. Every entry has `confirmed: false`, which makes
 * the page render an honest "not filled in yet" state instead of presenting
 * invented facts as true.
 *
 * To fill this in: replace the name/detail with something real and flip
 * `confirmed` to true. The page switches to the finished layout automatically
 * once at least one entry is confirmed.
 *
 * What makes a good entry: specific beats impressive. "Bouldering, currently
 * stuck on a V4" is memorable. "Fitness" is not.
 */
export const hobbies: Hobby[] = [
  {
    name: "Hobby one",
    detail: "What you actually do, and one specific detail about it.",
    icon: "Mountain",
    confirmed: false,
  },
  {
    name: "Hobby two",
    detail: "Something you would talk about unprompted.",
    icon: "Music",
    confirmed: false,
  },
  {
    name: "Hobby three",
    detail: "A thing you are currently bad at but doing anyway.",
    icon: "Gamepad2",
    confirmed: false,
  },
  {
    name: "Hobby four",
    detail: "Something that has nothing to do with computers.",
    icon: "Coffee",
    confirmed: false,
  },
];

/** Replace with your own. Rendered as the section's opening statement. */
export const personalIntro = {
  text: "Placeholder — this is where you say who you are when you are not in front of a terminal. A few sentences, in your own voice.",
  confirmed: false,
};

/** Optional: things you are into, currently reading/watching/playing. */
export const currently: { label: string; value: string; confirmed: boolean }[] = [
  { label: "Reading", value: "—", confirmed: false },
  { label: "Listening to", value: "—", confirmed: false },
  { label: "Playing", value: "—", confirmed: false },
  { label: "Learning", value: "Google Cybersecurity Professional", confirmed: true },
];

export const personalIsReady =
  hobbies.some((h) => h.confirmed) || personalIntro.confirmed;
