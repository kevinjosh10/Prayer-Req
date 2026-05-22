import { db } from './config';
import { ref, push, set, onValue, remove, update, query, orderByChild, equalTo, get, runTransaction } from "firebase/database";

// Generate a random prayer code (e.g., HOPE-A1B2C)
const generatePrayerCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const prefixes = ['HOPE', 'GRACE', 'FAITH', 'PEACE', 'LIGHT'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}-${code}`;
};

// Submit a new prayer request
export const submitPrayerRequest = async (requestData) => {
  const requestsRef = ref(db, 'prayerRequests');
  const newRequestRef = push(requestsRef);
  const prayerCode = generatePrayerCode();
  const finalIsPublic = requestData.isPublic === false ? false : true;
  
  await set(newRequestRef, {
    ...requestData,
    prayerCode,
    createdAt: Date.now(),
    prayedFor: false,
    prayedForAt: null,
    communityPrayers: 0,
    isPublic: finalIsPublic
  });
  
  return { id: newRequestRef.key, prayerCode };
};

// Listen for all prayer requests (real-time)
export const listenToPrayerRequests = (callback) => {
  const requestsRef = ref(db, 'prayerRequests');
  return onValue(requestsRef, (snapshot) => {
    const data = snapshot.val();
    const requests = [];
    if (data) {
      Object.keys(data).forEach(key => {
        requests.push({ id: key, ...data[key] });
      });
    }
    // Sort by createdAt descending
    requests.sort((a, b) => b.createdAt - a.createdAt);
    callback(requests);
  });
};

import { onChildAdded, limitToLast } from "firebase/database";

// Listen specifically for newly added prayers to trigger animations
export const listenToNewPrayers = (callback) => {
  const requestsRef = ref(db, 'prayerRequests');
  // Use limitToLast(1) so we only get the very newest ones after load
  const q = query(requestsRef, limitToLast(1));
  
  let isInitialLoad = true;
  
  return onChildAdded(q, (snapshot) => {
    // Ignore the initial load item
    if (isInitialLoad) {
      isInitialLoad = false;
      return;
    }
    callback(snapshot.val());
  });
};

import { onChildChanged } from "firebase/database";

// Listen specifically for updates to existing prayers (like when someone clicks Pray)
export const listenToPrayerInteractions = (callback) => {
  const requestsRef = ref(db, 'prayerRequests');
  
  return onChildChanged(requestsRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Check prayer status by code
export const checkPrayerStatusByCode = async (code) => {
  const requestsRef = ref(db, 'prayerRequests');
  const q = query(requestsRef, orderByChild('prayerCode'), equalTo(code.toUpperCase()));
  const snapshot = await get(q);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    const key = Object.keys(data)[0];
    return { id: key, ...data[key] };
  }
  return null;
};

// Increment community prayer count
export const incrementCommunityPrayer = async (id) => {
  const requestRef = ref(db, `prayerRequests/${id}/communityPrayers`);
  await runTransaction(requestRef, (currentCount) => {
    return (currentCount || 0) + 1;
  });
};

// Mark prayer request as prayed for
export const markAsPrayed = async (id, status = true) => {
  const requestRef = ref(db, `prayerRequests/${id}`);
  await update(requestRef, {
    prayedFor: status,
    prayedForAt: status ? Date.now() : null
  });
};

// Update prayer visibility (public/private)
export const updatePrayerVisibility = async (id, isPublic, unflag = false) => {
  const requestRef = ref(db, `prayerRequests/${id}`);
  const updates = { isPublic: isPublic };
  if (unflag) updates.flagged = false;
  await update(requestRef, updates);
};

// Flag a prayer request (hides it and marks as flagged)
export const flagPrayerRequest = async (id) => {
  const requestRef = ref(db, `prayerRequests/${id}`);
  await update(requestRef, {
    isPublic: false,
    flagged: true
  });
};

// Delete a prayer request
export const deletePrayerRequest = async (id) => {
  const requestRef = ref(db, `prayerRequests/${id}`);
  await remove(requestRef);
};

// ==========================================
// TESTIMONIES / PRAISE REPORTS
// ==========================================

export const submitTestimony = async (data) => {
  const testimoniesRef = ref(db, 'testimonies');
  const newRef = push(testimoniesRef);
  
  await set(newRef, {
    ...data,
    createdAt: Date.now(),
    praises: 0
  });
  
  return newRef.key;
};

export const listenToTestimonies = (callback) => {
  const testimoniesRef = ref(db, 'testimonies');
  return onValue(testimoniesRef, (snapshot) => {
    const data = snapshot.val();
    const items = [];
    if (data) {
      Object.keys(data).forEach(key => {
        items.push({ id: key, ...data[key] });
      });
    }
    items.sort((a, b) => b.createdAt - a.createdAt);
    callback(items);
  });
};

export const incrementTestimonyPraise = async (id) => {
  const testimonyRef = ref(db, `testimonies/${id}/praises`);
  await runTransaction(testimonyRef, (currentCount) => {
    return (currentCount || 0) + 1;
  });
};

export const deleteTestimony = async (id) => {
  const testimonyRef = ref(db, `testimonies/${id}`);
  await remove(testimonyRef);
};
