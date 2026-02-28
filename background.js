/**
 * Feedex - Background Service Worker
 * Gère l'ouverture du side panel
 */

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});