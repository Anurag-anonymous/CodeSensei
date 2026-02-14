import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from github import Github, GithubException
import uvicorn
import json
import requests  # Add this


# ========== 1. LOAD CONFIGURATION ==========
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# ========== 2. API KEYS WITH DEBUG INFO ==========
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")  # Changed from GEMINI_API_KEY

# DEBUG: Print what keys we have
print("\n🔑 API KEY STATUS:")
print(f"GitHub Token: {'✅ SET' if GITHUB_TOKEN else '❌ MISSING'}")
print(f"OpenRouter API Key: {'✅ SET' if OPENROUTER_API_KEY else '❌ MISSING'}")

# Initialize OpenRouter client
openrouter_client = None
if OPENROUTER_API_KEY:
    print("✅ OpenRouter client available")
    openrouter_client = True  # Simple flag to indicate availability
else:
    print("❌ OpenRouter client not initialized (missing API key)")

# ========== 3. ENVIRONMENT DETECTION ==========
IS_PRODUCTION = os.getenv("RENDER") is not None
PRODUCTION_URL = os.getenv("RENDER_EXTERNAL_URL", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://code-sensei-seven.vercel.app")

# Set allowed origins
if IS_PRODUCTION and PRODUCTION_URL:
    allow_origins = [
        FRONTEND_URL,
        PRODUCTION_URL,
        "http://localhost:3000",
        "https://localhost:3000",
        "https://code-sensei-git-main-anurag-anonymous-1188s-projects.vercel.app",
    ]
else:
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
def get_top_contributors(repo, limit=5):
    """Get top contributors for a repository."""
    try:
        print(f"👥 Fetching top {limit} contributors...")
        contributors = list(repo.get_contributors()[:limit])
        
        contributors_data = []
        for contributor in contributors:
            contributors_data.append({
                "username": contributor.login,
                "avatar_url": contributor.avatar_url,
                "contributions": contributor.contributions,
                "profile_url": contributor.html_url
            })
        
        print(f"✅ Found {len(contributors_data)} contributors")
        return contributors_data
    except Exception as e:
        print(f"⚠️ Could not fetch contributors: {e}")
        return []

def get_most_active_issues(repo, limit=5):
    """Get issues with most comments (indicating high activity)."""
    try:
        print(f"📝 Fetching top {limit} active issues...")
        # Get issues sorted by comments (most commented = most active)
        issues = list(repo.get_issues(state='open', sort='comments', direction='desc')[:limit])
        
        issues_data = []
        for issue in issues:
            # Check if it's actually an issue (not a PR)
            if issue.pull_request is None:
                issues_data.append({
                    "number": issue.number,
                    "title": issue.title[:100] + "..." if len(issue.title) > 100 else issue.title,
                    "url": issue.html_url,
                    "comments": issue.comments,
                    "created_at": issue.created_at.isoformat() if issue.created_at else None,
                    "state": issue.state
                })
        
        print(f"✅ Found {len(issues_data)} active issues")
        return issues_data
    except Exception as e:
        print(f"⚠️ Could not fetch issues: {e}")
        return []
@app.post("/api/analyze")
async def analyze_repo(request: RepoRequest):
    """Analyze a GitHub repository with AI insights."""
    print(f"\n🔍 Analyzing repository: {request.github_url}")
    
    try:
        # Check for required tokens
        if not GITHUB_TOKEN:
            return {
                "status": "error", 
                "message": "GitHub token not configured.",
                "debug": {"github_token_set": False}
            }
        
        print(f"✅ GitHub token available")
        print(f"✅ OpenRouter available: {openrouter_client is not None}")
        
        g = Github(GITHUB_TOKEN)
        repo = g.get_repo(extract_repo_path(request.github_url))

        # ========== NEW: Get Contributors & Issues ==========
        print("📊 Fetching community data...")
        
        # Get top contributors (limit to 5 for performance)
        top_contributors = get_top_contributors(repo, limit=5)
        
        # Get most active issues (limit to 5)
        active_issues = get_most_active_issues(repo, limit=5)
        # ========== END NEW SECTION ==========
        
        # Extract basic information (your existing code)
        languages = repo.get_languages()
        contents = repo.get_contents("")
        file_structure = list_files_with_limits(
            contents, repo, path="", max_depth=3, max_files=100, current_depth=0
        )

        # Calculate metrics (your existing code)
        primary_language = max(languages, key=languages.get) if languages else "Unknown"
        total_size = sum(languages.values())
        
        # Calculate language percentages (your existing code)
        language_percentages = {
            lang: f"{(count/total_size)*100:.1f}%" 
            for lang, count in languages.items()
        }
        
        # Get AI analysis (your existing code)
        ai_analysis = None
        if openrouter_client:
            print("🤖 Calling OpenRouter (DeepSeek) API...")
            try:
                # Enhance the AI prompt with contributor info
                enhanced_prompt = f"""
                You are CodeSensei, an AI mentor for codebases.

                Briefly analyze this repository:
                Name: {repo.full_name}
                Description: {repo.description or "No description"}
                Primary Language: {primary_language}
                File Count: {len(file_structure)}
                Top Contributors: {len(top_contributors)} contributors
                Active Issues: {len(active_issues)} active discussions

                Provide a short educational summary in JSON format with this structure:
                {{
                    "ai_summary": "A 2-3 sentence educational overview",
                    "tech_insights": ["Insight 1", "Insight 2"],
                    "learning_path": ["Step 1: Start with X", "Step 2: Learn Y"],
                    "patterns": ["Pattern 1", "Pattern 2"],
                    "community_tips": ["Tip about contributors", "Tip about issue engagement"]
                }}

                Keep it concise and educational.
                """
                
                ai_analysis = analyze_with_openrouter(
                    repo.full_name,
                    repo.description,
                    languages,
                    file_structure[:20],
                    primary_language,
                    len(file_structure)
                )
                print("✅ OpenRouter analysis successful")
            except Exception as e:
                print(f"❌ OpenRouter error: {e}")
                ai_analysis = {
                    "ai_summary": f"OpenRouter API Error: {str(e)[:100]}...",
                    "tech_insights": [],
                    "learning_path": [],
                    "patterns": [],
                    "community_tips": []
                }
        else:
            print("⚠️ OpenRouter client not available, skipping AI analysis")
        
        # Structure the response - ADD THE NEW FIELDS
        analysis_result = {
            "status": "success",
            "repo_info": {
                "full_name": repo.full_name,
                "description": repo.description,
                "stars": repo.stargazers_count,
                "forks": repo.forks_count,
                "url": repo.html_url,
                "open_issues": repo.open_issues_count,  # Add this
                "watchers": repo.subscribers_count,      # Add this
            },
            "tech_analysis": {
                "languages": language_percentages,
                "primary_language": primary_language,
                "file_count": len(file_structure),
                "sample_structure": file_structure[:10],
                "top_languages": list(languages.keys())[:5] if languages else []
            },
            # ========== NEW: Community Data ==========
            "community_data": {
                "top_contributors": top_contributors,
                "active_issues": active_issues,
                "contributor_count": repo.get_contributors().totalCount,
                "issue_engagement": sum(issue.get("comments", 0) for issue in active_issues) if active_issues else 0
            },
            # ========== END NEW ==========
            "learning_metrics": {
                "complexity_score": calculate_enhanced_complexity(languages, file_structure),
                "complexity_level": get_complexity_level(calculate_enhanced_complexity(languages, file_structure)),
                "recommended_start": recommend_starting_point(file_structure, primary_language),
                "community_score": calculate_community_score(top_contributors, active_issues),  # New metric
            },
            # AI-generated content
            "ai_analysis": ai_analysis or {
                "ai_summary": "AI analysis is not enabled.",
                "tech_insights": [],
                "learning_path": [],
                "patterns": [],
                "community_tips": []
            },
            "has_ai_analysis": ai_analysis is not None,
            "debug_info": {
                "openrouter_available": openrouter_client is not None,
                "openrouter_key_set": bool(OPENROUTER_API_KEY),
                "github_token_set": bool(GITHUB_TOKEN),
                "file_count": len(file_structure),
                "language_count": len(languages),
                "contributors_fetched": len(top_contributors),
                "issues_fetched": len(active_issues)
            }
        }
        
        print(f"✅ Analysis complete. Has AI: {ai_analysis is not None}")
        print(f"   Contributors: {len(top_contributors)}, Active Issues: {len(active_issues)}")
        return analysis_result

    except GithubException as e:
        print(f"❌ GitHub API error: {e}")
        return {
            "status": "error", 
            "message": f"GitHub API error: {e.data.get('message', str(e))}",
            "debug": {"github_error": True}
        }
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return {
            "status": "error", 
            "message": f"An unexpected error occurred: {str(e)}",
            "debug": {"error": str(e)}
        }
    

def calculate_community_score(contributors, issues):
    """Calculate a community engagement score (0-10)."""
    if not contributors and not issues:
        return 0.0
    
    # Factors
    contributor_score = min(5, len(contributors) * 0.5)
    
    # Issue engagement score
    total_comments = sum(issue.get("comments", 0) for issue in issues)
    issue_score = min(5, total_comments * 0.1)
    
    # Combined score
    score = contributor_score + issue_score
    
    return round(min(10, score), 1)

def analyze_with_openrouter(repo_name, description, languages, file_structure, primary_language, file_count):
    """Analyze repository using OpenRouter API with DeepSeek model."""
    try:
        # Create prompt
        prompt = f"""
        You are CodeSensei, an AI mentor for codebases.

        Briefly analyze this repository:
        Name: {repo_name}
        Description: {description or "No description"}
        Primary Language: {primary_language}
        File Count: {file_count}

        Provide a short educational summary in JSON format with this structure:
        {{
            "ai_summary": "A 2-3 sentence educational overview",
            "tech_insights": ["Insight 1", "Insight 2"],
            "learning_path": ["Step 1: Start with X", "Step 2: Learn Y"],
            "patterns": ["Pattern 1", "Pattern 2"]
        }}

        Keep it concise and educational.
        """

        print(f"📝 Sending prompt to OpenRouter...")
        
        # OpenRouter API endpoint
        url = "https://openrouter.ai/api/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Request payload - using DeepSeek Free model
        payload = {
            "model": "deepseek/deepseek-chat",  # Free model
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        # Make API call
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            error_msg = f"API returned {response.status_code}: {response.text}"
            print(f"❌ OpenRouter API error: {error_msg}")
            raise Exception(error_msg)
        
        result = response.json()
        
        # Extract content
        content = result['choices'][0]['message']['content']
        print(f"📥 Received response from OpenRouter: {content[:100]}...")

        try:
            # Try to find and parse JSON
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start != -1 and json_end != 0:
                result_json = json.loads(content[json_start:json_end])
                print("✅ Successfully parsed OpenRouter JSON response")
                return result_json
            else:
                # If no JSON, return the content as summary
                print("⚠️ No JSON found in response, using raw content")
                return {
                    "ai_summary": content,
                    "tech_insights": [],
                    "learning_path": [],
                    "patterns": []
                }
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            return {
                "ai_summary": content,
                "tech_insights": [],
                "learning_path": [],
                "patterns": []
            }

    except Exception as e:
        print(f"❌ OpenRouter API call failed: {e}")
        raise

def calculate_enhanced_complexity(languages, files, ai_analysis=None):
    """More sophisticated complexity calculation."""
    # Base factors
    lang_diversity = len(languages)
    file_count = len(files)
    
    # Language complexity weights (you can expand this)
    complexity_weights = {
        "C++": 2.0, "Rust": 1.8, "Go": 1.5, 
        "Python": 1.0, "JavaScript": 1.0, "TypeScript": 1.2,
        "Java": 1.3, "Kotlin": 1.3, "Swift": 1.3,
        "HTML": 0.5, "CSS": 0.5, "Markdown": 0.1
    }
    
    # Weighted language complexity
    lang_complexity = 0
    for lang in languages:
        lang_complexity += complexity_weights.get(lang, 1.0)
    
    # File complexity (more files = more complex, but diminishing returns)
    file_factor = min(5, file_count / 50)
    
    # Combine factors
    score = (lang_diversity * 0.5) + (lang_complexity * 0.3) + (file_factor * 2)
    
    # Cap at 10 and round
    return round(min(10, score), 1)

def get_complexity_level(score):
    """Convert numeric score to descriptive level."""
    if score < 3:
        return "Beginner"
    elif score < 6:
        return "Intermediate"
    elif score < 8:
        return "Advanced"
    else:
        return "Expert"

# --- Keep existing helper functions ---
def extract_repo_path(url: str) -> str:
    """Extracts 'owner/repo' from a GitHub URL."""
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

def recommend_starting_point(files, primary_lang):
    """Suggests a starting file based on common patterns."""
    look_for = {
        "Python": ["README.md", "requirements.txt", "setup.py", "app.py", "main.py"],
        "JavaScript": ["README.md", "package.json", "src/index.js", "src/App.js"],
        "TypeScript": ["README.md", "package.json", "src/index.ts", "src/App.tsx"],
        "Java": ["README.md", "pom.xml", "build.gradle", "src/main/java/Main.java"],
        "Go": ["README.md", "go.mod", "main.go"],
        "Rust": ["README.md", "Cargo.toml", "src/main.rs"],
    }
    for filename in look_for.get(primary_lang, ["README.md"]):
        if any(filename in f for f in files):
            return filename
    return files[0] if files else "README.md"


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "github_api": "✅" if GITHUB_TOKEN else "❌",
            "openrouter_api": "✅" if OPENROUTER_API_KEY else "❌"
        }
    }

