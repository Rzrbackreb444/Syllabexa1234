import re

with open('src/components/SyllabexaBilling.tsx', 'r') as f:
    content = f.read()

import_auth = "import { useAuth } from '../lib/AuthContext';\n"
if "useAuth" not in content:
    content = content.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\n" + import_auth)

# Add usage inside the component
if "const { profile } = useAuth();" not in content:
    content = content.replace(
        "const [loading, setLoading] = useState<string | null>(null);",
        "const { profile } = useAuth();\n  const [loading, setLoading] = useState<string | null>(null);"
    )
    
    # Update body payload
    content = content.replace(
        "body: JSON.stringify({ priceId }),",
        "body: JSON.stringify({ priceId, userId: userId || profile?.uid, userEmail: userEmail || profile?.email }),"
    )

with open('src/components/SyllabexaBilling.tsx', 'w') as f:
    f.write(content)
