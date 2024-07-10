import requests
from bs4 import BeautifulSoup
import json
import time

def extract_paul_graham_essays():
    url = "https://www.paulgraham.com/articles.html"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    essays = []
    for link in soup.find_all('a'):
        href = link.get('href')
        title = link.text.strip()
        if href and title and href.endswith('.html'):
            full_url = f"https://www.paulgraham.com/{href}"
            content = fetch_essay_content(full_url)
            essays.append({"title": title, "url": full_url, "content": content})
            time.sleep(1)  # Be polite to the server

    return essays

def fetch_essay_content(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    content = soup.get_text()
    return content.strip()

def save_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    essays = extract_paul_graham_essays()
    save_to_json(essays, "paul_graham_essays.json")
    print(f"Extracted {len(essays)} essays and saved to paul_graham_essays.json")
