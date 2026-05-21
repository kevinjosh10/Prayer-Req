import { db } from './config';
import { ref, push, set, onValue, remove, update } from "firebase/database";

// Submit a new prayer request
export const submitPrayerRequest = async (requestData) => {
  const requestsRef = ref(db, 'prayerRequests');
  const newRequestRef = push(requestsRef);
  
  await set(newRequestRef, {
    ...requestData,
    createdAt: Date.now(),
    prayedFor: false
  });
  
  return newRequestRef.key;
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

// Mark prayer request as prayed for
export const markAsPrayed = async (id, status = true) => {
  const requestRef = ref(db, `prayerRequests/${id}`);
  await update(requestRef, {
    prayedFor: status
  });
};

// Delete a prayer request
export const deletePrayerRequest = async (id) => {
  const requestRef = ref(db, `prayerRequests/${id}`);
  await remove(requestRef);
};
