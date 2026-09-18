// Utilitaires de gestion des fuseaux horaires bivalents en RDC (Chapitre Spécifique RDC 1)

export const RDC_TIMEZONES = {
  KINSHASA: {
    key: 'KINSHASA',
    id: 'Africa/Kinshasa',
    name: 'Kinshasa / Ouest',
    badge: 'Kinshasa (GMT+1)',
    shortBadge: 'GMT+1',
    offset: 1
  },
  LUBUMBASHI: {
    key: 'LUBUMBASHI',
    id: 'Africa/Lubumbashi',
    name: 'Lubumbashi / Est',
    badge: 'Lubumbashi (GMT+2)',
    shortBadge: 'GMT+2',
    offset: 2
  }
};

/**
 * Formate une date UTC stockée en base vers le fuseau horaire de la région du lecteur
 * @param {string|Date} utcDateStr - Date au format ISO / UTC
 * @param {string} zoneKey - 'KINSHASA' ou 'LUBUMBASHI'
 * @returns {string} - Date et heure locale ajustée avec mention du fuseau
 */
export const formatRdcDateTime = (utcDateStr, zoneKey = 'KINSHASA') => {
  if (!utcDateStr) return '';
  const date = new Date(utcDateStr);
  if (isNaN(date.getTime())) return utcDateStr;

  const target = RDC_TIMEZONES[zoneKey] || RDC_TIMEZONES.KINSHASA;

  try {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: target.id,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${formatter.format(date)} (${target.shortBadge})`;
  } catch (err) {
    return date.toLocaleString('fr-FR');
  }
};