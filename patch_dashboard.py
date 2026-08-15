with open('src/components/QuickStartDashboard.tsx', 'r') as f:
    content = f.read()

# Replace amber with indigo
content = content.replace("bg-amber-500", "bg-indigo-600")
content = content.replace("text-amber-500", "text-indigo-500")
content = content.replace("text-amber-400", "text-indigo-400")
content = content.replace("border-amber-500", "border-indigo-500")

with open('src/components/QuickStartDashboard.tsx', 'w') as f:
    f.write(content)
