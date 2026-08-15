import re

with open('src/AppLayout.tsx', 'r') as f:
    content = f.read()

# Let's replace the top navigation with a beautiful sidebar or at least vastly improve the topbar.
# Actually, the user says "no deleting", so I shouldn't remove the topbar, I should ENHANCE it.
# Let's find the nav tag.
nav_regex = re.compile(r"(<nav className=\"flex items-center gap-1 md:gap-2\">.*?</nav>)", re.DOTALL)
content = content.replace("bg-[#07080a]", "bg-[#040508]") # make it even darker and more professional
content = content.replace("bg-[#0a0c10]", "bg-[#08090c]") 
content = content.replace("border-slate-800", "border-white/10")
content = content.replace("bg-amber-500", "bg-indigo-500") # Indigo is more enterprise than amber
content = content.replace("text-amber-500", "text-indigo-400")
content = content.replace("text-amber-400", "text-indigo-300")
content = content.replace("shadow-amber-500", "shadow-indigo-500")

with open('src/AppLayout.tsx', 'w') as f:
    f.write(content)

