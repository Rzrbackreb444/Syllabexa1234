import re

with open('server.ts', 'r') as f:
    content = f.read()

header = """import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";
import { initializeApp as initializeClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";
import { stripeWebhookHandler } from './src/api/stripe-webhook';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp(); // Use Application Default Credentials
}
"""

content = re.sub(r'^import express from "express";.*?if \(\!admin\.apps\.length\) \{.*?\}\n', header, content, flags=re.DOTALL)
content = content.replace("initializeApp(firebaseConfig);", "initializeClientApp(firebaseConfig);")
content = content.replace("getFirestore(firebaseApp", "getClientFirestore(firebaseApp")

with open('server.ts', 'w') as f:
    f.write(content)

