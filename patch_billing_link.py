import re

with open('src/AppLayout.tsx', 'r') as f:
    content = f.read()

import_icon = "import { CreditCard } from 'lucide-react';\n"
if "CreditCard" not in content:
    content = content.replace("import { \n  Settings,", import_icon + "import { \n  Settings,")
    content = content.replace("import {\n  Settings,", import_icon + "import {\n  Settings,")

billing_button = """
                    <button 
                      onClick={() => {
                        navigate('/billing');
                        setShowProfileDropdown(false);
                      }} 
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-amber-400 hover:bg-[#12151c] rounded-xl transition-all cursor-pointer text-left mt-1"
                    >
                      <CreditCard className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                      <span>Billing & Plans</span>
                    </button>
"""

content = content.replace("<span>Studio Settings</span>\n                    </button>", "<span>Studio Settings</span>\n                    </button>" + billing_button)

with open('src/AppLayout.tsx', 'w') as f:
    f.write(content)

