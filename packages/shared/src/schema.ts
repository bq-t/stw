import { z } from 'zod';

// Lenient schema of the world/info response: we only validate the fields parse.ts reads.
// If Epic changes any of them, validation fails loudly instead of the site showing garbage.
// TODO(stage 2): tighten against a real response saved in fixtures/.

const localizedText = z.record(z.string(), z.string()).optional();

export const rewardItemSchema = z.looseObject({
  itemType: z.string(),
  quantity: z.number(),
});

const rewardsSchema = z
  .looseObject({
    tierGroupName: z.string().optional(),
    items: z.array(rewardItemSchema).default([]),
  })
  .optional();

export const theaterSchema = z.looseObject({
  uniqueId: z.string(),
  displayName: localizedText,
});

export const availableMissionSchema = z.looseObject({
  missionGuid: z.string(),
  missionGenerator: z.string(),
  tileIndex: z.number(),
  availableUntil: z.string(),
  missionRewards: rewardsSchema,
  missionDifficultyInfo: z
    .looseObject({
      rowName: z.string(),
    })
    .optional(),
});

export const missionAlertSchema = z.looseObject({
  missionAlertGuid: z.string(),
  tileIndex: z.number(),
  availableUntil: z.string(),
  categoryName: z.string().optional(),
  name: z.string().optional(),
  missionAlertRewards: rewardsSchema,
  missionAlertModifiers: z
    .looseObject({
      items: z.array(rewardItemSchema).default([]),
    })
    .optional(),
});

export const worldInfoSchema = z.looseObject({
  theaters: z.array(theaterSchema),
  missions: z.array(
    z.looseObject({
      theaterId: z.string(),
      availableMissions: z.array(availableMissionSchema),
    }),
  ),
  missionAlerts: z.array(
    z.looseObject({
      theaterId: z.string(),
      availableMissionAlerts: z.array(missionAlertSchema),
    }),
  ),
});

export type RawWorldInfo = z.infer<typeof worldInfoSchema>;
export type RawMission = z.infer<typeof availableMissionSchema>;
export type RawMissionAlert = z.infer<typeof missionAlertSchema>;
export type RawRewardItem = z.infer<typeof rewardItemSchema>;
