import re

with open('server.ts', 'r') as f:
    content = f.read()

# Fix the broken imports at the top
header = """import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";
import { stripeWebhookHandler } from './src/api/stripe-webhook';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
"""

content = re.sub(r'^import express from "express";.*?import firebaseConfig from "./firebase-applet-config\.json";', header, content, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(content)

