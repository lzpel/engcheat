import datetime

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import os, shutil, time, re


# Selenium初期化
def refresh_output():
    path_download = os.path.abspath(os.path.join(__file__, "..", "output"))
    shutil.rmtree(path_download)
    os.mkdir(path_download)
    return path_download


def create_driver():
    options = webdriver.ChromeOptions()
    prefs = {"download.default_directory": refresh_output()}
    options.add_experimental_option("prefs", prefs)
    return webdriver.Chrome(options=options)


def main():
    driver = create_driver()
    driver.get("https://eikaiwa.dmm.com/app/daily-news/search")
    time.sleep(10)
    a_elements = driver.find_elements(By.TAG_NAME, "a")
    print(a_elements)
    for i in a_elements:
        href = i.get_attribute("href")
        if "article" in href:
            article(driver, href, get_datetime(i))
    driver.quit()


def article(driver, href, timestamp=datetime.datetime.fromtimestamp(0)):
    driver.get(href)
    time.sleep(5)
    if maybe_translated(driver, timestamp):
        print(get_level(driver))
        print(get_translated(driver, True))
    get_download(driver)
    time.sleep(20)


def test():
    print(datetime.datetime.fromisoformat("2024-06-27T17:00:00.000Z"))


def get_level(element):
    for e in element.find_elements(By.TAG_NAME, "span"):
        for f in e.find_elements(By.TAG_NAME, "div"):
            if re.fullmatch(r"\d", f.text.strip()):
                return int(f.text.strip())


def maybe_translated(element, timestamp):
    # 2か月前のマイクロプラスチックの記事から7に日本語訳が付かなくなった2024-04-21T17:00:00.000Z
    level = get_level(element)
    return (level <= 6) or (level <= 7 and timestamp <= datetime.datetime.fromisoformat("2024-04-21T17:00:00.000Z"))


def get_datetime(element):
    time_element = element.find_element(By.TAG_NAME, "time")
    return datetime.datetime.fromisoformat(time_element.get_attribute("datetime"))


def get_translated(element, set_bool):
    for i in element.find_elements(By.ID, ":rf:"):
        return switch(i, set_bool)


def get_download(driver):
    for i in driver.find_elements(By.TAG_NAME, "button"):
        if "その他のツール" in (i.get_attribute("aria-label") or str()):
            switch(i, True)
    time.sleep(1)
    for i in driver.find_elements(By.TAG_NAME, "button"):
        if "ダウンロード" in i.text:
            print(i.rect)
            driver.execute_script(f'window.scrollTo(0, {i.rect["y"]});')
            time.sleep(1)
            actions = ActionChains(driver)
            actions.move_to_element(i)
            actions.click(i)
            actions.perform()


def switch(element, set_bool):
    v = [element.get_attribute("aria-checked"), element.get_attribute("aria-expanded")]
    for i in v:
        if i is not None:
            get_bool = str(i).lower() == "true"
            if get_bool != set_bool:
                element.click()
            return get_bool


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # test()
    driver = create_driver()
    article(
        driver,
        "https://eikaiwa.dmm.com/app/daily-news/article/walking-tree-is-new-zealands-tree-of-the-year/Cav8JCp9Ee-2tBMFdAOKzA"
    )
    # main()

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
