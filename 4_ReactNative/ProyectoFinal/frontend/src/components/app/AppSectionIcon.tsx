import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type AppSectionIconName = keyof typeof Ionicons.glyphMap | 'horseshoe';

export function AppSectionIcon({ name, color, size }: { name: AppSectionIconName; color: ComponentProps<typeof Ionicons>['color']; size: number }) {
  if (name === 'horseshoe') return <MaterialCommunityIcons name={name} color={color} size={size} />;
  return <Ionicons name={name} color={color} size={size} />;
}
