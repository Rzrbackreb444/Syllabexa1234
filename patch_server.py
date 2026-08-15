import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("import * as admin from 'firebase-admin';", "import admin from 'firebase-admin';")
content = content.replace("import admin from 'firebase-admin';", "const admin = require('firebase-admin');")

with open('server.ts', 'w') as f:
    f.write(content)
