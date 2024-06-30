import datetime
import json

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from collections import Counter, OrderedDict
import os, shutil, time, re, zoneinfo


# Selenium初期化
def refresh_output(move_path=None):
    path_download = os.path.abspath(os.path.join(__file__, "..", "output"))
    if move_path is not None:
        for i in os.scandir(path_download):
            if i.is_file():
                shutil.move(i.path, os.path.abspath(os.path.join(__file__, "..", move_path)))
    shutil.rmtree(path_download)
    os.mkdir(path_download)
    return path_download


def create_driver():
    options = webdriver.ChromeOptions()
    prefs = {"download.default_directory": refresh_output()}
    options.add_experimental_option("prefs", prefs)
    return webdriver.Chrome(options=options)


def get_article_table(driver, url="https://eikaiwa.dmm.com/app/daily-news/search", count_scroll=5):
    ret = []
    driver.get(url)
    time.sleep(5)
    for i in range(count_scroll):
        driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
        time.sleep(3)
    a_elements = driver.find_elements(By.TAG_NAME, "a")
    for i in a_elements:
        href = i.get_attribute("href")
        if "article" in href:
            if maybe_translated(i):
                tokyo_datatime = get_datetime(i).astimezone(datetime.timezone(datetime.timedelta(hours=+9)))
                ret.append([tokyo_datatime.strftime('%Y%m%d'), href])
    return ret


def article(driver, href):
    driver.get(href)
    time.sleep(5)
    get_translated(driver, True)
    name = get_name(driver)
    content = get_content(driver)
    if content:
        path = [__file__, "..", "paper", name]
        os.makedirs(os.path.abspath(os.path.join(*path)), exist_ok=True)
        with open(os.path.abspath(os.path.join(*path, "out.json")), "wt") as f:
            json.dump(content, f, indent=4)
        get_download(driver, os.path.abspath(os.path.join(*path, "out.mp3")))


def test():
    print(datetime.datetime.fromisoformat("2024-06-27T17:00:00.000Z"))


def get_level(element):
    for e in element.find_elements(By.TAG_NAME, "span"):
        for f in e.find_elements(By.TAG_NAME, "div"):
            if re.fullmatch(r"\d", f.text.strip()):
                return int(f.text.strip())


def maybe_translated(element):
    # 2か月前のマイクロプラスチックの記事から7に日本語訳が付かなくなった2024-04-21T17:00:00.000Z
    level = get_level(element)
    timestamp = get_datetime(element)
    return (level <= 6) or (level <= 7 and timestamp <= datetime.datetime.fromisoformat("2024-04-21T17:00:00.000Z"))


def get_datetime(element):
    for e in element.find_elements(By.TAG_NAME, "time"):
        return datetime.datetime.fromisoformat(e.get_attribute("datetime"))


def get_content(element):
    compare_list = []
    for id in ["windowexercise-2", "windowexercise-1", "windowexercise-3", "windowexercise-4"]:
        element_exercise = element.find_element(By.ID, id)
        compare = []
        if "1" in id:
            cs = counter_class(element_exercise.find_elements(By.TAG_NAME, "span"))
            cd = counter_class(element_exercise.find_elements(By.TAG_NAME, "div"))
            if not element:
                print(cs)
                print(cd)
            for e in element_exercise.find_elements(By.CSS_SELECTOR, f"div.{cd[0][0]} > div > span.{cs[0][0]} > span"):
                ep = e.find_element(By.XPATH, "/".join([".."] * 4))
                ej = ep.find_elements(By.CSS_SELECTOR, f"span[lang=ja]")
                compare.append([e.text, str().join(v.text for v in ej)])
        else:
            compare_lang = OrderedDict([('en', []), ('ja', [])])
            for content in element_exercise.find_elements(By.TAG_NAME, "span"):
                lang = (content.get_attribute("lang") or str()).lower()
                if lang in compare_lang.keys():
                    compare_lang[lang].append(content.text)
            compare_lang = list(compare_lang.values())
            if len(compare_lang[0]) == len(compare_lang[1]):
                for v in list(zip(compare_lang[0], compare_lang[1]))[2:]:
                    compare.append(v)
            else:
                return None
        compare_list.append(compare)
    return compare_list


def get_name(driver):
    url_element = driver.current_url.split("/")
    title = url_element[url_element.index("article") + 1]
    for e in driver.find_elements(By.TAG_NAME, "span"):
        if all(i in e.text for i in ["年", "月", "日"]):
            return str().join([i.zfill(2) for i in re.findall(r"\d+", e.text)]) + "_" + title


def get_translated(element, set_bool):
    for i in element.find_elements(By.ID, ":rf:"):
        return switch(i, set_bool)


def get_download(driver, output_path):  # <outpute_path="test/out.mp3"
    for i in driver.find_elements(By.TAG_NAME, "button"):
        if "その他のツール" in (i.get_attribute("aria-label") or str()):
            switch(i, True)
    time.sleep(1)
    for i in driver.find_elements(By.TAG_NAME, "button"):
        if "ダウンロード" in i.text:
            # print(i.rect)
            driver.execute_script(f'window.scrollTo(0, {i.rect["y"]});')
            time.sleep(1)
            refresh_output()
            actions = ActionChains(driver)
            actions.move_to_element(i)
            actions.click(i)
            actions.perform()
            time.sleep(5)
            refresh_output(output_path)


def switch(element, set_bool):
    v = [element.get_attribute("aria-checked"), element.get_attribute("aria-expanded")]
    for i in v:
        if i is not None:
            get_bool = str(i).lower() == "true"
            if get_bool != set_bool:
                element.click()
            return get_bool


def counter(arr):
    counter = Counter(arr)
    sorted_counts = sorted(counter.items(), key=lambda x: x[1], reverse=True)
    return sorted_counts


def counter_class(elements):
    v = [j for j in [i.get_attribute("class") for i in elements] if j]
    return counter(v)

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    test_article = "https://eikaiwa.dmm.com/app/daily-news/article/walking-tree-is-new-zealands-tree-of-the-year/Cav8JCp9Ee-2tBMFdAOKzA"
    driver = create_driver()
    # article(driver, test_article)
    for v in []:#get_article_url(driver):
        print(*v)
    with open("table20240630", "rt") as f:
        for i, line in enumerate(f):
            v=line.strip().split()
            article(driver, v[1])
    driver.quit()

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
