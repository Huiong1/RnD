from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

# 1. 크롬 드라이버 설정
CHROMEDRIVER_PATH = "C:/dev_python/Webdriver/chromedriver.exe"
options = Options()
options.add_argument("--start-maximized")
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service, options=options)

# 2. 페이지 열기
url = "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20240312000736"  # 로컬 파일 또는 공시 페이지 URL
driver.get(url)
time.sleep(2)  # 로딩 대기

# 3. BeautifulSoup으로 전체 트리 구조 파싱
soup = BeautifulSoup(driver.page_source, "html.parser")

# "주식의 총수 등" 찾기 (id=7_anchor)
target = soup.find("a", id="7_anchor")
if target:
    print("찾은 텍스트:", target.get_text())

# 4. Selenium으로 해당 항목 클릭
element = driver.find_element(By.ID, "7_anchor")
driver.execute_script("arguments[0].scrollIntoView(true);", element)  # 화면 이동
element.click()  # 클릭 이벤트 발생
time.sleep(2)

# iframe 요소 찾기
iframe = driver.find_element(By.TAG_NAME, "iframe")

# 그 iframe으로 전환
driver.switch_to.frame(iframe)

# 이제 iframe 안의 #document 접근 가능
html = driver.page_source
soup = BeautifulSoup(html, "html.parser")

# 1. 테이블 찾기 (border="1" 같은 속성 기준)
table = soup.find("table", {"border": "1"})

# 2. tbody 안에서 'Ⅳ. 발행주식의 총수' 행 찾기
target_row = None
for tr in table.find_all("tr"):
    if "발행주식의 총수" in tr.get_text():
        target_row = tr
        break

# 3. 해당 행에서 숫자 추출
if target_row:
    tds = target_row.find_all("td")
    보통주 = tds[1].get_text(strip=True)
    print("총발행 보통주:", 보통주)
else:
    print("발행주식의 총수 행을 찾지 못했습니다.")

for tr in table.find_all("tr"):
    if "자기주식수" in tr.get_text():
        target_row = tr
        break

if target_row:
    tds = target_row.find_all("td")
    보통주 = tds[1].get_text(strip=True)
    print("자기주식 보통주:",보통주)
    
else:
    print("자기주식주의 데이터를 찾지 못했습니다.")
    
driver.quit()