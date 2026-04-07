import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(
    page_title="AIGC — AI Governance Coordinator",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Hide Streamlit chrome so the app fills the whole viewport
st.markdown("""
<style>
    #MainMenu, header, footer { display: none !important; }
    .block-container { padding: 0 !important; max-width: 100% !important; }
    section[data-testid="stSidebar"] { display: none !important; }
    iframe { border: none !important; }
</style>
""", unsafe_allow_html=True)

# Load the three source files
base_dir = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(base_dir, "styles.css"), "r") as f:
    css = f.read()

with open(os.path.join(base_dir, "app.js"), "r") as f:
    js = f.read()

with open(os.path.join(base_dir, "index.html"), "r") as f:
    html_raw = f.read()

# Strip the external stylesheet link and script tag, then inject inline
html = html_raw \
    .replace('<link rel="stylesheet" href="styles.css" />', f"<style>\n{css}\n</style>") \
    .replace('<script src="app.js"></script>', f"<script>\n{js}\n</script>")

# Render at full viewport height
components.html(html, height=850, scrolling=False)
