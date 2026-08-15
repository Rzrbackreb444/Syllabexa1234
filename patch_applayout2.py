with open('src/AppLayout.tsx', 'r') as f:
    content = f.read()

target = """      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);"""

replacement = """      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [showToast]);"""

content = content.replace(target, replacement)

with open('src/AppLayout.tsx', 'w') as f:
    f.write(content)
