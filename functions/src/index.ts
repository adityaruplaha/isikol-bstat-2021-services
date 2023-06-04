/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { auth } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { logger, setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, beforeUserCreated } from "firebase-functions/v2/identity";
import { region } from "firebase-functions/v1"

import { google } from "googleapis"

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const REGION = "asia-east1";

setGlobalOptions({ region: REGION });

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

type StudentData = {
  found: boolean,
  err?: 'fetch-fail' | 'invalid-email',
  data?: {
    name: string,
    email: string,
    rollno: string,
    phone?: string,
    role: 'default' | 'admin'
  }
}

const getData = async (email? : string) : Promise<StudentData> => {
  if (email == "isikol.bstat.2021@gmail.com") return {
    found: true,
    data: {
      name: "ISI B. Stat. '24",
      email: email,
      rollno: "BS2100",
      role: 'admin',
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
  if (!email || i < 0) return {
    found: false,
    err: "invalid-email"
  };
  return {
    found: true,
    data: {
      name: rows[i][1],
      email: email,
      rollno: rows[i][0],
      phone: rows[i][3],
      role: 'default'
    }
  }
}

export const whitelistCheck = beforeUserCreated(async (event) => {
    const user = event.data;
    const { found, data, err } = await getData(user?.email)
    if (!found) {
      if (err == "fetch-fail") {
        logger.error(`Blocked signup for ${user?.email} (whitelist fetch failed).`)
        throw new HttpsError('internal', "Unable to fetch email whitelist.");
      } else if (err == "invalid-email") {
        logger.warn(`Blocked signup for ${user?.email} (not in whitelist).`)
        throw new HttpsError('permission-denied', "Unauthorized email.");
      }
    }
    if (!data) {
      logger.error(`Blocked signup for ${user?.email} (data invalid).`)
      throw new HttpsError('internal', "Data invalid.");
    }
    logger.info(user?.email + " signed up.")
    const { name, rollno, role } = data
    return {
      displayName: name,
      emailVerified: true,
      customClaims: {
        rollno,
        role
      }
    }
});

export const addUser = region(REGION).auth.user().onCreate(async (user) => {
    const { data } = await getData(user?.email);
    if (data) {
      const { rollno, phone } = data
      auth().updateUser(user.uid, {
        phoneNumber: phone || null
      })
      await firestore.collection("/users").add({
        id: user.uid,
        rollno
      })
    }
})
