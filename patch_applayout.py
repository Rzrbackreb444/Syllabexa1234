import re

with open('src/AppLayout.tsx', 'r') as f:
    content = f.read()

target = r"""  // Authentication & Profile States  
  const \[firebaseUser, setFirebaseUser\] = useState<any>\(null\);
  const \[userProfile, setUserProfile\] = useState<any>\(null\);
  const \[authLoading, setAuthLoading\] = useState\(true\);

  useEffect\(\(\) => \{
    const auth = getAuth\(\);
    const unsubscribe = onAuthStateChanged\(auth, async \(user\) => \{
      setFirebaseUser\(user\);
      if \(user\) \{
        const docRef = doc\(db, 'users', user.uid\);"""

replacement = """  // Authentication & Profile States  
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkCheckoutSuccess = async (user: any) => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout') === 'success' && user) {
        try {
          await fetch('/api/stripe/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid })
          });
          showToast('Welcome to Pro! Payment verified.', 'success');
          
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({path:newUrl},'',newUrl);
        } catch (e) {
          console.error("Failed to verify checkout", e);
        }
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        checkCheckoutSuccess(user);
        const docRef = doc(db, 'users', user.uid);"""

content = re.sub(target, replacement, content)

with open('src/AppLayout.tsx', 'w') as f:
    f.write(content)
