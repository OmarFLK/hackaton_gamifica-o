export const NOTIFICATIONS_REFRESH = 'pendi:notifications-refresh'
export function refreshNotifications() { window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH)) }
