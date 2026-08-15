with open('src/components/AppLayout.tsx', 'r') as f:
    lines = f.readlines()

out_lines = []
skip = False
for line in lines:
    if "{studioView === 'quick-start' ? (" in line:
        skip = True
        out_lines.append("        <Outlet />\n")
        continue
    if skip:
        if ")}\n" == line or "        )}\n" == line:
            skip = False
        continue
    out_lines.append(line)

with open('src/components/AppLayout.tsx', 'w') as f:
    f.writelines(out_lines)

