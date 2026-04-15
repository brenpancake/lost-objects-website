/**
 * Lost Objects CRM — Data Layer
 *
 * Abstraction over storage so the CRM can eventually swap from
 * localStorage to Airtable (or any remote backend) without touching
 * UI code.
 *
 * When DEMO_MODE is true everything reads/writes to localStorage.
 * Flip it to false and implement the Airtable helpers when ready.
 */

var DataLayer = (function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────
  var DEMO_MODE = true;

  // localStorage key registry (matches keys used by the CRM app)
  var KEYS = {
    contacts:  'lo-contacts-v3',
    prefs:     'lo-prefs-v1',
    notifs:    'lo-notifs-v1',
    users:     'lo-users-v1',
    dms:       'lo-dms-v1',
    presence:  'lo-presence-v1',
    emailCfg:  'lo-email-cfg',
    companies: 'lo-companies-v1'
  };

  // ── Local helpers ───────────────────────────────────────────────
  function localGet(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch (e) { return null; }
  }

  function localSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ── Public API ──────────────────────────────────────────────────

  /** Generic get — returns parsed object or null */
  function get(collection) {
    var key = KEYS[collection];
    if (!key) { console.warn('[DataLayer] Unknown collection:', collection); return null; }

    if (DEMO_MODE) {
      return localGet(key);
    }

    // TODO: Airtable fetch for this collection
    console.warn('[DataLayer] Airtable not yet implemented — falling back to local.');
    return localGet(key);
  }

  /** Generic set — persists value for the given collection */
  function set(collection, value) {
    var key = KEYS[collection];
    if (!key) { console.warn('[DataLayer] Unknown collection:', collection); return; }

    if (DEMO_MODE) {
      localSet(key, value);
      return;
    }

    // TODO: Airtable upsert for this collection
    console.warn('[DataLayer] Airtable not yet implemented — falling back to local.');
    localSet(key, value);
  }

  /** Get all contacts */
  function getContacts() {
    return get('contacts') || [];
  }

  /** Save full contacts array */
  function saveContacts(arr) {
    set('contacts', arr);
  }

  /** Find a single contact by id */
  function getContact(id) {
    var all = getContacts();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  /** Upsert a single contact (insert if new, update if exists) */
  function upsertContact(contact) {
    var all = getContacts();
    var found = false;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === contact.id) {
        all[i] = contact;
        found = true;
        break;
      }
    }
    if (!found) all.push(contact);
    saveContacts(all);
    return contact;
  }

  /** Delete a contact by id */
  function deleteContact(id) {
    var all = getContacts();
    saveContacts(all.filter(function (c) { return c.id !== id; }));
  }

  /** Company data helpers */
  function getCompanies() { return get('companies') || {}; }
  function saveCompanies(obj) { set('companies', obj); }

  /** Notification helpers */
  function getNotifs() { return get('notifs') || []; }
  function saveNotifs(arr) { set('notifs', arr); }

  /** DM helpers */
  function getDMs() { return get('dms') || {}; }
  function saveDMs(obj) { set('dms', obj); }

  /** User prefs helpers */
  function getPrefs() { return get('prefs') || {}; }
  function savePrefs(obj) { set('prefs', obj); }

  /** Custom users helpers */
  function getUsers() { return get('users') || {}; }
  function saveUsers(obj) { set('users', obj); }

  // ── Expose ──────────────────────────────────────────────────────
  return {
    DEMO_MODE: DEMO_MODE,
    KEYS: KEYS,

    // generic
    get: get,
    set: set,

    // contacts
    getContacts: getContacts,
    saveContacts: saveContacts,
    getContact: getContact,
    upsertContact: upsertContact,
    deleteContact: deleteContact,

    // companies
    getCompanies: getCompanies,
    saveCompanies: saveCompanies,

    // notifications
    getNotifs: getNotifs,
    saveNotifs: saveNotifs,

    // DMs
    getDMs: getDMs,
    saveDMs: saveDMs,

    // prefs
    getPrefs: getPrefs,
    savePrefs: savePrefs,

    // users
    getUsers: getUsers,
    saveUsers: saveUsers
  };
})();
