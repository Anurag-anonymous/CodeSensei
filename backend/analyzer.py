# backend/analyzer.py
import re
from typing import Dict, List
from github import Github
import requests

class GitHubAnalyzer:
    def __init__(self, token: str):
        self.g = Github(token)
    
    def analyze_repo(self, url: str) -> Dict:
        """Extract repo info and analyze structure"""
        # Parse GitHub URL
        match = re.match(r'https://github\.com/([^/]+)/([^/]+)', url)
        if not match:
            raise ValueError("Invalid GitHub URL")
        
        owner, repo_name = match.groups()
        repo = self.g.get_repo(f"{owner}/{repo_name}")
        
        # Get basic info
        contents = repo.get_contents("")
        languages = repo.get_languages()
        
        # Simple structure analysis
        files = self._walk_contents(repo, contents)
        
        return {
            "name": repo.full_name,
            "description": repo.description,
            "stars": repo.stargazers_count,
            "language_stats": languages,
            "file_structure": files[:50],  # Limit for demo
            "complexity_score": self._calculate_complexity(languages, files)
        }
    
    def _walk_contents(self, repo, contents, path=""):
        """Recursively get file structure"""
        files = []
        for content in contents:
            if content.type == "dir":
                files.extend(self._walk_contents(
                    repo, 
                    repo.get_contents(content.path),
                    f"{path}/{content.name}"
                ))
            else:
                files.append(f"{path}/{content.name}")
        return files