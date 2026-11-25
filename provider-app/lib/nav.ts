import { router, type Href } from 'expo-router';

/** Goes back if there is a screen to return to (e.g. not after a page refresh); otherwise opens `fallback`. */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
