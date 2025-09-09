"""
TXT 파일의 viewer.do 상대/절대 URL들을 한 줄씩 읽어
https://dart.fss.or.kr/report/** 형태의 완전 URL로 만든 뒤,
각 페이지(및 하위 iframe)에서 '<table'을 찾아 테이블 1개당 CSV 1개로 저장.

Ubuntu 환경에서 Firefox로 끌어옴
필수: firefox, geckodriver / pip: selenium beautifulsoup4 lxml pandas

TXT 예시 (lines):
viewer.do?rcpNo=20230320000886&dcmNo=9076597&eleId=3&offset=18960&length=56092&dtd=dart3.xsd
viewer.do?rcpNo=20230320000886&dcmNo=9076597&eleId=9&offset=75056&length=144454&dtd=dart3.xsd
...
"""

import os, re, time, shutil, html
from io import StringIO
from typing import List, Optional
from urllib.parse import urljoin

import pandas as pd
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service as FFService

# 사용자 설정
LINKS_TXT = "./BGF리테일.txt"   # ← TXT 파일 경로
OUT_DIR   = "./dart_tables"        # 저장 폴더
HEADLESS  = True                   # 서버 환경이면 True 권장

BASE_REPORT = "https://dart.fss.or.kr/report/"
BASE_HOST   = "https://dart.fss.or.kr"

# WebDriver 생성
# firefox + geckodriver로 Webdriver instance 제작
def build_firefox_driver(headless=True):
    opts = FirefoxOptions()
    if headless:
        opts.add_argument("-headless")
    opts.set_preference("browser.download.folderList", 2)

    firefox_bin = shutil.which("firefox-esr") or shutil.which("firefox")
    if not firefox_bin:
        raise RuntimeError("Firefox 미설치: conda-forge 또는 apt로 firefox/firefox-esr 설치 필요")
    opts.binary_location = firefox_bin

    gecko_bin = shutil.which("geckodriver")
    if not gecko_bin:
        raise RuntimeError("geckodriver 미설치: conda-forge 또는 apt로 geckodriver 설치 필요")

    service = FFService(executable_path=gecko_bin, log_path="/tmp/geckodriver.log")
    return webdriver.Firefox(service=service, options=opts)

# utility
def normalize_viewer_url(url: str) -> str:
    # HTML 엔티티 정리: &amp; → &
    if not url:
        return url
    url = html.unescape(url)
    url = re.sub(r'([?&])amp;', r'\1', url, flags=re.IGNORECASE)
    return url.strip()

def coerce_full_url(line: str) -> Optional[str]:
    # TXT 한 줄을 절대 URL로 변환
    if not line:
        return None
    s = normalize_viewer_url(line.strip())
    if not s or s.startswith("#"):   # 주석/빈 줄은 무시
        return None
    if s.lower().startswith("http://") or s.lower().startswith("https://"):
        return s
    if s.startswith("/"):
        return urljoin(BASE_HOST, s)
    return urljoin(BASE_REPORT, s)

def read_links_from_txt(path: str) -> List[str]:
    # TXT 파일 줄 단위 읽기
    urls: List[str] = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            u = coerce_full_url(line)
            if u and u not in urls:
                urls.append(u)
    return urls

def extract_ele_id(url: str) -> Optional[int]:
    # eleID parameter를 정수로 뽑음 (구분 확인용)
    m = re.search(r"[?&]eleId=(\d+)", url, flags=re.IGNORECASE)
    try:
        return int(m.group(1)) if m else None
    except Exception:
        return None

# def safe_name(s: str, maxlen: int = 60) -> str:
#      # table 별 구분용 이름 추가
#     s = re.sub(r"\s+", "_", s.strip())
#     s = re.sub(r"[^ㄱ-힣A-Za-z0-9_\-\.]+", "_", s)
#     return (s[:maxlen] or "untitled").strip("_")

def br_to_newline(soup: BeautifulSoup):
    # <br> 태그를 개행 문자로 바꿔서 pandas read_html 시 줄바꿈이 유지되도록.
    for br in soup.find_all("br"):
        br.replace_with("\n")

