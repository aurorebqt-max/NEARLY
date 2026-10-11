import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  extra: {
    ...config.extra,
    eas: {
      ...(config.extra?.eas ?? {}),
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
});
