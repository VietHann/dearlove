#!/usr/bin/env python3
"""
Website Downloader Tool
Download websites for offline viewing, archiving, or backup purposes.

Usage:
    python website_downloader.py https://vngoweb.com/

Note: Respect website owner's rights. Only download content you have permission to use.
"""

import os
import sys
import requests
from urllib.parse import urljoin, urlparse, urldefrag
from pathlib import Path
from bs4 import BeautifulSoup
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import hashlib

# Configuration
MAX_DEPTH = 2
MAX_WORKERS = 5
DELAY_BETWEEN_REQUESTS = 1.0  # seconds
REQUEST_TIMEOUT = 30
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB per file

# File extensions to download
ASSET_EXTENSIONS = {
    '.html', '.htm', '.css', '.js', '.json',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp4', '.webm', '.ogg', '.mp3', '.wav',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.xml', '.txt', '.csv', '.map'
}

EXCLUDE_PATTERNS = [
    'login', 'logout', 'signup', 'register',
    'admin', 'dashboard', 'api/', '/auth/',
    '.php', '.asp', '.jsp'
]


class WebsiteDownloader:
    def __init__(self, url, output_dir=None):
        self.base_url = url
        self.parsed_base = urlparse(url)
        self.base_domain = self.parsed_base.netloc
        
        if output_dir is None:
            safe_name = re.sub(r'[^\w\-_.]', '_', self.base_domain)
            self.output_dir = Path(safe_name)
        else:
            self.output_dir = Path(output_dir)
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        self.downloaded_urls = set()
        self.failed_urls = []
        self.stats = {
            'html_pages': 0,
            'css_files': 0,
            'js_files': 0,
            'images': 0,
            'other': 0,
            'total_size': 0
        }
    
    def should_download(self, url):
        """Check if URL should be downloaded"""
        url_lower = url.lower()
        
        # Skip external domains
        parsed = urlparse(url)
        if parsed.netloc and parsed.netloc != self.base_domain:
            return False
        
        # Skip excluded patterns
        for pattern in EXCLUDE_PATTERNS:
            if pattern.lower() in url_lower:
                return False
        
        return True
    
    def get_local_path(self, url):
        """Convert URL to local file path"""
        parsed = urlparse(url)
        path = parsed.path
        
        if not path or path == '/':
            path = '/index.html'
        
        # Remove fragments
        path = urldefrag(path)[0]
        
        # Make path safe
        path = path.lstrip('/')
        
        if not path:
            path = 'index.html'
        
        # Add .html for directories
        if not Path(path).suffix:
            path = os.path.join(path, 'index.html')
        
        return self.output_dir / path
    
    def download_file(self, url, force=False):
        """Download a single file"""
        url = urldefrag(url)[0]  # Remove fragment
        
        if url in self.downloaded_urls and not force:
            return
        
        if not self.should_download(url):
            return
        
        local_path = self.get_local_path(url)
        
        # Create parent directories
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Skip if already exists and not forcing
        if local_path.exists() and not force:
            return
        
        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT, stream=True)
            response.raise_for_status()
            
            content_length = response.headers.get('content-length')
            if content_length and int(content_length) > MAX_FILE_SIZE:
                print(f"  [SKIP] File too large: {url}")
                return
            
            content_type = response.headers.get('content-type', '')
            
            # Handle redirects
            if response.history:
                final_url = response.url
                self.downloaded_urls.add(final_url)
                local_path = self.get_local_path(final_url)
                local_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write file
            if 'text' in content_type or 'html' in content_type or 'javascript' in content_type or 'json' in content_type:
                content = response.text
                local_path.write_text(content, encoding='utf-8')
                size = len(content.encode('utf-8'))
            else:
                content = response.content
                local_path.write_bytes(content)
                size = len(content)
            
            self.downloaded_urls.add(url)
            self.stats['total_size'] += size
            
            # Print progress
            ext = local_path.suffix.lower()
            if ext in ['.html', '.htm']:
                self.stats['html_pages'] += 1
                print(f"  [HTML] {local_path}")
            elif ext == '.css':
                self.stats['css_files'] += 1
                print(f"  [CSS]  {local_path}")
            elif ext == '.js':
                self.stats['js_files'] += 1
                print(f"  [JS]   {local_path}")
            elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.avif']:
                self.stats['images'] += 1
                print(f"  [IMG]  {local_path}")
            else:
                self.stats['other'] += 1
                print(f"  [FILE] {local_path}")
            
            return content if local_path.suffix in ['.html', '.htm', '.css', '.js'] else None
            
        except Exception as e:
            self.failed_urls.append((url, str(e)))
            print(f"  [FAIL] {url}: {e}")
            return None
    
    def extract_links(self, html_content, base_url):
        """Extract all links from HTML content"""
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        links = []
        
        # Extract from href
        for tag in soup.find_all('a', href=True):
            href = tag['href']
            full_url = urljoin(base_url, href)
            if full_url.startswith('http'):
                links.append(full_url)
        
        # Extract from src
        for tag in soup.find_all(src=True):
            src = tag['src']
            full_url = urljoin(base_url, src)
            links.append(full_url)
        
        # Extract from link (css, etc)
        for tag in soup.find_all('link', href=True):
            href = tag['href']
            full_url = urljoin(base_url, href)
            links.append(full_url)
        
        return list(set(links))
    
    def extract_assets(self, html_content, base_url):
        """Extract all asset URLs from HTML"""
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        assets = []
        
        # All tags with src or href
        for tag in soup.find_all(src=True):
            src = tag['src']
            full_url = urljoin(base_url, src)
            assets.append(full_url)
        
        for tag in soup.find_all(href=True):
            href = tag['href']
            full_url = urljoin(base_url, href)
            assets.append(full_url)
        
        # Inline styles with url()
        if html_content:
            style_urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', html_content)
            for url in style_urls:
                full_url = urljoin(base_url, url)
                assets.append(full_url)
        
        return list(set(assets))
    
    def filter_asset_urls(self, urls):
        """Filter URLs to only downloadable assets"""
        filtered = []
        for url in urls:
            parsed = urlparse(url)
            ext = Path(parsed.path).suffix.lower()
            
            # Skip external domains
            if parsed.netloc and parsed.netloc != self.base_domain:
                continue
            
            # Skip URLs with query strings unless they look like assets
            if '?' in parsed.path and ext not in ASSET_EXTENSIONS:
                continue
            
            # Include if has matching extension or is on same domain
            if ext in ASSET_EXTENSIONS or not ext:
                filtered.append(urldefrag(url)[0])
        
        return list(set(filtered))
    
    def download_page(self, url, depth=0):
        """Download a page and its assets recursively"""
        if depth > MAX_DEPTH:
            return
        
        url = urldefrag(url)[0]
        
        if url in self.downloaded_urls:
            return
        
        print(f"\n[PAGE] Depth {depth}: {url}")
        
        # Download main page
        content = self.download_file(url)
        
        if not content:
            return
        
        # Extract links and assets
        links = self.extract_links(content, url)
        assets = self.extract_assets(content, url)
        
        # Filter to same domain and downloadable
        page_urls = [u for u in links if self.should_download(u)]
        asset_urls = self.filter_asset_urls(assets)
        
        # Download assets in parallel
        print(f"  Found {len(asset_urls)} assets...")
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(self.download_file, asset_url): asset_url 
                      for asset_url in asset_urls}
            
            for future in as_completed(futures):
                pass
        
        # Download linked pages
        if depth < MAX_DEPTH:
            for page_url in page_urls[:10]:  # Limit pages per depth
                time.sleep(DELAY_BETWEEN_REQUESTS)
                self.download_page(page_url, depth + 1)
    
    def generate_index(self):
        """Generate an index.html listing all downloaded files"""
        index_path = self.output_dir / '_index.html'
        
        files = []
        for root, dirs, filenames in os.walk(self.output_dir):
            for filename in filenames:
                if filename == '_index.html':
                    continue
                filepath = Path(root) / filename
                rel_path = filepath.relative_to(self.output_dir)
                size = filepath.stat().st_size
                size_str = self._format_size(size)
                files.append((str(rel_path), size_str, 'directory' if filepath.is_dir() else 'file'))
        
        html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Index - {self.base_domain}</title>
    <style>
        body {{ font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }}
        h1 {{ color: #333; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }}
        th {{ background: #f5f5f5; }}
        tr:hover {{ background: #fafafa; }}
        .size {{ text-align: right; color: #666; }}
        a {{ color: #0066cc; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
        .stats {{ background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }}
    </style>
</head>
<body>
    <h1>Website Download: {self.base_domain}</h1>
    
    <div class="stats">
        <strong>Download Statistics:</strong><br>
        HTML Pages: {self.stats['html_pages']}<br>
        CSS Files: {self.stats['css_files']}<br>
        JavaScript: {self.stats['js_files']}<br>
        Images: {self.stats['images']}<br>
        Other Files: {self.stats['other']}<br>
        Total Size: {self._format_size(self.stats['total_size'])}<br>
        Failed URLs: {len(self.failed_urls)}
    </div>
    
    <h2>Downloaded Files ({len(files)})</h2>
    <table>
        <tr>
            <th>File</th>
            <th class="size">Size</th>
        </tr>
"""
        
        for filepath, size, _ in sorted(files):
            html += f'        <tr><td><a href="{filepath}">{filepath}</a></td><td class="size">{size}</td></tr>\n'
        
        if self.failed_urls:
            html += f"""
    </table>
    
    <h2>Failed Downloads ({len(self.failed_urls)})</h2>
    <ul>
"""
            for url, error in self.failed_urls:
                html += f'        <li><code>{url}</code> - {error}</li>\n'
        
        html += """
    </table>
</body>
</html>
"""
        
        index_path.write_text(html, encoding='utf-8')
        print(f"\n[INDEX] Created {index_path}")
    
    @staticmethod
    def _format_size(size):
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    
    def run(self):
        """Run the downloader"""
        print(f"=" * 60)
        print(f"Website Downloader")
        print(f"=" * 60)
        print(f"URL: {self.base_url}")
        print(f"Output: {self.output_dir}")
        print(f"Max Depth: {MAX_DEPTH}")
        print(f"=" * 60)
        
        start_time = time.time()
        
        try:
            self.download_page(self.base_url)
            self.generate_index()
            
            elapsed = time.time() - start_time
            
            print(f"\n" + "=" * 60)
            print(f"Download Complete!")
            print(f"=" * 60)
            print(f"Total Files: {sum([self.stats['html_pages'], self.stats['css_files'], self.stats['js_files'], self.stats['images'], self.stats['other']])}")
            print(f"Total Size: {self._format_size(self.stats['total_size'])}")
            print(f"Failed URLs: {len(self.failed_urls)}")
            print(f"Time Elapsed: {elapsed:.1f} seconds")
            print(f"Output Directory: {self.output_dir.absolute()}")
            
        except KeyboardInterrupt:
            print("\n\nDownload interrupted by user.")
            self.generate_index()
            print(f"Partial download saved to: {self.output_dir}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python website_downloader.py <url> [output_directory]")
        print("Example: python website_downloader.py https://vngoweb.com/")
        sys.exit(1)
    
    url = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Validate URL
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        downloader = WebsiteDownloader(url, output_dir)
        downloader.run()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
