import type { QuickStartKey } from "@/types/post";

export const quickStartPresets: Record<
  QuickStartKey,
  {
    label: string;
    description: string;
    params: Record<string, string>;
  }
> = {
  reddit_discussion: {
    label: "Reddit discussion",
    description: "Honest thread starter tone",
    params: {
      platform: "reddit",
      content_type: "discussion",
      tone: "skeptical_reddit",
      audience: "general_tech",
    },
  },
  blog_post: {
    label: "Blog post",
    description: "Short sections, plain structure",
    params: {
      platform: "blog",
      content_type: "educational",
      tone: "practical_educational",
      audience: "solo_devs",
    },
  },
  x_post: {
    label: "X post",
    description: "Concise, no bait",
    params: {
      platform: "x",
      content_type: "founder_update",
      tone: "calm_founder",
      audience: "startup_founders",
    },
  },
  linkedin_post: {
    label: "LinkedIn post",
    description: "Calm and useful",
    params: {
      platform: "linkedin",
      content_type: "founder_update",
      tone: "boring_credible",
      audience: "engineering_managers",
    },
  },
  devlog: {
    label: "Devlog",
    description: "Build-in-public, tradeoffs",
    params: {
      platform: "devlog",
      content_type: "feature_announcement",
      tone: "casual_developer",
      audience: "solo_devs",
    },
  },
};

export const examplePresets = [
  {
    id: "eracode_reddit",
    title: "EraCode Reddit discussion",
    rawIdea:
      "AI coding tools are making developers faster, but they might also reduce the amount of practice developers get with fundamentals. I want to start a discussion around whether people are doing anything to stay sharp.",
    platform: "reddit",
    contentType: "discussion",
    tone: "skeptical_reddit",
    audience: "ai_assisted_devs",
  },
  {
    id: "eracode_blog",
    title: "EraCode blog post",
    rawIdea:
      "Daily coding practice should feel more like brushing your teeth or taking vitamins than grinding LeetCode. The goal is not interview prep. The goal is preventing skill atrophy while using AI tools.",
    platform: "blog",
    contentType: "educational",
    tone: "practical_educational",
    audience: "solo_devs",
  },
  {
    id: "bip_x",
    title: "Build-in-public X post",
    rawIdea:
      "I am building a small tool that helps developers keep their skills sharp in the AI coding era. The point is short daily practice, not more grind.",
    platform: "x",
    contentType: "founder_update",
    tone: "calm_founder",
    audience: "startup_founders",
  },
] as const;
