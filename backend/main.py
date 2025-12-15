import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from github import Github, GithubException
import uvicorn

# ========== 1. LOAD CONFIGURATION ==========
# Load from .env file in current directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# ========== 2. ENVIRONMENT DETECTION ==========

IS_PRODUCTION = os.getenv("RENDER") is not None  # Render sets this
PRODUCTION_URL = os.getenv("RENDER_EXTERNAL_URL", "")  # Render provides this

# ========== CORS CONFIGURATION ==========
# Your frontend URL on Vercel
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://code-sensei-seven.vercel.app/")

# Set allowed origins
if IS_PRODUCTION and PRODUCTION_URL:
    # Production: Allow your Vercel frontend and your Render backend
    allow_origins = [
        FRONTEND_URL,
        PRODUCTION_URL,
        "http://localhost:3000",  # For local testing
        "https://localhost:3000",
    ]
else:
    # Development
    allow_origins = [
        "https://localhost:3000",
        "https://192.168.56.1:3000",
        "http://localhost:3000",
    ]

app = FastAPI(title="CodeSensei API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepoRequest(BaseModel):
    github_url: str

from github import Github, GithubException
import os

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

@app.post("/api/analyze")
async def analyze_repo(request: RepoRequest):
    """Analyze a GitHub repository and return key insights."""
    try:

        g = Github(GITHUB_TOKEN)
        repo = g.get_repo(extract_repo_path(request.github_url))

        # 2. Extract basic information
        languages = repo.get_languages()
        contents = repo.get_contents("")
        file_structure = list_files_with_limits(contents, repo, path="", max_depth=3, max_files=100, current_depth=0)

        # 3. Perform basic analysis (You can expand this massively)
        primary_language = max(languages, key=languages.get) if languages else "Unknown"
        total_size = sum(languages.values())

        # 4. Structure the response for your frontend features
        analysis_result = {
            "status": "success",
            "repo_info": {
                "full_name": repo.full_name,
                "description": repo.description,
                "stars": repo.stargazers_count,
                "forks": repo.forks_count,
                "url": repo.html_url,
            },
            "tech_analysis": {
                "languages": {lang: f"{(count/total_size)*100:.1f}%" for lang, count in languages.items()},
                "primary_language": primary_language,
                "file_count": len(file_structure),
                "sample_structure": file_structure[:10],  # First 10 files
            },
            "learning_metrics": {
                "complexity_score": calculate_complexity(languages, file_structure),  # See helper below
                "recommended_start": recommend_starting_point(file_structure, primary_language),
            },
            # This 'summary' field is ready to be fed to your future AI/chat feature
            "ai_summary": f"The repository {repo.full_name} is primarily written in {primary_language}. "
                          f"Key structure includes {len(file_structure)} files. "
                          f"A good starting point for learning is {recommend_starting_point(file_structure, primary_language)}."
        }
        return analysis_result

    except GithubException as e:
        return {"status": "error", "message": f"GitHub API error: {e.data.get('message', str(e))}"}
    except Exception as e:
        return {"status": "error", "message": f"An unexpected error occurred: {str(e)}"}


# --- Helper Functions (Add these above or below your main function) ---

def extract_repo_path(url: str) -> str:
    """Extracts 'owner/repo' from a GitHub URL."""
    # Simple extraction - you might want a more robust version
    parts = url.rstrip('/').split('/')
    return f"{parts[-2]}/{parts[-1]}"

def list_files_with_limits(contents, repo, path="", max_depth=3, max_files=100, current_depth=0):
    """Recursively list files with depth and count limits."""
    files = []
    if current_depth >= max_depth:
        return files
    
    for content in contents:
        if len(files) >= max_files:
            break
        
        if content.type == "dir":
            try:
                # Only go deeper if we haven't hit limits
                if current_depth < max_depth - 1 and len(files) < max_files:
                    sub_files = list_files_with_limits(
                        repo.get_contents(content.path),
                        repo,
                        f"{path}/{content.name}",
                        max_depth,
                        max_files - len(files),
                        current_depth + 1
                    )
                    files.extend(sub_files)
            except Exception:
                continue
        else:
            files.append(f"{path}/{content.name}")
    
    return files

def calculate_complexity(languages, files):
    """A simplistic complexity heuristic. You should improve this!"""
    lang_diversity = len(languages)
    file_count = len(files)
    # Very basic score from 1-10
    score = min(10, (lang_diversity * 2) + (file_count / 100))
    return round(score, 1)

def recommend_starting_point(files, primary_lang):
    """Suggests a starting file based on common patterns."""
    look_for = {
        "Python": ["README.md", "requirements.txt", "app.py", "main.py"],
        "JavaScript": ["README.md", "package.json", "src/index.js", "src/App.js"],
        "TypeScript": ["README.md", "package.json", "src/index.ts", "src/App.tsx"],
    }
    for filename in look_for.get(primary_lang, ["README.md"]):
        if any(filename in f for f in files):
            return filename
    return files[0] if files else "README.md"

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


# ... your existing imports and code ...

if __name__ == "__main__":
    # === SAFE PORT HANDLING FOR RENDER ===
    port_str = os.getenv("PORT", "").strip()
    
    if port_str and port_str.isdigit():
        port = int(port_str)
        print(f"✅ Render provided PORT: {port}")
    else:
        port = 8000
        print(f"⚠️  Using default PORT: {port}")
    
    # === DETECT ENVIRONMENT ===
    is_render = os.getenv("RENDER") is not None
    
    print(f"\n🚀 Starting CodeSensei Backend")
    print(f"   Environment: {'Production (Render)' if is_render else 'Development'}")
    print(f"   Port: {port}")
    print(f"   GitHub Token: {'✅ Loaded' if GITHUB_TOKEN else '❌ Missing'}")
    
    if is_render:
        # Production on Render - HTTP only
        uvicorn.run(app, host="0.0.0.0", port=port)
    else:
        # Local development - try HTTPS, fallback to HTTP
        cert_path = Path(__file__).parent / "cert.pem"
        key_path = Path(__file__).parent / "key.pem"
        
        if cert_path.exists() and key_path.exists():
            uvicorn.run(
                app,
                host="0.0.0.0",
                port=port,
                ssl_keyfile=str(key_path),
                ssl_certfile=str(cert_path)
            )
        else:
            print("⚠️  SSL certs not found. Starting HTTP...")
            uvicorn.run(app, host="0.0.0.0", port=port)