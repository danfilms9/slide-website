import { getFirebaseReady, getDbInstance } from "./firebase/firebase";
import type { Firestore } from "firebase/firestore";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const VOTES_COLLECTION = "votes";

export type VoteValue = "option1" | "option2";

export interface VoteDocument {
  vote: string;
  timestamp: ReturnType<typeof serverTimestamp>;
  email: string;
}

function getDb(): Firestore {
  const instance = getDbInstance();
  if (!instance) {
    throw new Error(
      "Firestore is not initialized. Ensure Firebase config is loaded and getFirebaseReady() has resolved."
    );
  }
  return instance;
}

/**
 * Submit or overwrite the current user's vote.
 * Document ID = userId so one vote per user (overwrites if they vote again).
 */
export async function submitVote(
  userId: string,
  vote: VoteValue,
  email: string
): Promise<void> {
  await getFirebaseReady();
  const db = getDb();
  const voteRef = doc(db, VOTES_COLLECTION, userId);
  await setDoc(voteRef, {
    vote,
    timestamp: serverTimestamp(),
    email: email || "",
  });
}

/**
 * Get the current user's vote, or null if they haven't voted.
 */
export async function getUserVote(
  userId: string
): Promise<VoteValue | null> {
  await getFirebaseReady();
  const db = getDb();
  const voteRef = doc(db, VOTES_COLLECTION, userId);
  const snap = await getDoc(voteRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  const v = data?.vote;
  if (v === "option1" || v === "option2") return v;
  return null;
}

/**
 * Get total vote counts for option1 and option2 (simple query, no aggregation).
 */
export async function getVoteCounts(): Promise<{
  option1: number;
  option2: number;
}> {
  await getFirebaseReady();
  const db = getDb();
  const col = collection(db, VOTES_COLLECTION);
  const snapshot = await getDocs(col);
  let option1 = 0;
  let option2 = 0;
  snapshot.docs.forEach((d) => {
    const v = d.data()?.vote;
    if (v === "option1") option1 += 1;
    else if (v === "option2") option2 += 1;
  });
  return { option1, option2 };
}