# 현재 문서/하위 iframe에서 table이 있는 프레임 HTML 찾기
def find_html_with_tables_anywhere(driver) -> str:
    # 현재 문서와 모든 하위 iframe을 재귀 탐색해 table이 보이는 프레임의 HTML 반환
    def dfs_find(max_depth=5) -> Optional[str]:
        try:
            # 현재 프레임에서 <table>이 보이면 그 프레임의 HTML을 리턴
            driver.find_element(By.CSS_SELECTOR, "table")
            time.sleep(0.15)
            return driver.page_source
        except Exception:
            pass
        # 더 내려갈 프레임이 없으면 종료
        if max_depth <= 0:
            return None
        # 하위 iframe들 순회
        frames = driver.find_elements(By.CSS_SELECTOR, "iframe")
        for f in frames:
            try:
                driver.switch_to.frame(f)
                got = dfs_find(max_depth - 1)
                if got:
                    return got
                driver.switch_to.parent_frame()
            except Exception:
                # 프레임 전환 실패해도 부모 복귀는 시도
                try:
                    driver.switch_to.parent_frame()
                except Exception:
                    pass
        return None
    
    # 항상 최상위 컨텍스트에서 시작
    driver.switch_to.default_content()
    got = dfs_find(5)
    # 끝까지 못 찾았으면 현재 페이지 소스라도 반환(안전장치)
    return got or driver.page_source

# <table> → CSV 저장
def extract_and_save_tables(html_text: str, out_dir: str, file_prefix: str = "") -> int:
    # HTML 문자열에서 <table> 태그들을 찾아
    # pandas.read_html로 DataFrame 변환 후 CSV로 저장.
    soup = BeautifulSoup(html_text, "lxml")
    br_to_newline(soup)         # <br> → 줄바꿈 치환
    tables = soup.find_all("table")

    if not tables:
        print("TABLE 없음(프레임 전역 탐색에도 미발견)")
        return 0

    os.makedirs(out_dir, exist_ok=True)
    saved = 0
    for i, tbl in enumerate(tables, start=1):
        try:
            dfs = pd.read_html(StringIO(str(tbl)), flavor="lxml")
            if not dfs:
                continue
            df = dfs[0]

            # 셀 값들에서 개행/캐리지리턴/공백 정리
            # applymap 경고 회피: Series.map 사용
            df = df.apply(lambda s: s.map(lambda x: str(x).replace("\r", "").strip() if pd.notnull(x) else x))
            
            # 파일명 힌트를 테이블 상단 텍스트에서 일부 뽑아 만듬
            # text = tbl.get_text(" ", strip=True)
            # hint = safe_name("_".join(text.split()[:6]), 50)

            path = os.path.join(out_dir, f"{file_prefix}table_{i:03d}.csv")
            # path = os.path.join(out_dir, f"{file_prefix}table_{i:03d}_{hint}.csv")
            df.to_csv(path, index=False, encoding="utf-8-sig")
            print(f"saved: {path}")
            saved += 1
        except Exception as e:
            print(f"table#{i} 실패: {e}")
            continue
    return saved

# 한 URL 처리
def save_tables_from_viewer_url(driver, viewer_url: str, out_dir: str, file_prefix: str = "") -> int:
    # 하나의 viewer.do URL을 열고, (필요시 iframe까지 내려가) 테이블을 찾아 CSV로 저장.
    # 반환값은 저장된 CSV 개수.
    url = normalize_viewer_url(viewer_url)
    print("➡ 접속:", url)
    driver.get(url)
    time.sleep(0.6)      # 네트워크/렌더링 딜레이 고려해 잠깐 대기
    html_with_tables = find_html_with_tables_anywhere(driver)
    saved = extract_and_save_tables(html_with_tables, out_dir, file_prefix=file_prefix)
    print(f"  → 완료: {saved}개 저장")
    return saved

# main문
if __name__ == "__main__":
    # 1) TXT에서 링크들 읽어오기(상대/절대 경로 모두 처리)
    links = read_links_from_txt(LINKS_TXT)
    if not links:
        print(f"TXT에서 링크를 찾지 못했습니다: {LINKS_TXT}")
        raise SystemExit(1)

    print(f"총 {len(links)}개 링크 감지")

    # 2) 브라우저는 한 번만 띄워서 전체 링크를 순회(속도/안정성)
    driver = build_firefox_driver(HEADLESS)
    try:
        total = 0
        for idx, link in enumerate(links, start=1):
            ele = extract_ele_id(link)
            prefix = f"ele_{ele:03d}_" if ele is not None else f"link_{idx:03d}_"
            print(f"\n[{idx}/{len(links)}] eleId={ele} 처리")
            total += save_tables_from_viewer_url(driver, link, OUT_DIR, file_prefix=prefix)

            # 페이지 사이 약간의 텀
            time.sleep(0.3)
        print(f"\n 전체 완료: 총 {total}개 CSV 저장")
        
    finally:
        driver.quit()