@app.get("/")
async def root():
    return {
        "service": "CodeSensei Backend",
        "version": "1.2.0",
        "features": ["GitHub Analysis", "AI-Powered Insights (DeepSeek via OpenRouter)", "Learning Path Generation"],
        "status": "operational",
        "documentation": "https://github.com/Anurag-anonymous/CodeSensei"
    }

# ========== 4. DEPLOYMENT ==========
if __name__ == "__main__":
    port_str = os.getenv("PORT", "").strip()
    
    if port_str and port_str.isdigit():
        port = int(port_str)
        print(f"✅ Render provided PORT: {port}")
    else:
        port = 8000
        print(f"⚠️  Using default PORT: {port}")
    
    is_render = os.getenv("RENDER") is not None
    
    print(f"\n🚀 Starting CodeSensei Backend")
    print(f"   Environment: {'Production (Render)' if is_render else 'Development'}")
    print(f"   Port: {port}")
    print(f"   GitHub Token: {'✅ Loaded' if GITHUB_TOKEN else '❌ Missing'}")
    print(f"   OpenRouter API Key: {'✅ Loaded' if OPENROUTER_API_KEY else '❌ Missing'}")
    print(f"   AI Model: DeepSeek Chat (Free via OpenRouter)")
    
    if is_render:
        uvicorn.run(app, host="0.0.0.0", port=port)
    else:
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