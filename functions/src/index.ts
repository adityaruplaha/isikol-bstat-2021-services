/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { logger } from "firebase-functions/v2";
import { HttpsError, beforeUserCreated } from "firebase-functions/v2/identity";
import { user } from "firebase-functions/v1/auth"

import { google } from "googleapis"

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

initializeApp();
const firestore = getFirestore();

// block on auth + getting the sheets API object
const serviceAuth = new google.auth.JWT({
  email: process.env.SERVICE_ACCOUNT_EMAIL,
  key: process.env.SERVICE_ACCOUNT_KEY,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets"
  ]
});

const getData = async (email? : string) => {
  if (email == "isikol.bstat.2021@gmail.com") return {
    found: true,
    data: {
      name: "ISI B. Stat. '24",
      email: email,
      rollno: "BS2100",
      role: 'admin'
    }
  } 

  const sheetsAPI = google.sheets({version: 'v4', auth: serviceAuth});
  const res = await sheetsAPI.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'MainData!A2:H'
  })
  const rows = res.data.values;
  if (!rows) return {
    found: false,
    err: "fetch-fail"
  };
  const i = rows.map(row => row[2]).findIndex((val) => val == email)
  if (i < 0) return {
    found: false,
    err: "invalid-email"
  };
  return {
    found: true,
    data: {
      name: rows[i][1],
      email: email,
      rollno: rows[i][0],
      role: 'default'
    }
  }
}

export const whitelistCheck = beforeUserCreated(async (event) => {
    const user = event.data;
    const { found, err } = await getData(user?.email)
    if (!found) {
      if (err == "fetch-fail") {
        logger.error("Blocked signup for " + user?.email + " (whitelist fetch failed).")
        throw new HttpsError('permission-denied', "Unable to fetch email whitelist.");
      } else if (err == "invalid-email") {
        logger.warn("Blocked signup for " + user?.email + " (not in whitelist).")
        throw new HttpsError('permission-denied', "Unauthorized email.");
      }
    }
    logger.info(user?.email + " signed up.")
    return {
      emailVerified: true
    }
});

export const addUser = user().onCreate(async (user) => {
    const { data } = await getData(user?.email);
    if (data) {
      await firestore.collection("/users").add(data)
    }
})
