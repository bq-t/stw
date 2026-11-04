import { z } from 'zod';

// Schema of the world/info response, checked against a real response on 2026-11-04
// (fixtures/world-info-2026-11-04.json, not committed). We validate only the fields
// parse.ts reads; everything else passes through. If Epic changes any of them,
// validation fails loudly instead of the site showing garbage.

/** With Accept-Language set, Epic returns plain strings; without it, a { locale: text } map. */
const localizedText = z.union([z.string(), z.record(z.string(), z.string())]).optional();

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
  tiles: z
    .array(
      z.looseObject({
        zoneTheme: z.string().optional(),
      }),
    )
    .default([]),
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
export type RawTheater = z.infer<typeof theaterSchema>;
export type RawMission = z.infer<typeof availableMissionSchema>;
export type RawMissionAlert = z.infer<typeof missionAlertSchema>;
export type RawRewardItem = z.infer<typeof rewardItemSchema>;
