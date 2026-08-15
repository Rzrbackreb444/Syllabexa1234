import re

with open('src/AppLayout.tsx', 'r') as f:
    content = f.read()

imports = """import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SyllabexaAuth from './components/SyllabexaAuth';
"""

content = content.replace("import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';", imports + "import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';")

auth_regex = re.compile(r"const \[firebaseUser,\s*setFirebaseUser\]\s*=\s*useState<any>\(\{[\s\S]*?\}\);\s*const \[userProfile,\s*setUserProfile\]\s*=\s*useState<any>\(\{[\s\S]*?\}\);\s*const \[authLoading,\s*setAuthLoading\]\s*=\s*useState\(true\);", re.MULTILINE)

replacement_auth = """
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // Profile setup might not be complete, or they just signed up
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);
"""

content = auth_regex.sub(replacement_auth, content)

return_regex = re.compile(r"return \(\s*<div className=\"flex flex-col h-screen", re.MULTILINE)
replacement_return = """
  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#07080a] text-amber-500"><Sparkles className="animate-pulse w-8 h-8" /></div>;
  }

  if (!firebaseUser) {
    return <SyllabexaAuth onAuthComplete={(user, profile) => {
      setFirebaseUser(user);
      setUserProfile(profile);
    }} />;
  }

  return (
    <div className="flex flex-col h-screen"""

content = return_regex.sub(replacement_return, content)

with open('src/AppLayout.tsx', 'w') as f:
    f.write(content)

